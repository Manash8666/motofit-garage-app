import { Router, Response } from 'express';
import { getFirestore } from '../config/firebase';
import { authenticateUser, requireRole, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticateUser);
router.use(requireRole('Owner', 'Manager'));

// GET /api/reports/revenue
router.get('/revenue', async (req: AuthRequest, res: Response) => {
    try {
        const db = getFirestore();
        const invoicesSnapshot = await db.collection('invoices').get();

        const invoices = invoicesSnapshot.docs.map(doc => doc.data());
        const totalRevenue = invoices.reduce((sum, inv: any) => sum + (inv.amount || 0), 0);

        res.json({
            totalRevenue,
            invoiceCount: invoices.length,
            invoices: invoices.slice(0, 10) // Last 10 for chart
        });
    } catch (error) {
        console.error('Revenue report error:', error);
        res.status(500).json({ error: 'Failed to generate revenue report' });
    }
});

// GET /api/reports/export/csv
router.get('/export/csv', async (req: AuthRequest, res: Response) => {
    try {
        const db = getFirestore();
        const [jobsSnapshot, invoicesSnapshot] = await Promise.all([
            db.collection('jobs').get(),
            db.collection('invoices').get()
        ]);

        let csv = 'Type,Number,Customer,Amount,Date\n';

        jobsSnapshot.docs.forEach(doc => {
            const job: any = doc.data();
            csv += `Job,${job.jobNo},${job.customer},-,${job.date}\n`;
        });

        invoicesSnapshot.docs.forEach(doc => {
            const inv: any = doc.data();
            csv += `Invoice,${inv.invoiceNo},${inv.customer},${inv.amount},${inv.date}\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=motofit-export.csv');
        res.send(csv);
    } catch (error) {
        console.error('CSV export error:', error);
        res.status(500).json({ error: 'Failed to export CSV' });
    }
});

// GET /api/reports/export/json
router.get('/export/json', async (req: AuthRequest, res: Response) => {
    try {
        const db = getFirestore();
        const collections = ['jobs', 'invoices', 'customers', 'inventory', 'services', 'bikes', 'mechanics'];

        const data: any = {};

        for (const collection of collections) {
            const snapshot = await db.collection(collection).get();
            data[collection] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=motofit-backup.json');
        res.json(data);
    } catch (error) {
        console.error('JSON export error:', error);
        res.status(500).json({ error: 'Failed to export JSON' });
    }
});

export default router;
