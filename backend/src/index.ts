import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import socketHandler from './socket';
dotenv.config();
const PORT = process.env.PORT || 3001;

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

app.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    ip: req.ip,
    device: req.headers['user-agent'],
  })
});

httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})

socketHandler(io);