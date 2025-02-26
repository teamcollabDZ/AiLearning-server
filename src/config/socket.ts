import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

export const initializeSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST'],
    },
  });

  // Store user socket connections
  const userSockets = new Map<string, string>();

  io.on('connection', (socket) => {
    // Authenticate user and store their socket
    socket.on('authenticate', (userId: string) => {
      userSockets.set(userId, socket.id);
      console.log(`User ${userId} connected`);
    });

    socket.on('disconnect', () => {
      // Remove user socket mapping
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          break;
        }
      }
    });
  });

  return { io, userSockets };
};
