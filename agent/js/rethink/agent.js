import _ from 'underscore';

import 'webrtc-adapter';
import ObjectEvent from './utils/objectEvent';
import config from '../configs/config';

export class Agent extends ObjectEvent {

  /**
   * WebRTC Agent Peer Connectio to create connection
   * @method constructor
   * @param  {Boolean}   isInitiator control if the agent is the initiato of comunication;
   * @param  {Boolean}   autoAccept  auto accept the calling;
   * @param  {Signalign} sb          message bus who handle with offers, answers and ice candidates;
   */
  constructor(isInitiator, autoAccept, sb) {

    super();

    var _this = this;
    _this.haveStream = false;

    // Add Parameters to agent
    _this.sb = _.isUndefined(sb) || _.isNull(sb) ? signalingBus : sb;
    _this.autoAccept = _.isUndefined(autoAccept) || _.isNull(autoAccept) ? false : autoAccept;
    _this.isInitiator = _.isUndefined(isInitiator) || _.isNull(isInitiator) ? false : isInitiator;

    if (_this.sb.constructor.name === 'SignalingBus') {
      _this.isInternal = true;
    } else {
      _this.isInternal = false;
    }

    _this.createPeerConnection();
    _this.sinalingBus();

  }

  createPeerConnection() {

    var _this = this;
    var peerConnection = new RTCPeerConnection(config.iceServersConfig);

    // Add stream to PeerConnection
    peerConnection.addEventListener('addstream', function(event) {
      _this.stream = event.stream;
      _this.haveStream = true;
      _this.trigger('stream:added', URL.createObjectURL(event.stream));
    });

    // Signal Change
    peerConnection.addEventListener('signalingstatechange', function(event) {
      var state;
      if (peerConnection) {
        state = peerConnection.signalingState || peerConnection.readyState;
      }

      // console.info('Offer Signal Change', state);

    });

    // Ice State Callback
    peerConnection.addEventListener('iceconnectionstatechange', function(event) {
      // console.info('Ice Connection Change', event.currentTarget.iceConnectionState);
    });

    peerConnection.addEventListener('icecandidate', function(event) {

      if (!event.candidate) return;

      var ice = {
        type: 'candidate',
        candidate: event.candidate.candidate,
        sdpMid: event.candidate.sdpMid,
        sdpMLineIndex: event.candidate.sdpMLineIndex
      };

      _this.sb.sendMessage(ice);

    });

    _this.peerConnection = peerConnection;

  }

  sinalingBus() {

    var _this = this;
    var peerConnection = _this.peerConnection;

    _this.sb.addEventListener('message', function(message) {

      // console.info('MESSAGE:', message.type, message);

      if (message.type === 'offer' || message.type === 'answer') {

        peerConnection.setRemoteDescription(new RTCSessionDescription(message), function() {}, function(error) {

          console.error('error: ', error);

        });

        if (message.type === 'offer') {

          // console.info('Got ', message.type, '. Sending answer to peer.');

          if (_this.isInternal) {
            _this.createAnswer();
          }

        } else {
          // console.log('Got ', message.type, '.');
        }

      } else if (message.type === 'candidate') {
        peerConnection.addIceCandidate(new RTCIceCandidate({candidate: message.candidate}));
      } else if (message === 'bye') {
        // TODO: cleanup RTC connection?
        // console.log('clean up rtc connections');
      }

    });

  }

  addStream(stream) {

    var _this = this;

    if (_this.peerConnection && stream) {
      // console.log('Add Stream:', stream);
      _this.peerConnection.addStream(stream);

      if (_this.isInitiator && !_this.isInternal) {
        _this.createOffer();
      }

    }

  }

  createOffer() {
    var _this = this;
    var peerConnection = _this.peerConnection;

    peerConnection.createOffer(function(description) {
      _this.onLocalSessionCreated(description);
    }, _this.logError, config.mediaConstraints);

  }

  createAnswer() {
    var _this = this;
    var peerConnection = _this.peerConnection;

    peerConnection.createAnswer(function(description) {
      _this.onLocalSessionCreated(description);
    }, _this.logError, config.mediaConstraints);
  }

  onLocalSessionCreated(description) {

    var _this = this;
    var peerConnection = _this.peerConnection;

    peerConnection.setLocalDescription(description, function() {

      var data = {
        sdp: description.sdp,
        type: description.type
      };

      _this.sb.sendMessage(data);

    }, _this.logError);

  }

  logError(err) {
    console.error(err.toString(), err);
  }

}

export default Agent;
