/*
 * Copyright [2015-2017] Fraunhofer Gesellschaft e.V., Institute for
 * Open Communication Systems (FOKUS)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
/*
 * Script for testing the server without test-framework (mocha) but console-prompt.
 */
'use strict';

import lwm2m from "../dist/index.js";
import config from "../config.js";
import cmd from "command-node";

function start() {
    if (lwm2m.server.isRunning()) {
        console.error("rethink-lwm2m start failed! Already running.");
        cmd.prompt();
    }
    else {
        console.log("Starting rethink-lwm2m...");
        lwm2m.setConfig(config);
        lwm2m.start()
            .catch((error) => {
                console.error("rethink-lwm2m start failed!", error);
                cmd.prompt();
            })
            .then(() => {
                console.log("rethink-lwm2m started!");
                cmd.prompt();
            })
    }
}

function stop() {
    if (lwm2m.server.isRunning()) {
        console.log("Stopping rethink-lwm2m...");
        lwm2m.stop()
            .catch((error) => {
                console.error("rethink-lwm2m stop failed!", error);
                cmd.prompt();
            })
            .then(() => {
                console.log("rethink-lwm2m stopped!");
                cmd.prompt();
            });
    }
    else {
        console.error("Can't stop rethink-lwm2m! Not running.");
        cmd.prompt();
    }
}

function write(params) {
    lwm2m.server.write(
        params[0],
        params[1],
        params[2],
        params[3],
        params[4],
        (error) => {
            if (error) {
                console.log("Error while writing resource!", error);
            }
            else {
                console.log("Written resource successfully!");
            }
        })
}

function showConfig() {
    console.log(config);
}

function exit() {
    process.exit(0);
}

var commands = {
    'start': {
        parameters: [],
        description: '\tStart reTHINK-lwm2m',
        handler: start
    },
    'stop': {
        parameters: [],
        description: '\tStop reTHINK-lwm2m',
        handler: stop
    },
    'write': {
        parameters: ['id', 'objectType', 'objectId', 'resourceId', 'value'],
        description: '\tManual lwm2m-write for development-tests',
        handler: write
    },
    'config': {
        parameters: [],
        description: '\tShow current configuration',
        handler: showConfig
    },
    'exit': {
        parameters: [],
        description: '\tExit cmd',
        handler: exit
    }
};
cmd.initialize(commands, 'reTHINK-lwm2m> ');
start();