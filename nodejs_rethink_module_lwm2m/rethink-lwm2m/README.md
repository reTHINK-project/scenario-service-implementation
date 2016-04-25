# reTHINK-lwm2m
This module uses the [lwm2m-node-lib](https://github.com/telefonicaid/lwm2m-node-lib/)-module by Telefonica to provide a lwm2m-server with mongodb backend for a hotel use-case scenario.

Devices and rooms can be initialised with a configuration-object (example in test/config.js).
When started the module will listen for new devices and store information on registration-state, observed values and correlating timestamps from device-objects.

The reTHINK-lwm2m module provides access to all native lwm2m-node-lib functions.

## Usage
The module requires NodeJS version 4.4.1 or greater. This is usually not shipped with common linux distributions such as Ubuntu. Therefore I recommend using [Node Version Manager (nvm)](https://github.com/creationix/nvm) to install the latest stable version.
A MongoDB-server is required for the module to store data. On Ubuntu you can install it like so:
```bash
sudo apt-get install mongodb
```
### Server Start / Stop
```javascript
import lwm2m from 'rethink-lwm2m'
```

```javascript
lwm2m.setConfig(config); //Set configuration before start
lwm2m.start()
    .catch(function (error) {
        console.error("Start failed!", error);
    })
    .then(function () {
        console.log("Started!");
    })
```
```javascript
lwm2m.stop()
    .catch(function (error) {
        console.error("Stop failed!", error);
    })
    .then(function () {
        console.log("Stopped!");
    })
```

## Test
To install dependencies run npm in the module-directory:
```bash
npm install
```
If you want to use the http-interface please provide ssl-certificates and set the file-paths in the configuration.

Mocha-tests (npm test) for the module are still under construction so I recommend manual testing using the interactive console:
```bash
test-es5/server-cmd.js
```
Providing es5-sources because the current version of node does not fully support ES6 yet. You can also compile the ES6-code yourself with [babel](https://www.npmjs.com/package/babel-cli)

Once started run 'help' to get a list of available commands.