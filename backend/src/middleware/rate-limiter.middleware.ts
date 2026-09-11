import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { getIsMongoConnected } from '../config/database';
import { errorResponse } from '../controllers/api.controller';

const memoryStore = new Map<string, { count: number; resetTime: number }>();

const rateLimitSchema = new mongoose.Schema({
  key: { type: String, required: true, index: true, unique: true },
  count: { type: Number, required: true },
  resetTime: { type: Date, required: true, index: { expires: '0s' } }
});
const RateLimit = mongoose.models.RateLimit || mongoose.model('RateLimit', rateLimitSchema);

export const createRateLimiter = (options: { prefix: string, windowMs: number, max: number, message: string }) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Get client IP, supporting proxies
    const ip = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress || 'unknown';
    const key = `${options.prefix}_${typeof ip === 'string' ? ip : ip[0]}`;
    const now = Date.now();

    try {
      if (getIsMongoConnected()) {
        const record = await RateLimit.findOneAndUpdate(
          { key },
          { 
            $inc: { count: 1 },
            $setOnInsert: { resetTime: new Date(now + options.windowMs) }
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        if (record.resetTime.getTime() < now) {
          record.count = 1;
          record.resetTime = new Date(now + options.windowMs);
          await record.save();
        }

        if (record.count > options.max) {
          return errorResponse(res, 429, 'RATE_LIMITED', options.message);
        }
      } else {
        let record = memoryStore.get(key);
        if (!record || record.resetTime < now) {
          record = { count: 0, resetTime: now + options.windowMs };
        }
        record.count += 1;
        memoryStore.set(key, record);

        if (record.count > options.max) {
          return errorResponse(res, 429, 'RATE_LIMITED', options.message);
        }
      }
    } catch (error) {
      console.error('[RateLimiter] Error:', error);
      // Fail open to avoid blocking legitimate users if the limiter crashes
    }
    
    next();
  };
};

export const loginRateLimiter = createRateLimiter({
  prefix: 'login_limit',
  windowMs: 3 * 60 * 1000, // 3 minutes
  max: 5, // 5 attempts
  message: 'Terlalu banyak percobaan login. Silakan coba lagi setelah 3 menit.'
});

export const generalApiLimiter = createRateLimiter({
  prefix: 'api_limit',
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 300, // 300 requests per minute per IP
  message: 'Terlalu banyak permintaan ke server. Silakan tunggu beberapa saat.'
});
