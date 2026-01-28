import { Request, Response, NextFunction } from 'express';


import { getPool, queryOne } from '../db/tidb';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        username: string;
        role: string;
        allowed_ips?: string;
    };
}

export const authenticateUser = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.substring(7);

        // Verify token against TiDB users table
        // Note: For this demo, token IS the username. In prod, decode JWT here.
        const user = await queryOne(
            'SELECT id, username, role, allowed_ips FROM users WHERE username = ?',
            [token]
        );

        if (!user) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // IP Whitelisting Check
        if (user.allowed_ips) {
            const clientIp = req.ip || req.socket.remoteAddress || '';
            const allowedList = user.allowed_ips.split(',').map((ip: string) => ip.trim());

            // Handle ::1 (localhost IPv6) mapping to 127.0.0.1 if needed, or just include both in list
            const normalizeIp = (ip: string) => (ip === '::1' ? '127.0.0.1' : ip);

            const normalizedClientIp = normalizeIp(clientIp as string);
            const isAllowed = allowedList.some((ip: string) => normalizeIp(ip) === normalizedClientIp);

            if (!isAllowed) {
                console.warn(`Blocked access for user ${user.username} from IP ${clientIp}`);
                return res.status(403).json({ error: 'Access denied: IP not whitelisted' });
            }
        }

        req.user = {
            id: user.id,
            username: user.username,
            role: user.role,
            allowed_ips: user.allowed_ips
        };

        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ error: 'Authentication failed' });
    }
};

export const requireRole = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        next();
    };
};
