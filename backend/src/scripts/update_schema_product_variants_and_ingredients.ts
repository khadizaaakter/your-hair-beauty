import { query } from '../config/database';

async function updateSchema() {
    try {
        console.log('Running schema update for product ingredients + multi-variant orders...');

        try {
            await query(`
                ALTER TABLE products
                ADD COLUMN ingredients TEXT NULL AFTER how_to_use
            `);
            console.log('Added ingredients column to products table');
        } catch (error: any) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('ingredients column already exists');
            } else {
                throw error;
            }
        }

        try {
            await query(`
                ALTER TABLE order_items
                ADD COLUMN selected_variants_json JSON NULL AFTER variant_id
            `);
            console.log('Added selected_variants_json column to order_items table');
        } catch (error: any) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('selected_variants_json column already exists');
            } else {
                throw error;
            }
        }

        console.log('Schema update completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Schema update failed:', error);
        process.exit(1);
    }
}

updateSchema();
