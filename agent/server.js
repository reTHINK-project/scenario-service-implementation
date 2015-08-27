var os = require('os');
var static = require('node-static');
var http = require('http');
var socketIO = require('socket.io');
var _ = require('underscore');

var port = 8080;

var fileServer = new(static.Server)();

var app = http.createServer(function(req, res) {
  fileServer.serve(req, res);
}).listen(port, function() {
  console.log('Server is listening on port: ', port);
});

var clients = {};

var io = socketIO(app);
io.on('connection', function(socket) {

  // convenience function to log server messages on the client
  function log() {
    var array = ['>>> Message from server:'];
    array.push.apply(array, arguments);
    socket.emit('log', array);
    console.log(arguments);
  }

  socket.on('message', function(message, room) {
    log('Client said:', message, room);

    socket.broadcast.emit('message', message);
  });

  socket.on('create or join', function(room, user) {
    log('Request to create or join room ' + room, user);

    var currentRoom = socket.adapter.rooms[room];
    var numClients = currentRoom ? Object.keys(currentRoom).length : 0;

    log('Room ' + room + ' has ' + numClients + ' client(s)');

    if (numClients === 0) {
      var data = {
        creator: true,
        room: room,
        num: numClients,
        clientId: socket.id,
      };

      clients[socket.id] = data;

      socket.join(room);
      socket.emit('created', room, socket.id);
      log(socket.id, 'created ' + room + ' has ' + numClients + ' client(s)');
    } else {

      var to = _.where(clients, {room: room});
      to = _.reduce(to, function(r, o) {
        r.push(o.clientId);
        return r;
      }, []);

      var data = {
        creator: false,
        room: room,
        num: numClients,
        from: socket.id,
        to: to,
      };

      socket.join(room);
      log(socket.id + ' joined in room ' + room + ' has ' + numClients + ' client(s)');
      socket.emit('joined', room, socket.id);
      io.sockets.in(room).emit('ready', data);
      socket.broadcast.in(room).emit('calling', data);
    }

  });

  socket.on('answered', function(data) {
    socket.emit('answered', data);
  });

  socket.on('ipaddr', function() {
    var ifaces = os.networkInterfaces();
    for (var dev in ifaces) {
      ifaces[dev].forEach(function(details) {
        if (details.family == 'IPv4' && details.address != '127.0.0.1') {
          socket.emit('ipaddr', details.address);
        }
      });
    }
  });

});
