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

  socket.on('join', (user) => {
    if (!user?.email || !user?.displayName) return;
    console.log(`${user.displayName} joined`);
    socket.userEmail = user.email;
    onlineUsers.set(user.email, {
      socketId: socket.id,
      displayName: user.displayName,
    });
    io.emit('user list', Array.from(onlineUsers.entries()).map(([email, data]) => ({
      email,
      displayName: data.displayName
    })));
  });

  socket.on('private message', ({ to, message }) => {
    console.log(`Private message from ${socket.user} to ${to}: ${message}`);
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
