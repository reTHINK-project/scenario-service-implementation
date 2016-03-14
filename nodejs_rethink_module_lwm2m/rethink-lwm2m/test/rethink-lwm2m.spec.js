/**
 * Created by pzu on 01.02.16.
 */
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import lwm2m from '../src/index.js';
import config from './config.js';

let expect = chai.expect;
chai.use(chaiAsPromised);


describe('Test module', function () {

    describe('Server start and stop', function () {
        this.timeout(0); //TODO

        it('should set lwm2m-server configuration', function () {
            lwm2m.setConfig(config);
            expect(lwm2m.getConfig()).to.eql(config);
        });

        it('should start and stop lwm2m server', function (done) {
            lwm2m.start(function (error) {
                expect(error).to.not.exist;
                expect(lwm2m.server.isRunning()).to.be.true;

                setTimeout(function () {
                    lwm2m.stop(function (error) {
                        expect(error).to.not.exist;
                        expect(lwm2m.server.isRunning()).to.be.false;
                        done();
                    }, 1000);
                });

            });
        });

        //TODO: Add tests utilising client-script from lwm2m-module (https://github.com/telefonicaid/lwm2m-node-lib/blob/master/bin/iotagent-lwm2m-client.js)
    });
});