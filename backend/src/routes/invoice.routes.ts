import { Router, Response } from 'express';
import { getFirestore } from '../config/firebase';
import { authenticateUser, requireRole, AuthRequest } from '../middleware/auth.middleware';
import { z } from 'zod';

const router = Router();
router.use(authenticateUser);

const invoiceSchema = z.object({
    invoiceNo: z.string(),
    date: z.string(),
    customer: z.string().min(1),
    amount: z.number(),
    discount: z.number().optional(),
    items: z.array(z.object({
        description: z.string(),
        quantity: z.number(),
        price: z.number()
    })).optional()
});

// GET /api/invoices
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const db = getFirestore();
        const snapshot = await db.collection('invoices').orderBy('createdAt', 'desc').get();
        const invoices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(invoices);
    } catch (error) {
        console.error('Get invoices error:', error);
        res.status(500).json({ error: 'Failed to fetch invoices' });
    }
});

// POST /api/invoices
router.post('/', async (req: AuthRequest, res: Response) => {
    try {
        const invoiceData = invoiceSchema.parse(req.body);
        const db = getFirestore();

        const newInvoice = {
            ...invoiceData,
            createdAt: new Date()
        };

        const docRef = await db.collection('invoices').add(newInvoice);
        res.status(201).json({ id: docRef.id, ...newInvoice });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid request data', details: error.errors });
        }
        console.error('Create invoice error:', error);
        res.status(500).json({ error: 'Failed to create invoice' });
    }
});

// GET /api/invoices/:id
router.get('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const db = getFirestore();
        const doc = await db.collection('invoices').doc(id).get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error('Get invoice error:', error);
        res.status(500).json({ error: 'Failed to fetch invoice' });
    }
});

// DELETE /api/invoices/:id
router.delete('/:id', requireRole('Owner', 'Manager'), async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const db = getFirestore();
        await db.collection('invoices').doc(id).delete();
        res.json({ message: 'Invoice deleted successfully' });
    } catch (error) {
        console.error('Delete invoice error:', error);
        res.status(500).json({ error: 'Failed to delete invoice' });
    }
});

export default router;
