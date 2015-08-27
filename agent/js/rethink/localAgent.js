import 'webrtc-adapter';
import Agent from './agent';
import util from './utils/utils';
import ObjectEvent from './utils/objectEvent';
import * as config from './../configs/config';

import signalingBus from './mbus/signalingBus';

export class LocalAgent extends ObjectEvent {

  isInitiator;

  constructor(isInitiator) {

    super();
    var _this = this;
    var autoAccept = true;

    _this.isInitiator = isInitiator;

    var agent = new Agent(isInitiator, autoAccept, signalingBus);
    agent.addEventListener('stream:added', function(stream) {
      _this.trigger('remote:stream:added', stream);
    });

    _this.agent = agent;
  }

  createOffer() {

    var _this = this;
    var agent = _this.agent;

    agent.createOffer();

  }

  addStream(stream) {

    var _this = this;
    var agent = _this.agent;

    _this.stream = stream;

    agent.addStream(stream);

  }

  getStream() {

    var _this = this;
    return _this.stream;

  }

}

export default LocalAgent;
