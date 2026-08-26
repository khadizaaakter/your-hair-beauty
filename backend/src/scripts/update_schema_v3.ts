import { query } from '../config/database';

async function updateSchema() {
    try {
        console.log('Running schema update v3...');

        // Add temp_email column to users table
        try {
            await query(`
                ALTER TABLE users 
                ADD COLUMN temp_email VARCHAR(255) NULL AFTER email
            `);
            console.log('Added temp_email column to users table');
        } catch (error: any) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('temp_email column already exists');
            } else {
                throw error;
            }
        }

        console.log('Schema update v3 completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Schema update failed:', error);
        process.exit(1);
    }
}

updateSchema();
