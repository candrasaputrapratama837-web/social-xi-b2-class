import app from '../backend/src/app';
import { connectDatabase } from '../backend/src/config/database';

// Initialize DB connection in the serverless environment wrapper
let isDbConnected = false;

// Apply a middleware to ensure the database is connected before handling requests
app.use(async (req, res, next) => {
  if (!isDbConnected) {
    try {
      await connectDatabase();
      isDbConnected = true;
    } catch (err) {
      console.error('[Vercel] DB Connection error:', err);
    }
  }
  next();
});

export default app;
