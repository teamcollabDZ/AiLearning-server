import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import * as dotenv from 'dotenv';
import connectDB from './config/database';
import authRoutes from './routes/auth.routes';
import passport from './config/passport';
import { createServer } from 'http';
import { initializeSocket } from './config/socket';

dotenv.config();

const app: Express = express();
const port = 5000;

// Connect to Database
connectDB().catch(console.error);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
    ],
  })
);
app.use(helmet());
app.use(morgan('dev'));
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to the API' });
});

const httpServer = createServer(app);
export const { io, userSockets } = initializeSocket(httpServer);

// Start server
httpServer.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
