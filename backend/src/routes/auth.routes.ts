import { Router, Request, Response } from 'express';
import Parse from 'parse/node';
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Parse SDK for server-side operations
Parse.initialize(
    process.env.PARSE_APP_ID || 'motofit-app',
    '', // JavaScript Key (not needed for server)
    process.env.PARSE_MASTER_KEY || 'motofit-master-key'
);
Parse.serverURL = process.env.PARSE_SERVER_URL || 'http://localhost:5000/api/parse';

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

        // Use Parse User login
        const user = await Parse.User.logIn(username, password);

        // Get session token
        const sessionToken = user.getSessionToken();

        // Return user data
        res.json({
            user: {
                id: user.id,
                username: user.get('username'),
                email: user.get('email') || '',
                role: user.get('role') || 'Staff'
            },
            token: sessionToken
        });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid request data', details: error.errors });
        }

        // Parse error handling
        if (error.code === Parse.Error.OBJECT_NOT_FOUND) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// POST /api/auth/register (Admin only)
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { username, password, role, email } = req.body;

        // Create new Parse User
        const user = new Parse.User();
        user.set('username', username);
        user.set('password', password);
        user.set('email', email || '');
        user.set('role', role || 'Staff');

        await user.signUp();

        res.status(201).json({
            id: user.id,
            username: user.get('username'),
            role: user.get('role'),
            email: user.get('email')
        });
    } catch (error: any) {
        if (error.code === Parse.Error.USERNAME_TAKEN) {
            return res.status(400).json({ error: 'Username already exists' });
        }

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

        // Extract session token from Bearer token
        const sessionToken = authHeader.startsWith('Bearer ')
            ? authHeader.substring(7)
            : authHeader;

        // Become user with session token
        const user = await Parse.User.become(sessionToken);

        res.json({
            id: user.id,
            username: user.get('username'),
            email: user.get('email') || '',
            role: user.get('role') || 'Staff'
        });
    } catch (error: any) {
        if (error.code === Parse.Error.INVALID_SESSION_TOKEN) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

export default router;
