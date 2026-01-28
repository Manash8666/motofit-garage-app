import { Router, Response } from 'express';
import { getFirestore } from '../config/firebase';
import { authenticateUser, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticateUser);

// POST /api/timeclock
router.post('/', async (req: AuthRequest, res: Response) => {
    try {
        const { action } = req.body;

        if (!['IN', 'OUT'].includes(action)) {
            return res.status(400).json({ error: 'Invalid action. Must be IN or OUT' });
        }

        const db = getFirestore();
        const entry = {
            userId: req.user?.id,
            username: req.user?.username,
            action,
            timestamp: new Date()
        };

        const docRef = await db.collection('timeclock').add(entry);
        res.status(201).json({ id: docRef.id, ...entry });
    } catch (error) {
        console.error('Timeclock error:', error);
        res.status(500).json({ error: 'Failed to record time' });
    }
});

// GET /api/timeclock
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const db = getFirestore();
        const snapshot = await db.collection('timeclock').orderBy('timestamp', 'desc').limit(100).get();
        const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(entries);
    } catch (error) {
        console.error('Get timeclock error:', error);
        res.status(500).json({ error: 'Failed to fetch timeclock entries' });
    }
});

export default router;
