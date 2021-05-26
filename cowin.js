const fetch = require("node-fetch");
const open = require("open");
const stateDistrictMap = require("./state-district-map.json");
const cmdArgs = require("command-line-args");
const commandLineUsage = require("command-line-usage");

const optionsDef = [
    {
        name: "help",
        alias: "h",
        description: "Display the params and usage",
        type: Boolean
    },
    {
        name: "date",
        alias: "t",
        description: "Date to check the slots in format MM-DD-YYYY",
        type: String
    },
    {
        name: "refresh",
        alias: "r",
        description: "Refresh interval(defaults to 5 seconds)",
        type: String
    },
    {
        name: "age",
        alias: "a",
        description:
            "Vaccine age group 18 or 45( This is optional and defaults to 18)",
        type: Number
    },
    { name: "state", alias: "s", description: "Your state", type: String },
    {
        name: "district",
        alias: "d",
        description: "Your district",
        type: String
    },
    { name: "pin", alias: "p", description: "Your area pin code", type: Number }
];

const pinger = setInterval(slotChecker, 5000);

const getRequestURL = ({ state, district, pin, date }) => {
    const apiURL =
        "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public";
    const dateFmt = `${date.getDate()}-0${
        date.getMonth() + 1
    }-${date.getFullYear()}`;

    if (pin) {
        return `${apiURL}/calendarByPin?pincode=${pin}&date=${dateFmt}`;
    }

    const { district_id } = getDistrictAndStateCodes(state, district);
    console.log(`Checking for available slots: ${dateFmt}`);

    return `${apiURL}/calendarByDistrict?district_id=${district_id}&date=${dateFmt}`;
};

const getDistrictAndStateCodes = (state, district) => {
    const districts = stateDistrictMap.filter(
        st => st.state_name === state && st["district name"] === district
    );
    if (!districts.length) {
        throw new Error("Invalid state or district name");
        process.exit(1);
    }

    const { "district id": district_id } = districts.pop();
    return { district_id };
};

async function slotChecker() {
    try {
        const options = cmdArgs(optionsDef);
        const usage = commandLineUsage([
            {
                header: "Typical Example",
                content:
                    "cowin -s Uttarakhand -d Dehradun -a 45\n or \n cowin -p 258005"
            },
            {
                header: "Options",
                optionList: optionsDef
            }
        ]);

        if (options.help) {
            console.log(usage);
            process.exit(0);
        }

        const { age = 18, state, district, pin } = options;
        const { date: slotDate } = options;

        const date = slotDate ? new Date(slotDate.trim()) : new Date();

        if (!district && !state && !pin) {
            console.log("Please specify state and district or pincode");
            console.log(usage);
            process.exit(1);
        }

        const response = await fetch(
            getRequestURL({ state, district, pin, date }),
            {
                headers: {
                    accept: "application/json, text/plain, */*",
                    "accept-language":
                        "en-US,en;q=0.9,hi;q=0.8,th;q=0.7,ar;q=0.6,es;q=0.5",
                    "user-agent":
                        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36"
                },
                referrer: "https://www.cowin.gov.in/",
                referrerPolicy: "strict-origin-when-cross-origin",
                body: null,
                method: "GET"
            }
        );

        const slots = await response.json();

        const { centers } = slots;

        const hasDose1Slots = session => session.available_capacity_dose1 > 0;

        const filter18PlusCenters = sessions => {
            return sessions
                .filter(session => session.min_age_limit === age)
                .filter(hasDose1Slots);
        };

        const availableSlots = centers?.filter(center => {
            const validCenters = filter18PlusCenters(center.sessions);
            return validCenters.length > 0;
        });

        if (availableSlots.length) {
            console.log(JSON.stringify(availableSlots, null, " "));
            clearInterval(pinger);
            console.log(
                `Found  slots in pin codes`,
                availableSlots.map(slot => slot.pincode)
            );
            await open("https://selfregistration.cowin.gov.in/");
            return;
        }
        console.log(`No slots were found`);
    } catch (err) {
        console.error(err);
    }
}
