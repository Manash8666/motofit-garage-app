import { Router, Response } from 'express';
import { getFirestore } from '../config/firebase';
import { authenticateUser, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticateUser);

const createCRUDRoutes = (collectionName: string) => {
    const routes = Router();

    routes.get('/', async (req: AuthRequest, res: Response) => {
        try {
            const db = getFirestore();
            const snapshot = await db.collection(collectionName).get();
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            res.json(items);
        } catch (error) {
            res.status(500).json({ error: `Failed to fetch ${collectionName}` });
        }
    });

    routes.post('/', async (req: AuthRequest, res: Response) => {
        try {
            const db = getFirestore();
            const newItem = { ...req.body };
            const docRef = await db.collection(collectionName).add(newItem);
            res.status(201).json({ id: docRef.id, ...newItem });
        } catch (error) {
            res.status(500).json({ error: `Failed to create ${collectionName}` });
        }
    });

    routes.delete('/:id', async (req: AuthRequest, res: Response) => {
        try {
            const db = getFirestore();
            await db.collection(collectionName).doc(req.params.id).delete();
            res.json({ message: 'Deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: `Failed to delete ${collectionName}` });
        }
    });

    return routes;
};

export default createCRUDRoutes('mechanics');
