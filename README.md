
[![Author](https://img.shields.io/badge/author-9r3i-lightgrey.svg)](https://github.com/9r3i)
[![License](https://img.shields.io/github/license/9r3i/force.svg)](https://github.com/9r3i/force/blob/master/LICENSE)
[![Forks](https://img.shields.io/github/forks/9r3i/force.svg)](https://github.com/9r3i/force/network)
[![Stars](https://img.shields.io/github/stars/9r3i/force.svg)](https://github.com/9r3i/force/stargazers)
[![Issues](https://img.shields.io/github/issues/9r3i/force.svg)](https://github.com/9r3i/force/issues)
[![Release](https://img.shields.io/github/release/9r3i/force.svg)](https://github.com/9r3i/force/releases)
[![Donate](https://img.shields.io/badge/donate-paypal-orange.svg)](https://paypal.me/9r3i)


# Force
The 6th generation of my works, project F (foxtrot).

See also [Eday](https://github.com/9r3i/eday) for the 5th generation of my works.


# Usage
It's very simple
```js
// app namespace website as https://github.com/force-website
const app=(new Force).app('website','https://9r3i.github.io/force-website');
app.init();
```


# The Function
Force is defined as constant ```function``` in global scope. Force must be called as **class** to use its methods and properties, just like this sample.
```js
const force = new Force();
```


# Properies
- ```version``` string of Force release version (readonly)
- ```host``` string of ForceServer host to fetch API
- ```pkey``` string of privilage key, given by ForceServer as logged in
- ```loadedApp``` object of loaded app, after app commit ```init```
- ```plugin``` object of Force app plugins set, See [plugin object](#plugin-object) section


# Methods
- ```app``` function of app initialization, See [app method](#app-method) section
- ```get``` promise function to fetch data without host, parameters:
  - ```url``` string of url
  - ```upl``` function of upload progress callback
  - ```dnl``` function of download progress callback
  - ```dta``` object of data to be queried in url
- ```fetch``` function of xhr to fetch some data from initial host with ForceServer default method, parameters:
  - ```mt``` string of method of object class; ***required**
  - ```dt``` object of data request
  - ```cf``` object of other configs, as the following:
    - ```method``` string of request method; default: ```POST```
    - ```host``` string of host (overwrite this.host)
    - ```headers``` object of headers
    - ```upload``` function of upload callback
    - ```download``` function of download callback
    - ```underfour``` function of underfour callback
- ```post``` function of xhr stream, parameters:
  - ```mt``` string of method of object class; ***required**
  - ```cb``` function of callback
  - ```dt``` object of data request
  - ```cf``` object of other configs, as the following:
    - ```method``` string of request method; default: ```POST```
    - ```host``` string of host
    - ```headers``` object of headers
    - ```upload``` function of upload callback
    - ```download``` function of download callback
    - ```underfour``` function of underfour callback
- ```alert``` promise function of alert dialog. This is just like ```window.alert``` but in DOM scope. ***requires** ```dialogCSS``` to initialize the style, parameters:
  - ```text``` string of text to print in alert dialog
- ```confirm``` promise function of confirm, see ```alert```, parameters:
  - ```text``` string of text to print in alert dialog
- ```prompt``` promise function of prompt, see ```alert```, parameters:
  - ```text``` string of text to print in alert dialog
  - ```def``` string of default text value
- ```dialogAlert``` function of alert, this is non-promise version of the ```alert``` method, parameters:
  - ```text``` string of text to print in alert dialog
  - ```cb``` function of callback
- ```dialogConfirm``` function of confirm, this is non-promise version of the ```confirm``` method, parameters:
  - ```text``` string of text to print in alert dialog
  - ```cb``` function of callback
- ```dialogPrompt``` function of prompt, this is non-promise version of the ```prompt``` method, parameters:
  - ```text``` string of text to print in alert dialog
  - ```cb``` function of callback
  - ```def``` string of default text value
  - ```type``` string of input type; default: ```text```
  - ```holder``` string of input placeholder
- ```virtualFileClearance``` function of clearance. This method is an event-listener to ```touchmove``` of 3 fingers. Then it's gonna ask to ```confirm``` the clearance of all virtual files.
- ```dialog``` function of tiny dialog, parameters:
  - ```text``` string of text message; ***required**
  - ```hold``` bool of holding to show; default: ```false```
  - ```title``` string of dialog title; default: Alert
  - ```oktext``` string of ok text button; default: OK
  - ```bgtap``` bool of background tap to close; default: ```false```
  
  This ```dialog``` method will return the dialog element with special methods:
  - ```close``` function of close the dialog
  - ```show``` function of show the dialog, it wouldn't be necessary if parameter ```hold``` set to ```false```
  - ```addButton``` function of adding a button, parameters:
    - ```cb``` function of callback when the button clicked
    - ```btext``` string of button text; default: Submit
    - ```clr``` string of button color, available in ```dialogCSS```; default: blue
  - ```addInput``` function of adding input, parameters:
    - ```cb``` function of callback when the button clicked
    - ```def``` string of default input text
    - ```type``` string of input type; default: text
    - ```holder``` string of input placeholder
    
    **Note:** This ```addInput``` method will automatically use ```addButton``` as submit, that's why the callback parameter is needed.
- ```splash``` function of splash message, this method requires ```loaderCSS```, parameters:
  - ```str``` mixed of splash message
  - ```t``` int of time message appears in second; default: 3
  - ```limit``` int of nested ```parseJSON``` limit; default: 1
- ```parseJSON``` function of json parse to string, parameters:
  - ```obj``` mixed of object to be parsed to the string
  - ```limit``` int of nested limit; default: 1
  - ```space``` int of space white-break; auto; default: 0
  - ```pad``` int of white-break padding per line; default: 2
- ```stream``` function of basic xhr stream, parameters:
  - ```url``` string of url
  - ```cb``` function of success callback of response code 200
  - ```er``` function of error callback
  - ```dt``` object of data form
  - ```hd``` object of headers
  - ```ul``` function of upload progress
  - ```dl``` function of download progress
  - ```mt``` string of method
  - ```ud4``` function of under-four ready-state


# Stand-Alone Methods
- ```onFunctionReady``` function of ready callback, parameters:
  - ```fn``` string of function name
  - ```cb``` function of callback
  - ```cr``` int of auto-generate progress
- ```virtualFile``` function of storing virtual file, parameters:
  - ```f``` string of filename, or ```false``` to clear all virtual files
  - ```c``` string of content, or ```false``` to delete it
  
  This ```virtualFile``` method is working different,
  - **clear** wipe all virtual files
    ```js
    this.virtualFile(false);
    ```
  - **get** get a virtual file content
    ```js
    this.virtualFile('filename.txt');
    ```
  - **set** set a virtual file with content
    ```js
    this.virtualFile('filename.txt','content');
    ```
  - **delete** delete a virtual file
    ```js
    this.virtualFile('filename.txt',false);
    ```
- ```isScriptLoaded``` function of checking script that was loaded by ```loadScript``` or ```loadScriptFile```, parameters:
  - ```f``` string of file ID
- ```loadScriptFile``` function of script loading, parameters:
  - ```f``` string of file, full with path
- ```loadScript``` function of script loading by string, parameters:
  - ```s``` string of script content
  - ```i``` string of script ID
- ```loadStyleFile``` function of style loading, parameters:
  - ```f``` string of file, full with path
- ```loadStyle``` function of style loading by string, parameters:
  - ```s``` string of style content
  - ```i``` string of style ID
- ```loadModuleFile``` function of module loading, parameters:
  - ```f``` string of file, full with path
- ```loadModule``` function of module loading by string, parameters:
  - ```s``` string of module content
  - ```i``` string of module ID
- ```clearElement``` function of clearing element, parameters:
  - ```el``` object of DOM element
- ```buildElement``` function of element building, parameters:
  - ```tag``` string of tag name
  - ```text``` string of text used by ```innerText```
  - ```attr``` object of attribute used by ```setAttribute```
  - ```children``` array of children elements
  - ```html``` string of html used by ```innerHTML```
  - ```content``` string of content used by ```textContent```
- ```buildQuery``` function of url query builer, parameters:
  - ```data``` object of data
  - ```key``` string of key; auto-generate
- ```parseQuery``` function of url query parser, parameters:
  - ```t``` string of url query
- ```objectLength``` function of object length counter, parameters:
  - ```obj``` object of data to be counted
- ```loader``` function of loader, this method requires ```loaderCSS```, parameters:
  - ```text``` string of loader text, or ```false``` to turn it off
  - ```info``` string of loader information
  - ```value``` int of current value of progress
  - ```max``` int of maximum value of progress
- ```loaderCSS``` function of loader and splash style builder
- ```dialogCSS``` function of dialog style builder
- ```fontCSS``` function of font style string output
- ```absorbEvent``` function of absorbing event, parameters:
  - ```event``` object of event itself
- ```temp``` function of temporary callback, parameters:
  - ```cb``` function of the callback


# app method
This method is to initialize an app, parameters:
- ```ns``` string of app namespace (required)
- ```root``` string of app root; default: apps (local)
- ```config``` mixed of config for inner app (optional)

This ```app``` method has an output as object, properties:
- ```root``` string of app root
- ```namespace``` string of app namespace
- ```config``` string of app config
- ```Force``` object of Force object

And methods:
- ```init``` async function of initialize of app object
- ```cacheExpired``` function of cache expiration checking

Some of app is very simple to call, like this sample:
```js
const app=(new Force).app(<app_namespace>);
await app.init();
```


# plugin object
This property is special, object plugin to help loaded app fulfill its goal.

### plugin properties
- ```root``` string of plugin root; default: plugins (local)
- ```plug``` array of namespaces that has been registered
- ```param``` object of registered plugin parameter
- ```hosts``` object of registered plugin host
- ```Force``` object of Force object
- ```config``` object of Force config of cache

### plugin methods
- ```register``` function of registering a plugin or more to be registered, return this self plugin object, parameters:
  - ```ns``` string of plugin namespace, or array of plugins set
  - ```pr``` mixed of plugin parameters
  - ```host``` string of plugin host
- ```cacheExpired``` function of cache expiration checking
- ```prepare``` async function of plugins preparation to prepare all registered plugins with process, return this self plugin object, parameters:
  - ```root``` string of plugin root or host
  - ```cb``` function of progress callback
- ```init``` function of initialization to initialize all prepared plugins, return this self plugin object


# Closing
That's all there is to it. Alhamdulillaah...



