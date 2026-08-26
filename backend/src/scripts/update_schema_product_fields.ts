import { query } from '../config/database';

async function updateSchema() {
    try {
        console.log('Running schema update for product content fields...');

        try {
            await query(`
                ALTER TABLE products
                ADD COLUMN how_to_use TEXT NULL AFTER description
            `);
            console.log('Added how_to_use column to products table');
        } catch (error: any) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('how_to_use column already exists');
            } else {
                throw error;
            }
        }

        console.log('Product content schema update completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Product content schema update failed:', error);
        process.exit(1);
    }
}

updateSchema();
