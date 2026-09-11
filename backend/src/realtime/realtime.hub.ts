import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ACTIVE_BRANCH_ID } from '../config/constants';

const JWT_SECRET = process.env.JWT_SECRET || process.env.AUTH_SECRET || 'xib2-super-secret-key-2026';

export interface SSEClient {
  id: string;
  res: Response;
  branchId: string;
  role: 'ADMIN' | 'STUDENT' | 'GUEST';
  studentId?: string;
  userId?: string;
}

export interface BroadcastOptions {
  eventType: string;
  entityType: string;
  entityId?: string;
  payload: any;
  targetRole?: 'ALL' | 'STUDENT' | 'ADMIN';
}

class RealtimeHub {
  private clients: Map<string, SSEClient> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Send periodic SSE keep-alive heartbeat every 20 seconds
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, 20000);
  }

  /**
   * Handle incoming SSE connection request
   */
  public handleConnection(req: Request, res: Response) {
    const token = (req.query.token as string) || (req.headers.authorization?.replace('Bearer ', ''));
    let branchId = (req.query.branchId as string) || (req.headers['x-branch-id'] as string) || ACTIVE_BRANCH_ID;
    let role: 'ADMIN' | 'STUDENT' | 'GUEST' = 'GUEST';
    let studentId: string | undefined;
    let userId: string | undefined;

    if (token && token !== 'guest-token') {
      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        if (decoded.branchId) branchId = decoded.branchId;
        if (decoded.role?.toLowerCase() === 'admin') {
          role = 'ADMIN';
        } else if (decoded.role?.toLowerCase() === 'siswa' || decoded.role?.toLowerCase() === 'student') {
          role = 'STUDENT';
          studentId = decoded.studentId || decoded.id;
        }
        userId = decoded.id;
      } catch {
        role = 'GUEST';
      }
    }

    // Configure SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable proxy buffering for nginx
    });

    const clientId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const client: SSEClient = { id: clientId, res, branchId, role, studentId, userId };
    this.clients.set(clientId, client);

    // Initial connected handshake message
    const handshake = {
      eventId: `init-${Date.now()}`,
      eventType: 'system.connected',
      entityType: 'system',
      payload: {
        connected: true,
        branchId,
        role,
        clientId,
        serverTime: new Date().toISOString()
      },
      version: 1,
      timestamp: new Date().toISOString()
    };
    res.write(`data: ${JSON.stringify(handshake)}\n\n`);

    req.on('close', () => {
      this.clients.delete(clientId);
    });
  }

  /**
   * Broadcast an event to authorized clients within a branch AFTER successful DB mutation
   */
  public broadcast(branchId: string, options: BroadcastOptions) {
    const event = {
      eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      eventType: options.eventType,
      entityType: options.entityType,
      entityId: options.entityId,
      payload: options.payload,
      targetRole: options.targetRole || 'ALL',
      version: 1,
      timestamp: new Date().toISOString()
    };

    const serialized = `data: ${JSON.stringify(event)}\n\n`;

    for (const [, client] of this.clients) {
      // 1. Branch isolation: client must match branch
      if (client.branchId !== branchId) continue;

      // 2. RBAC filtering: ensure client has required role
      if (options.targetRole === 'ADMIN' && client.role !== 'ADMIN') continue;
      if (options.targetRole === 'STUDENT' && client.role === 'GUEST') continue;

      try {
        client.res.write(serialized);
      } catch (err) {
        console.warn(`[SSE BROADCAST WARNING] Could not send to client ${client.id}:`, err);
      }
    }
  }

  /**
   * Keep-alive ping
   */
  private sendHeartbeat() {
    const ping = `: ping\n\n`;
    for (const [id, client] of this.clients) {
      try {
        client.res.write(ping);
      } catch {
        this.clients.delete(id);
      }
    }
  }

  /**
   * Health metrics for SSE hub
   */
  public getMetrics() {
    return {
      connectedClients: this.clients.size,
      activeBranch: ACTIVE_BRANCH_ID,
      uptimeSeconds: Math.floor(process.uptime())
    };
  }
}

export const realtimeHub = new RealtimeHub();
