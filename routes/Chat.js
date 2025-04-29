// socketServer.js
const { createServer } = require('http');
const { Server } = require('socket.io');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const httpServer = createServer(app);
 
 
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',  
    methods: ['GET', 'POST'],
  },
});;

const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join', (username) => {
    console.log(`${username} joined`);
    socket.username = username;
    onlineUsers.set(username, socket.id);
    io.emit('user list', Array.from(onlineUsers.keys()));
  });

  socket.on('private message', ({ to, message }) => {
    console.log(`Private message from ${socket.username} to ${to}: ${message}`);
    const targetSocketId = onlineUsers.get(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit('private message', {
        from: socket.username,
        message,
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`${socket.username} disconnected`);
    if (socket.username) {
      onlineUsers.delete(socket.username);
      io.emit('user list', Array.from(onlineUsers.keys()));
    }
  });
});

httpServer.listen(3001, () => {
  console.log('🔌 Socket.IO server listening on port 3001');
});
