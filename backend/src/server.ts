import express, { Application, Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { ParseServer } from 'parse-server';
import parseConfig from './config/parse-config';
import authRoutes from './routes/auth.routes';
import jobRoutes from './routes/job.routes';
import invoiceRoutes from './routes/invoice.routes';
import inventoryRoutes from './routes/inventory.routes';
import customerRoutes from './routes/customer.routes';
import serviceRoutes from './routes/service.routes';
import bikeRoutes from './routes/bike.routes';
import mechanicRoutes from './routes/mechanic.routes';
import reportRoutes from './routes/report.routes';
import timeclockRoutes from './routes/timeclock.routes';
import quoteRoutes from './routes/quote.routes';
import paymentRoutes from './routes/payment.routes';
import leadRoutes from './routes/lead.routes';
import transactionRoutes from './routes/transaction.routes';
import cronRoutes from './routes/cron.routes';

import { startLeadSync } from './services/leadSync.service';


// Load environment variables
dotenv.config();

// Initialize Parse Server
const parseServer = new (ParseServer as any)(parseConfig);

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/', limiter);

// Mount Parse Server at /api/parse
app.use('/api/parse', parseServer.app);

// Routes (compatibility layer - will migrate to Parse SDK gradually)
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bikes', bikeRoutes);
app.use('/api/mechanics', mechanicRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/timeclock', timeclockRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/cron', cronRoutes);


// Health check
app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        backend: 'Parse Platform',
        database: process.env.DATABASE_URI?.includes('mongodb') ? 'MongoDB' : 'PostgreSQL'
    });
});

// 404 handler
// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    // Resolve path to frontend/dist (assuming structure: root/backend/dist -> root/frontend/dist)
    const frontendPath = path.join(__dirname, '../../frontend/dist');

    // 1. Serve static files
    app.use(express.static(frontendPath));

    // 2. Handle React routing, return index.html for all non-API GET requests
    app.get('*', (req: Request, res: Response) => {
        if (req.path.startsWith('/api')) {
            res.status(404).json({ error: 'API route not found' });
            return;
        }
        res.sendFile(path.join(frontendPath, 'index.html'));
    });
} else {
    // Development 404
    app.use((req: Request, res: Response) => {
        res.status(404).json({ error: 'Not Found' });
    });
}

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📦 Parse Server running at ${parseConfig.serverURL}`);
    console.log(`💾 Database: ${parseConfig.databaseURI}`);
    console.log(`🔑 AppID: ${parseConfig.appId}`);
    console.log(`🔑 MasterKey: ${parseConfig.masterKey}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);

    // Start Background Services
    startLeadSync();
});

export default app;
