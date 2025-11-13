const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

let totalUsers = 0; // global variable to store total users/sockets/clients in the chat

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    socket.on('new user', () => {
        totalUsers = io.engine.clientsCount; // the number of clients/sockets is the same as the number of users
        socket.emit('new user', {nickname: null, text: 'hello and welcome to this chat!', totalUsers: totalUsers}) // send to only the initiating socket
    })

    socket.on('chat message', (msg) => {
        io.emit('chat message', msg); // sends latest chat message to all connected sockets
        io.emit('not typing', '') // sends to everyone that no-one is typing right now, so it clears out 'xxx is typing'
    });

    socket.on('choose name', (name) => {
        totalUsers = io.engine.clientsCount; 
        socket.broadcast.emit('new user', {nickname: name, text: 'has joined the chat', totalUsers: totalUsers}) // sends new user event to all but the initiating socket
        socket.id = name; // stores the user nickname in the socket id so disconnecting prints who left
    });    

    socket.on('typing', (name) => {
        socket.broadcast.emit('user typing', name) // sends to all but the initiating socket which user is typing
        socket.emit('not typing', '') // sends to the initiating socket/client, so it doesn't show '(self) is typing'
    })

    socket.on('disconnect', () => {
        totalUsers--; // io.engine.clientsCount is incorrect at this point, so manually decrease our global counter by one
        socket.broadcast.emit('disconnected', {nickname: socket.id, text: 'has left the chat', totalUsers: totalUsers}) // sends disconnected event to all but the initiating socket
    })
});  

server.listen(3000, () => {
    console.log('listening on *:3000');
});
