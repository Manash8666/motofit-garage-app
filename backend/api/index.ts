import { VercelRequest, VercelResponse } from '@vercel/node';

// Minimal handler to test if serverless functions work at all
export default function handler(req: VercelRequest, res: VercelResponse) {
    // Log for debugging
    console.log('API called:', req.method, req.url);

    // Health check endpoint
    if (req.url === '/api/health' || req.url === '/api' || req.url === '/') {
        return res.status(200).json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            message: 'MotoFit API is running',
            env: process.env.NODE_ENV || 'unknown'
        });
    }

    // Echo endpoint for debugging
    if (req.url?.startsWith('/api/echo')) {
        return res.status(200).json({
            method: req.method,
            url: req.url,
            query: req.query,
            envCheck: {
                TIDB_HOST: process.env.TIDB_HOST ? 'SET' : 'NOT SET',
                TIDB_USER: process.env.TIDB_USER ? 'SET' : 'NOT SET',
                TIDB_DATABASE: process.env.TIDB_DATABASE ? 'SET' : 'NOT SET'
            }
        });
    }

    // For all other routes, return 404
    return res.status(404).json({ error: 'Not Found', path: req.url });
}
