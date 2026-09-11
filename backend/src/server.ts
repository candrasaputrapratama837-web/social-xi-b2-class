import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDatabase } from './config/database';
import path from 'path';
import express from 'express';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;

async function startServer() {
  // Initialize database connection (MongoDB Atlas with in-memory resilient fallback)
  try {
    await connectDatabase();
  } catch (err: any) {
    console.info('[SERVER] Standalone mode activated with pre-seeded XI-B2 data.');
  }

  // Vite middleware for development vs static build for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SOCIAL XI-B2 MERN Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
