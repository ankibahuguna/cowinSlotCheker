Script to check for available slots on https://www.cowin.gov.in/home.



This script runs in the command line and checks for the available slots every 5 seconds and if the slots are available prints the PIN codes(if using with -s and -d flags) and launches the 
[cowin website]: https://selfregistration.cowin.gov.in/	" " in the user's default browser.

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
