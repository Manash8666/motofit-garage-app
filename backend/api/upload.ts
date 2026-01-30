import type { VercelRequest, VercelResponse } from '@vercel/node';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';

// Note: For production, you should use a cloud storage service like AWS S3, Vercel Blob, or similar
// This is a simplified version for local/demo purposes

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // For Vercel deployment, files are typically stored in /tmp
        // In production, integrate with Vercel Blob or cloud storage
        const uploadDir = '/tmp/uploads';

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const form = new IncomingForm({
            uploadDir,
            keepExtensions: true,
            maxFileSize: 10 * 1024 * 1024, // 10MB max
        });

        const [fields, files] = await new Promise<[any, any]>((resolve, reject) => {
            form.parse(req as any, (err, fields, files) => {
                if (err) reject(err);
                else resolve([fields, files]);
            });
        });

        const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;

        if (!uploadedFile) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Validate PDF
        if (!uploadedFile.mimetype?.includes('pdf')) {
            fs.unlinkSync(uploadedFile.filepath);
            return res.status(400).json({ error: 'Only PDF files are allowed' });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const originalName = uploadedFile.originalFilename || 'invoice.pdf';
        const filename = `${timestamp}-${originalName}`;
        const finalPath = path.join(uploadDir, filename);

        // Move file to final location
        fs.renameSync(uploadedFile.filepath, finalPath);

        // In production, upload to cloud storage here
        // const cloudUrl = await uploadToS3(finalPath, filename);

        return res.json({
            success: true,
            message: 'File uploaded successfully',
            filename,
            path: finalPath,
            url: `/uploads/${filename}`, // For local dev
            entity_type: fields.entity_type || 'unknown',
            customer_id: fields.customer_id,
            job_id: fields.job_id
        });

    } catch (error: any) {
        console.error('Upload error:', error);
        return res.status(500).json({ error: error.message || 'Upload failed' });
    }
}
