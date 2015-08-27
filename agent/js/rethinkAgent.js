import ObjectEvent from './rethink/utils/objectEvent';
import LocalAgent from './rethink/localAgent';
import ExternalAgents from './rethink/externalAgents';

import * as config from './configs/config';

class RethinkAgent extends ObjectEvent {

  constructor(isInitiator) {

    super();

    var _this = this;
    
    var localAgent = new LocalAgent(isInitiator);
    localAgent.addEventListener('remote:stream:added', function(stream) {
      _this.trigger('remote:stream:added', stream);
    });

    _this.localAgent = localAgent;

    var externalAgent = new ExternalAgents();

    externalAgent.addEventListener('token:created', function(token) {
      _this.trigger('token:created', token);
    });

    externalAgent.addEventListener('remote:stream:added', function(stream) {
      _this.trigger('remote:stream:added', stream);
      // console.log('remote stream added: ', stream);
    });

    externalAgent.addEventListener('local:stream:added', function(stream) {
      _this.trigger('local:stream:added', stream);
      // console.log('local stream added: ', stream);
    });

    externalAgent.addEventListener('call:incoming', function(data) {
      _this.trigger('call:incoming', data);
    });

    _this.externalAgent = externalAgent;

  }

  getMedia(resources) {

    var _this = this;
    var localAgent = _this.localAgent;
    var externalAgent = _this.externalAgent;
    var requestResources = resources || config.defaultMedia;

    return new Promise(function(resolve, reject) {
      navigator.getUserMedia(requestResources, function(stream) {

        localAgent.addStream(stream);
        localAgent.createOffer();
        resolve(stream);

      }, function(error) {

        reject(error);

      });
    });

  }

  callTo(name, stream) {
    var _this = this;
    var externalAgent = _this.externalAgent;

    externalAgent.callTo(name, stream);

  }

  accept() {
    var _this = this;
    var externalAgent = _this.externalAgent;

    externalAgent.accept();

  }

}

module.exports = RethinkAgent;
window.RethinkAgent = RethinkAgent;
