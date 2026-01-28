import { Router, Response } from 'express';
import { getFirestore } from '../config/firebase';
import { authenticateUser, requireRole, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticateUser);

// Generic CRUD routes for simple collections

// Inventory routes
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const db = getFirestore();
        const snapshot = await db.collection('inventory').get();
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch inventory' });
    }
});

router.post('/', requireRole('Owner', 'Manager'), async (req: AuthRequest, res: Response) => {
    try {
        const db = getFirestore();
        const newItem = { ...req.body, lastUpdated: new Date() };
        const docRef = await db.collection('inventory').add(newItem);
        res.status(201).json({ id: docRef.id, ...newItem });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create item' });
    }
});

router.put('/:id', requireRole('Owner', 'Manager'), async (req: AuthRequest, res: Response) => {
    try {
        const db = getFirestore();
        await db.collection('inventory').doc(req.params.id).update({ ...req.body, lastUpdated: new Date() });
        const updated = await db.collection('inventory').doc(req.params.id).get();
        res.json({ id: updated.id, ...updated.data() });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update item' });
    }
});

router.delete('/:id', requireRole('Owner', 'Manager'), async (req: AuthRequest, res: Response) => {
    try {
        const db = getFirestore();
        await db.collection('inventory').doc(req.params.id).delete();
        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete item' });
    }
});

export default router;
