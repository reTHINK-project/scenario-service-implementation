import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import lwm2m from "../src/index.js";
import config from "../config.js";

let expect = chai.expect;
chai.use(chaiAsPromised);


describe('Test module', () => {

    describe('Server start and stop', () => {
        //this.timeout(0); //TODO

        it('should set lwm2m-server configuration', () => {
            lwm2m.setConfig(config);
            expect(lwm2m.getConfig()).to.eql(config);
        });

        it('should start and stop lwm2m server', (done) => {
            lwm2m.start()
                .catch((error) => {
                    expect(error).to.not.exist;
                })
                .then(() => {
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