/**
 * Migration Script: Convert Existing Images to WebP
 * 
 * Scans /uploads/ for .jpg/.jpeg/.png/.gif files,
 * converts each to .webp via sharp,
 * updates all database references,
 * then deletes the original.
 * 
 * Usage: npx ts-node src/scripts/convert-existing-images.ts
 * Or after build: node dist/scripts/convert-existing-images.js
 */

import path from 'path';
import fs from 'fs';
import { query, testConnection } from '../config/database';

// Optional sharp dependency
let sharp: any = null;
try {
    sharp = require('sharp');
} catch (e) {
    // Sharp not available
}

const uploadsDir = path.join(__dirname, '../../uploads');
const CONVERTIBLE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'];

async function convertFile(filePath: string): Promise<{ oldName: string; newName: string; savedBytes: number } | null> {
    const ext = path.extname(filePath).toLowerCase();
    if (!CONVERTIBLE_EXTENSIONS.includes(ext)) return null;

    const basename = path.basename(filePath, ext);
    const newName = `${basename}.webp`;
    const newPath = path.join(uploadsDir, newName);

    // Skip if webp version already exists
    if (fs.existsSync(newPath)) return null;

    try {
        const originalSize = fs.statSync(filePath).size;

        await sharp(filePath)
            .resize({ width: 1200, withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(newPath);

        const newSize = fs.statSync(newPath).size;

        // Delete original
        fs.unlinkSync(filePath);

        return {
            oldName: path.basename(filePath),
            newName,
            savedBytes: originalSize - newSize
        };
    } catch (err) {
        console.error(`  ✗ Failed to convert ${path.basename(filePath)}:`, err);
        // Clean up partial webp if it was created
        if (fs.existsSync(newPath)) {
            try { fs.unlinkSync(newPath); } catch { }
        }
        return null;
    }
}

async function updateDatabaseReferences(oldFilename: string, newFilename: string) {
    const oldUrl = `/uploads/${oldFilename}`;
    const newUrl = `/uploads/${newFilename}`;

    // Products - image column
    await query('UPDATE products SET image = ? WHERE image = ?', [newUrl, oldUrl]);

    // Products - images JSON array column (if exists)
    try {
        await query(`UPDATE products SET images = REPLACE(images, ?, ?) WHERE images LIKE ?`,
            [oldFilename, newFilename, `%${oldFilename}%`]);
    } catch { /* column may not exist */ }

    // Categories
    await query('UPDATE categories SET image = ? WHERE image = ?', [newUrl, oldUrl]);

    // Brands - logo
    await query('UPDATE brands SET logo = ? WHERE logo = ?', [newUrl, oldUrl]);

    // Hero sliders - image
    try {
        await query('UPDATE hero_sliders SET image = ? WHERE image = ?', [newUrl, oldUrl]);
    } catch { /* table may not exist */ }

    // Settings - value (for logo/favicon settings)
    try {
        await query(`UPDATE settings SET \`value\` = ? WHERE \`value\` = ?`, [newUrl, oldUrl]);
    } catch { /* table may not exist */ }
}

async function main() {
    console.log('╔═══════════════════════════════════════════════╗');
    console.log('║   WebP Image Migration Script                 ║');
    console.log('╚═══════════════════════════════════════════════╝\n');

    // Test DB connection
    const dbOk = await testConnection();
    if (!dbOk) {
        console.error('❌ Cannot connect to database. Aborting.');
        process.exit(1);
    }

    if (!fs.existsSync(uploadsDir)) {
        console.log('No uploads directory found. Nothing to convert.');
        process.exit(0);
    }

    const allFiles = fs.readdirSync(uploadsDir);
    const convertibleFiles = allFiles.filter(f => CONVERTIBLE_EXTENSIONS.includes(path.extname(f).toLowerCase()));

    console.log(`📂 Found ${allFiles.length} total files in /uploads/`);
    console.log(`🔄 ${convertibleFiles.length} files need conversion\n`);

    if (convertibleFiles.length === 0) {
        console.log('✅ All images are already WebP. Nothing to do.');
        process.exit(0);
    }

    let converted = 0;
    let failed = 0;
    let totalSaved = 0;

    for (let i = 0; i < convertibleFiles.length; i++) {
        const file = convertibleFiles[i];
        const filePath = path.join(uploadsDir, file);

        process.stdout.write(`  [${i + 1}/${convertibleFiles.length}] ${file} ... `);

        const result = await convertFile(filePath);

        if (result) {
            // Update DB references
            await updateDatabaseReferences(result.oldName, result.newName);
            const savedKB = (result.savedBytes / 1024).toFixed(1);
            console.log(`✓ → ${result.newName} (saved ${savedKB} KB)`);
            converted++;
            totalSaved += result.savedBytes;
        } else {
            console.log('⏭ skipped');
        }
    }

    const totalSavedMB = (totalSaved / (1024 * 1024)).toFixed(2);

    console.log('\n╔═══════════════════════════════════════════════╗');
    console.log(`║ ✅ Conversion complete                         ║`);
    console.log(`║    Converted: ${String(converted).padEnd(6)} files                   ║`);
    console.log(`║    Failed:    ${String(failed).padEnd(6)} files                   ║`);
    console.log(`║    Saved:     ${totalSavedMB.padEnd(6)} MB                      ║`);
    console.log('╚═══════════════════════════════════════════════╝');

    process.exit(0);
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
