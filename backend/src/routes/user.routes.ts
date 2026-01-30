import { Router, Request, Response } from 'express';
import { query } from '../db/tidb';

const router = Router();

// GET /api/users
router.get('/', async (req: Request, res: Response) => {
    try {
        const users = await query('SELECT id, username, email, role, full_name, created_at FROM users');
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// DELETE /api/users/:id
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

export default router;
