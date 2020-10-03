// set up express server
var express = require("express");
var app = express();
var portNum = process.env.PORT || '4500';
var server = app.listen(portNum);
app.use(express.static("public"));

console.log("server running on port: " + portNum);

// set up socket.io on express server
var socket = require("socket.io");
var io = socket(server);

app.get('/', (req,res) => {
    res.render('index.html');
});

io.on('connection', (socket) => {
    console.log("new connection: " + socket.id);

    socket.on('startPos', (data) => {
        socket.broadcast.emit('lock');        // broadcast to all sockets except sender who triggered event
        io.emit('startPos', data);            // broadcast to all sockets, including sender who triggered event
    });

    socket.on('mousePos', (data) => {
        socket.broadcast.emit('lock');
        io.emit('mousePos', data);
    });

    socket.on('finishPos', () => {
        io.emit('finishPos');
    })
});