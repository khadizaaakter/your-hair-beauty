import { pool } from '../src/config/database';

async function migrate() {
    try {
        console.log('Migrating brands table...');

        // Add is_active column if it doesn't exist
        await pool.query(`
            ALTER TABLE brands 
            ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE
        `);

        console.log('✅ Added is_active column to brands table');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
