var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(`${__dirname}/public`));

app.get('/', function(req, res) {
  res.sendFile(`${__dirname}/index.html`);
});

// on user connect

io.on('connection', onConnection);

http.listen(3000, function() {
  console.log('listening on *:3000');
});

// user connect handler

function onConnection(socket) {
  // let everyone know about the newly-connected user
  socket.broadcast.emit('user connect', `${socket.id} has joined the conversation!`);
  // on user disconnect
  socket.on('disconnect', onDisconnect);
  // on new chat message
  socket.on('chat message', onChatMessage);
  // on user typing
  socket.on('user typing', onUserTyping);
  // on user stopped typing
  socket.on('user stopped typing', onUserStoppedTyping);
}

// user disconnect handler

function onDisconnect(reason) {
  this.broadcast.emit('user disconnect', `${this.id} has left the conversation.`);
}

// new chat message handler

function onChatMessage(msg) {
  this.broadcast.emit('chat message', msg);
}

// user typing handler

function onUserTyping(socketid) {
  this.broadcast.emit('user typing', socketid);
}

// user stopped typing handler

function onUserStoppedTyping(socketid) {
  this.broadcast.emit('user stopped typing', socketid);
}
