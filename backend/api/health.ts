import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    return res.json({
        status: 'ok',
        message: 'MotoFit API is running',
        timestamp: new Date().toISOString(),
        url: req.url,
        method: req.method
    });
}
