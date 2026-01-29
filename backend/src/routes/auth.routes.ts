import { Router, Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { queryOne, query } from '../db/tidb';
import crypto from 'crypto';

const router = Router();

// Login schema
const loginSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(1)
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { username, password } = loginSchema.parse(req.body);

        // 1. Get user from TiDB
        const user = await queryOne(
            'SELECT id, username, password_hash, role, email, allowed_ips FROM users WHERE username = ?',
            [username]
        );

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // 2. Verify Password
        if (user.password_hash) {
            const isValid = await bcrypt.compare(password, user.password_hash);
            if (!isValid) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
        } else {
            // Legacy/Fallback for unhashed (should not happen in prod due to migration, but for safety)
            return res.status(401).json({ error: 'Invalid credentials (legacy)' });
        }

        // 3. Generate Token
        // NOTE: As per auth.middleware.ts, we are using "token = username" for this demo.
        // In a real JWT setup, we would sign a token here.
        const sessionToken = user.username;

        // Return user data
        res.json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email || '',
                role: user.role || 'Staff'
            },
            token: sessionToken
        });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid request data', details: error.errors });
        }
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// POST /api/auth/register (Admin only)
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { username, password, role, email } = req.body;

        // Check if username exists
        const existing = await queryOne('SELECT id FROM users WHERE username = ?', [username]);
        if (existing) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const id = crypto.randomUUID();
        const hashedPassword = await bcrypt.hash(password, 10);

        await query(
            'INSERT INTO users (id, username, password_hash, role, email) VALUES (?, ?, ?, ?, ?)',
            [id, username, hashedPassword, role || 'Staff', email || '']
        );

        res.status(201).json({
            id,
            username,
            role: role || 'Staff',
            email
        });
    } catch (error: any) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// GET /api/auth/me
router.get('/me', async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        // Extract token
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.substring(7)
            : authHeader;

        // In our simple auth, token = username
        const user = await queryOne(
            'SELECT id, username, email, role FROM users WHERE username = ?',
            [token]
        );

        if (!user) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        res.json({
            id: user.id,
            username: user.username,
            email: user.email || '',
            role: user.role || 'Staff'
        });
    } catch (error: any) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

export default router;
