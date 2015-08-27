import io from 'socket.io-client';
import ObjectEvent from '../utils/objectEvent';
import utils from '../utils/utils';
import config from '../../configs/config';

export class SignalingServer extends ObjectEvent {

  data;
  initiators;
  clients;

  constructor() {

    super();

    var _this = this;

    _this.initiators = {};
    _this.clients = {};

    // Connect to the signaling server
    var socket = io(config.rethink.server);

    _this.socket = socket;

    _this.events();
  }

  events() {

    var _this = this;
    var socket = _this.socket;

    socket.on('ipaddr', function(ipaddr) {
      // console.log('Server IP address is: ' + ipaddr);
      _this.updateRoomURL(ipaddr);
    });

    socket.on('created', function(room, clientId) {

      // console.info('Created room', room, '- my client ID is', clientId);

      _this.initiators[clientId] = false;

      var data = {
        creator: true,
        room: room,
        isInitiator: false,
        clientId: clientId,
      };

      _this.clients[clientId] = data;

      _this.trigger('room:created', data);
    });

    socket.on('joined', function(room, clientId) {

      _this.initiators[clientId] = true;

      var data = {
        creator: false,
        room: room,
        isInitiator: true,
        clientId: clientId,
      };

      _this.clients[clientId] = data;

      _this.trigger('room:joined:peer', data);

    });

    socket.on('calling', function(data) {

      console.info('calling: ', data, data.clientId);

      _this.trigger('call:incoming', data);

    });

    socket.on('answered', function(data) {
      console.info('answered from: ', data);
      _this.trigger('call:answered', data);
    });

    socket.on('full', function(room) {
      alert('Room "' + room + '" is full. We will create a new room for you.');
      window.location.hash = '';
      window.location.reload();
    });

    socket.on('ready', function(data) {

      var clientId = data.from;
      var isInitiator = _this.initiators[clientId] ? _this.initiators[clientId] : false;
      data.isInitiator = isInitiator;

      console.info('Ready to create a peer connection where ' , clientId , ' is initiator ', isInitiator);

      _this.trigger('room:ready', data);
    });

    socket.on('log', function(array) {
      // console.log.apply(console, array);
    });

    socket.on('message', function(message) {
      // console.log('Client received message:', message);
      _this.trigger('message', message);
    });

    if (location.hostname.match(/localhost|127\.0\.0/)) {
      socket.emit('ipaddr');
    }

  }

  createIdentity(room) {
    var _this = this;
    _this.joinTo(room);
  }

  joinTo(room, user) {
    var _this = this;

    // Join a room
    _this.socket.emit('create or join', room, user);
  }

  answered(data) {

    var _this = this;

    console.log('Signal Server: ', _this.clients, data);

    _this.socket.emit('answered', data);
  }

  /**
  * Send message to signaling server
  */
  sendMessage(message) {

    var _this = this;
    var socket = _this.socket;

    // console.log('Client sending message: ', message, _this.room);
    socket.emit('message', message, _this.room);
  }

  /**
  * Updates URL on the page so that users can copy&paste it to their peers.
  */
  updateRoomURL(ipaddr) {
    var url;
    return url = config.rethink.server;
  }

}

export default new SignalingServer();
