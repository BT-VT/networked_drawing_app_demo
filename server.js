// set up express server
var express = require("express");
var app = express();
var portNum = 3000;
var server = app.listen(portNum);
app.use(express.static("public"));

console.log("server running on port: " + portNum);

// set up socket.io on express server
var socket = require("socket.io");
var io = socket(server);

app.get('/', (req,res) => {
    res.send('Welcome to Chalkboard');
});

io.on('connection', (socket) => {
    console.log("new connection: " + socket.id);

    socket.on('mousePos', (data) => {
         io.emit('mousePos', data);
         socket.broadcast.emit('lock');
    });

    socket.on('startPos', (data) => {
        io.emit('startPos', data);
        socket.broadcast.emit('lock');
    });

    socket.on('finishPos', () => {
        io.emit('finishPos');
    })
});
