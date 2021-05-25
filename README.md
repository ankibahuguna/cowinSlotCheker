Script to check for available slots for 18+ on https://www.cowin.gov.in/home.  It checks for available slots every 5 seconds and launches the user's default browser with the cowin url as
soon as the slot is found.

Note: Since it, by default, makes requests to cowin APIs every 5 seocnd(feel free to change it in the script), it's recommended to run this just before the slots are reset. Otherwise, it may run into API rate limit problems and your IP may get blocked.

###### Usage:

```
node cowin -s Uttarakhand -d Dehradun -a 45
```

The age defaults to 18.  

It can also be used just with the pin code 



```
node cowin -p 248001
```





It's also available as a globally installable package on [npm](https://www.npmjs.com/package/@ankt/cowin). 

```
  npm install -g @ankt/cowin
```
and then just use as 

```
   cowin -s Uttarakhand -d Dehradun
```

If you do not wish to install it globally then you can also use it as:

```
 npx @ankt/cowin -s Uttarakhand -d Dehradun
```
