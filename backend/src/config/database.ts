import mongoose from 'mongoose';
import { inMemoryStore } from '../store/inMemoryStore';

export const DB_NAME = 'social_xi_b2';

/**
 * Sanitizes MongoDB connection URI by trimming quotes and stripping accidental
 * placeholder brackets (<...>, %3C...%3E) around username or password.
 */
export function sanitizeMongoUri(rawUri: string): string {
  if (!rawUri) return rawUri;
  let clean = rawUri.trim();
  if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) {
    clean = clean.slice(1, -1).trim();
  }
  const match = clean.match(/^(mongodb(?:\+srv)?:\/\/)([^:]+):([^@]+)@(.*)$/);
  if (match) {
    let [ , proto, user, pwd, rest ] = match;
    user = user.replace(/^%3C|^</, '').replace(/%3E$|>$/, '');
    pwd = pwd.replace(/^%3C|^</, '').replace(/%3E$|>$/, '');
    return proto + user + ':' + pwd + '@' + rest;
  }
  return clean;
}

// Fail fast on database queries when disconnected instead of buffering
mongoose.set('bufferCommands', false);

let isConnecting = false;
let hasLoggedOfflineNotice = false;
let reconnectTimer: NodeJS.Timeout | null = null;

/**
 * MongoDB Atlas Connection Manager
 * Enforces authoritative database connectivity, single-connection reuse,
 * and fail-fast validation with resilient in-memory local fallback.
 */
export async function connectDatabase(silent = false): Promise<typeof mongoose | null> {
  // If already connected, reuse existing connection
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  // Prevent concurrent connection attempts
  if (isConnecting) {
    await new Promise((resolve) => {
      const interval = setInterval(() => {
        if ((mongoose.connection.readyState as number) === 1 || !isConnecting) {
          clearInterval(interval);
          resolve(null);
        }
      }, 100);
    });
    if ((mongoose.connection.readyState as number) === 1) return mongoose;
  }

  const rawUri = process.env.MONGODB_URI;
  if (!rawUri || !rawUri.trim()) {
    if (!silent && !hasLoggedOfflineNotice) {
      console.info('[DATABASE] MONGODB_URI is not set. Operating in local in-memory dataset mode.');
      hasLoggedOfflineNotice = true;
    }
    return null;
  }

  const uri = sanitizeMongoUri(rawUri);

  isConnecting = true;
  try {
    const conn = await mongoose.connect(uri, {
      dbName: DB_NAME,
      serverSelectionTimeoutMS: 5000,
      autoIndex: true,
    });
    isConnecting = false;
    const host = conn.connection.host || 'MongoDB Atlas';
    console.info(`[DATABASE] Connected successfully to MongoDB Atlas (host: ${host}, db: ${DB_NAME})`);
    
    // Auto-seed Atlas if collections are empty
    tryAutoSeedAtlas();
    
    return conn;
  } catch (error: any) {
    isConnecting = false;
    const isWhitelistIssue = error.message?.includes('whitelisted') || 
                             error.message?.includes('Could not connect to any servers') ||
                             error.name === 'MongooseServerSelectionError';

    if (!silent && !hasLoggedOfflineNotice) {
      if (isWhitelistIssue) {
        console.info('[DATABASE INFO] MongoDB Atlas is currently in offline/standby mode (IP whitelist required in Atlas Network Access). Application is running with full in-memory dataset (33 siswa XI-B2). To sync with Atlas, add 0.0.0.0/0 to your Atlas cluster Network Access.');
      } else {
        console.warn(`[DATABASE WARNING] MongoDB Atlas connection standby: ${error.message}`);
      }
      hasLoggedOfflineNotice = true;
    }

    // Schedule background auto-reconnect probe
    startAtlasAutoReconnect();

    return null;
  }
}

/**
 * Start background reconnect probe every 60s
 */
export function startAtlasAutoReconnect() {
  if (reconnectTimer) return;
  reconnectTimer = setInterval(async () => {
    if (mongoose.connection.readyState !== 1) {
      await connectDatabase(true);
    } else {
      if (reconnectTimer) {
        clearInterval(reconnectTimer);
        reconnectTimer = null;
      }
    }
  }, 60000);
}

/**
 * Optionally auto-seed Atlas if empty
 */
async function tryAutoSeedAtlas() {
  try {
    const { Student } = await import('../models/Student');
    const count = await Student.countDocuments();
    if (count === 0) {
      console.info('[DATABASE] Initializing empty Atlas database with XI-B2 seeds...');
      const { seedDatabase } = await import('../../../database/seeds/seed');
      await seedDatabase();
    }
  } catch (e) {
    // Non-blocking
  }
}

/**
 * Get current database connection status
 */
export function getDatabaseStatus(): { connected: boolean; status: string; database: string; mode: string } {
  const states: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  const readyState = mongoose.connection.readyState;
  const isConnected = readyState === 1;
  return {
    connected: isConnected,
    status: isConnected ? 'connected' : 'offline_fallback',
    database: DB_NAME,
    mode: isConnected ? 'atlas' : 'in-memory',
  };
}

export function getIsMongoConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

// Ensure in-memory seeds are ready immediately
inMemoryStore.loadInitialSeeds();

// Backward compatibility aliases
export const connectDB = connectDatabase;
export default connectDatabase;

