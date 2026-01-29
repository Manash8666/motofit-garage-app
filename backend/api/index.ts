import { VercelRequest, VercelResponse } from '@vercel/node';
import { connect } from '@tidbcloud/serverless';
import bcrypt from 'bcryptjs';

// Initialize TiDB connection
function getDb() {
    const host = process.env.TIDB_HOST;
    const user = process.env.TIDB_USER;
    const password = process.env.TIDB_PASSWORD;
    const database = process.env.TIDB_DATABASE || 'test';
    const port = process.env.TIDB_PORT || '4000';

    if (!host || !user || !password) {
        throw new Error('TiDB not configured');
    }

    const url = `mysql://${user}:${password}@${host}:${port}/${database}?ssl={"rejectUnauthorized":true}`;
    return connect({ url });
}

// Simple URL router
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const path = req.url || '/';
    console.log(`[API] ${req.method} ${path}`);

    try {
        // Health check
        if (path === '/api/health' || path === '/api' || path === '/') {
            return res.json({
                status: 'ok',
                timestamp: new Date().toISOString(),
                message: 'MotoFit API is running'
            });
        }

        // Login endpoint
        if (path === '/api/auth/login' && req.method === 'POST') {
            return await handleLogin(req, res);
        }

        // Get current user
        if (path === '/api/auth/me' && req.method === 'GET') {
            return await handleGetMe(req, res);
        }

        // Echo/debug endpoint
        if (path.startsWith('/api/echo')) {
            return res.json({
                method: req.method,
                url: path,
                envCheck: {
                    TIDB_HOST: process.env.TIDB_HOST ? 'SET' : 'NOT SET',
                    TIDB_USER: process.env.TIDB_USER ? 'SET' : 'NOT SET'
                }
            });
        }

        // 404 for unknown routes
        return res.status(404).json({ error: 'Not Found', path });

    } catch (error: any) {
        console.error('API Error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}

// Login handler
async function handleLogin(req: VercelRequest, res: VercelResponse) {
    const { username, password } = req.body || {};

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    const db = getDb();

    // Query user
    const users = await db.execute(
        'SELECT id, username, password_hash, role, email FROM users WHERE username = ?',
        [username]
    ) as any[];

    if (!users || users.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Verify password
    if (!user.password_hash) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Return user data (using username as token for simplicity)
    return res.json({
        user: {
            id: user.id,
            username: user.username,
            email: user.email || '',
            role: user.role || 'Staff'
        },
        token: user.username
    });
}

// Get current user handler
async function handleGetMe(req: VercelRequest, res: VercelResponse) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const username = authHeader.substring(7); // Remove "Bearer "
    const db = getDb();

    const users = await db.execute(
        'SELECT id, username, role, email FROM users WHERE username = ?',
        [username]
    ) as any[];

    if (!users || users.length === 0) {
        return res.status(401).json({ error: 'User not found' });
    }

    return res.json({ user: users[0] });
}
