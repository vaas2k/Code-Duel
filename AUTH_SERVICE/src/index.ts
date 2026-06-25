import express, { Application, Request, Response, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import Redis from 'ioredis';
import router from './router/router';
import dotenv from 'dotenv';

dotenv.config();

const app: Application = express();
const server = http.createServer(app);

/* =========================
   Redis Initialization
========================= */
export const redisClient = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
});

redisClient.on('connect', () => console.log(' Redis connected'));
redisClient.on('error', (err) => console.error('Redis error', err));

/* =========================
   Socket.IO Initialization
========================= */
export const socket = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST'],
  },
});

socket.on('connection', (socket) => {
  console.log(`🟢 Socket connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`🔴 Socket disconnected: ${socket.id}`);
  });
});

/* =========================
   Middleware
========================= */
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/* =========================
   Routes
========================= */
app.use(router);

/* =========================
   Health Check
========================= */
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', uptime: process.uptime() });
});

/* =========================
   Global Error Handler
========================= */
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Internal Server Error' });
});

/* =========================
   Server Start
========================= */
const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});
