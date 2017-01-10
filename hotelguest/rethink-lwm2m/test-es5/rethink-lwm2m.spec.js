"use strict";

var _chai = require("chai");

var _chai2 = _interopRequireDefault(_chai);

var _chaiAsPromised = require("chai-as-promised");

var _chaiAsPromised2 = _interopRequireDefault(_chaiAsPromised);

var _index = require("../src/index.js");

var _index2 = _interopRequireDefault(_index);

var _config = require("../config.js");

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var expect = _chai2.default.expect;
_chai2.default.use(_chaiAsPromised2.default);

describe('Test module', function () {

    describe('Server start and stop', function () {
        //this.timeout(0); //TODO

        it('should set lwm2m-server configuration', function () {
            _index2.default.setConfig(_config2.default);
            expect(_index2.default.getConfig()).to.eql(_config2.default);
        });

        it('should start and stop lwm2m server', function (done) {
            _index2.default.start().catch(function (error) {
                expect(error).to.not.exist;
            }).then(function () {
                /*lwm2m.stop()
                    .catch((error) => {
                        expect(error).to.not.exist;
                    })
                    .then(() => {
                        expect(lwm2m.server.isRunning()).to.be.false;
                        done();
                    });*/
            });
        });

        //TODO: Add tests utilising client-script from lwm2m-module (https://github.com/telefonicaid/lwm2m-node-lib/blob/master/bin/iotagent-lwm2m-client.js)
    });
});
//# sourceMappingURL=rethink-lwm2m.spec.js.map