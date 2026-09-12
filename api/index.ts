import app from '../backend/src/app';
import { connectDatabase } from '../backend/src/config/database';

let isDbConnected = false;

export default async function handler(req: any, res: any) {
  if (!isDbConnected) {
    try {
      await connectDatabase();
      isDbConnected = true;
    } catch (err) {
      console.error('[Vercel] DB Connection error:', err);
    }
  }
  return app(req, res);
}
