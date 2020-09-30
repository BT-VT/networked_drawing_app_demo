// set up express server
var express = require("express");
var app = express();
var portNum = 3000
var server = app.listen(portNum);
app.use(express.static("public"));

console.log("server running on port: " + portNum);

// set up socket.io on express server
var socket = require("socket.io");
var io = socket(server);

io.on('connection', (socket) => {
    console.log("new connection: " + socket.id);

    socket.on('startPos', (data) => {
        socket.broadcast.emit('lock');
        io.emit('startPos', data);
    });

    socket.on('mousePos', (data) => {
        socket.broadcast.emit('lock');
        io.emit('mousePos', data);
    });

    socket.on('finishPos', () => {
        io.emit('finishPos');
    })
});
