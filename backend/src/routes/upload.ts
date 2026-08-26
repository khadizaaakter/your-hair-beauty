import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/auth';

// Try to load sharp — if not installed, fall back to saving originals
let sharpModule: any = null;
try {
    sharpModule = require('sharp');
} catch {
    console.warn('⚠️  sharp not installed — uploads will be saved without WebP conversion');
}

const router = Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Use memory storage so we can process with sharp before saving
const storage = multer.memoryStorage();

// File filter for images
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WebP, BMP, and TIFF are allowed.'));
    }
};

// Configure multer
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit (raw, before conversion)
    }
});

/**
 * Convert an image buffer to WebP using sharp (if available).
 * Falls back to saving the original file if sharp is missing.
 */
async function convertToWebP(buffer: Buffer, originalName: string): Promise<{ filename: string; size: number }> {
    if (sharpModule) {
        const filename = `${uuidv4()}.webp`;
        const outputPath = path.join(uploadsDir, filename);
        const info = await sharpModule(buffer)
            .resize({ width: 1200, withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(outputPath);
        return { filename, size: info.size };
    } else {
        // Fallback: save original file as-is
        const ext = path.extname(originalName) || '.jpg';
        const filename = `${uuidv4()}${ext}`;
        const outputPath = path.join(uploadsDir, filename);
        fs.writeFileSync(outputPath, buffer);
        return { filename, size: buffer.length };
    }
}

// POST /api/upload - Upload a single file → converted to WebP
router.post('/', authenticate, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        const { filename, size } = await convertToWebP(req.file.buffer, req.file.originalname);
        const url = `/uploads/${filename}`;

        res.json({
            success: true,
            url,
            filename,
            originalName: req.file.originalname,
            size,
            mimetype: 'image/webp'
        });
    } catch (error: any) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Upload failed'
        });
    }
});

// POST /api/upload/multiple - Upload multiple files → all converted to WebP
router.post('/multiple', authenticate, upload.array('files', 10), async (req, res) => {
    try {
        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No files uploaded'
            });
        }

        const results = await Promise.all(
            files.map(async (file) => {
                const { filename, size } = await convertToWebP(file.buffer, file.originalname);
                return {
                    url: `/uploads/${filename}`,
                    filename,
                    originalName: file.originalname,
                    size
                };
            })
        );

        res.json({
            success: true,
            urls: results.map(r => r.url),
            files: results
        });
    } catch (error: any) {
        console.error('Multiple upload error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Upload failed'
        });
    }
});

export default router;
