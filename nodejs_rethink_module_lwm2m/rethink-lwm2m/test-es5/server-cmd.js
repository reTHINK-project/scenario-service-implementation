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

var _index = require("../dist/index.js");

var _index2 = _interopRequireDefault(_index);

var _config = require("../config.js");

var _config2 = _interopRequireDefault(_config);

var _commandNode = require("command-node");

var _commandNode2 = _interopRequireDefault(_commandNode);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function start() {
    if (_index2.default.server.isRunning()) {
        console.error("rethink-lwm2m start failed! Already running.");
        _commandNode2.default.prompt();
    } else {
        console.log("Starting rethink-lwm2m...");
        _index2.default.setConfig(_config2.default);
        _index2.default.start().catch(function (error) {
            console.error("rethink-lwm2m start failed!", error);
            _commandNode2.default.prompt();
        }).then(function () {
            console.log("rethink-lwm2m started!");
            _commandNode2.default.prompt();
        });
    }
}

function stop() {
    if (_index2.default.server.isRunning()) {
        console.log("Stopping rethink-lwm2m...");
        _index2.default.stop().catch(function (error) {
            console.error("rethink-lwm2m stop failed!", error);
            _commandNode2.default.prompt();
        }).then(function () {
            console.log("rethink-lwm2m stopped!");
            _commandNode2.default.prompt();
        });
    } else {
        console.error("Can't stop rethink-lwm2m! Not running.");
        _commandNode2.default.prompt();
    }
}

function write(params) {
    _index2.default.server.write(params[0], params[1], params[2], params[3], params[4], function (error) {
        if (error) {
            console.log("Error while writing resource!", error);
        } else {
            console.log("Written resource successfully!");
        }
    });
}

function showConfig() {
    console.log(_config2.default);
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
_commandNode2.default.initialize(commands, 'reTHINK-lwm2m> ');
start();
//# sourceMappingURL=server-cmd.js.map