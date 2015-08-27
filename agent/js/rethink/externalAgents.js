import 'webrtc-adapter';
import Agent from './agent';
import util from './utils/utils';
import ObjectEvent from './utils/objectEvent';
import config from '../configs/config';
import _ from 'underscore';

import signalingServer from './mbus/signalingServer';

export class ExternalAgents extends ObjectEvent {

  participants;
  streams;

  /**
   * [constructor description]
   * @method constructor
   * @return {[type]}
   */
  constructor() {

    super();

    var _this = this;

    _this.createToken();
    _this.participants = [];
    _this.streams = {};

    signalingServer.addEventListener('room:ready', function(data) {
      console.info('Room Ready: ', data, _this.participants);

      _this.participant = data;

      for (var i = 0; i < data.num; i++) {
        var generateId = data.clientId;
        _this.createAgent(generateId, data);
      }

    });

    signalingServer.addEventListener('room:created', function(data) {
      _this.owner = data;
      console.info('ROOM CREATED', data);
    });

    signalingServer.addEventListener('room:joined:peer', function(data) {
      _this.isInitiator = true;
      // _this.participant = data,
      console.info('CLIENT JOINED:', data);
      _this.callInProgress = true;
    });

    signalingServer.addEventListener('call:incoming', function(data) {
      _this.participant = data;
      console.log('call incoming from: ', data);
      _this.trigger('call:incoming', data);
    });

    signalingServer.addEventListener('call:answered', function(data) {

      var agents = _.where(_this.participants, {from: data.from});

      console.log(_this.participants, agents, data);

      _.each(agents, function(agent) {
        agent.createAnswer();
      });

    });

  }

  createToken() {

    var _this = this;
    var token = name ? name : util.randomToken();

    setTimeout(function() {
      _this.trigger('token:created', token);
      signalingServer.createIdentity(token);
    });

  }

  createAgent(id, data) {

    var _this = this;
    var autoAccept = false;

    var agent = new Agent(data.isInitiator, autoAccept, signalingServer);
    agent.from = data.from;
    agent.to = data.to;

    agent.addEventListener('stream:added', function(stream) {
      _this.trigger('remote:stream:added', stream);
    });

    _this.participants.push(agent);

    if (agent.isInitiator) {

      console.log("Stream: ", _this.streams, _this.streams[data.from]);

      _this.addStream(_this.streams[data.from]);
    }
  }

  getMedia(resources) {

    var _this = this;
    var requestResources = resources || config.defaultMedia;

    return new Promise(function(resolve, reject) {
      navigator.getUserMedia(requestResources, function(stream) {

        resolve(stream);

      }, function(error) {

        reject(error);

      });
    });

  }

  addStream(stream) {

    var _this = this;
    var participants = _this.participants;

    console.log(_this.participant, participants, _this.owner);

    var agents = _.where(participants, {from: _this.participant.from});

    _.each(agents, function(agent, value) {

      console.info('AGENT: ', agent, stream);
      agent.addStream(stream);

    });

  }

  callTo(room, stream) {

    var _this = this;

    console.log("room: ", room);

    _this.streams[_this.owner.clientId] = stream;
    signalingServer.joinTo(room, _this.owner);

    console.info('call to and get stream: ', _this.participant, _this.owner, _this.streams);

    _this.trigger('local:stream:added', stream);


    /*_this.getMedia().then(function(stream) {

      _this.streams[_this.owner.clientId] = stream;
      signalingServer.joinTo(userId, _this.owner);

      console.info('call to and get stream: ', _this.participant, _this.owner, _this.streams);

      _this.trigger('local:stream:added', stream);

    }, function(error) {

      _this.trigger('local:stream:error', error);

    }); */

  }

  accept() {

    var _this = this;

    console.info('Call is in progress: ', _this.participant, _this.owner);

    if (_this.callInProgresss) {

      console.info('Call is in progress');
      signalingServer.answered(_this.participant);

      return;
    }

    _this.getMedia().then(function(stream) {

      _this.addStream(stream);
      signalingServer.answered(_this.participant);

      _this.callInProgresss = true;

      _this.trigger('local:stream:added', stream);

    }, function(error) {

      _this.trigger('local:stream:error', error);

    });

  }

  leave() {

  }

}

export default ExternalAgents;
