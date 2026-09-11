import express from 'express';
import cors from 'cors';
import routes from './routes';
import { getHealth, getDebugInfo } from './controllers/api.controller';

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Direct health and debug routes
app.get('/health', getHealth);
app.get('/api/health', getHealth);
app.get('/api/debug', getDebugInfo);

// Main API routes
app.use('/api', routes);

export default app;
