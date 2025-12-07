const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

let onlineUsers = {}; // { socket.id: nickname }

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Assign temporary name
    onlineUsers[socket.id] = "User-" + socket.id.slice(0, 4);

    // Notify others that someone joined
    socket.broadcast.emit("user-joined", onlineUsers[socket.id]);

    // Send updated user list to all clients
    io.emit("online-users", Object.values(onlineUsers));

    // Set nickname
    socket.on("set-nickname", (nickname) => {
        onlineUsers[socket.id] = nickname;
        io.emit("online-users", Object.values(onlineUsers));
    });

    // "User typing…" indicator
    socket.on("typing", () => {
        socket.broadcast.emit("user-typing", onlineUsers[socket.id]);
    });

    // Handle chat messages (DO NOT echo back to sender)
    socket.on("chat-message", (msg) => {
        socket.broadcast.emit("chat-message", {
            user: onlineUsers[socket.id],
            message: msg
        });
    });

    // Handle disconnect
    socket.on("disconnect", () => {
        socket.broadcast.emit("user-left", onlineUsers[socket.id]);
        delete onlineUsers[socket.id];
        io.emit("online-users", Object.values(onlineUsers));
    });
});

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
