import { Router, Request, Response } from 'express';
import { syncLeads } from '../services/leadSync.service';

const router = Router();

// Endpoint for Vercel Cron
// Vercel sends a specific header 'Authorization' with the CRON_SECRET if configured,
// or we can allow public access if acceptable (or verify Vercel signature)
router.get('/lead-sync', async (req: Request, res: Response) => {
    try {
        console.log('⏰ Cron Trigger: Starting Lead Sync...');
        await syncLeads();
        res.json({ success: true, message: 'Lead sync completed' });
    } catch (error: any) {
        console.error('Cron Error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
