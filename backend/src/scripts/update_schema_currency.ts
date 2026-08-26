import { query } from '../config/database';

async function updateSchema() {
    try {
        console.log('Running schema update for multi-currency...');

        // Add currency column to orders table
        try {
            await query(`
                ALTER TABLE orders 
                ADD COLUMN currency VARCHAR(3) DEFAULT 'GBP' AFTER total_amount
            `);
            console.log('Added currency column to orders table');
        } catch (error: any) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('currency column already exists');
            } else {
                throw error;
            }
        }

        // Add exchange_rate column to orders table
        try {
            await query(`
                ALTER TABLE orders 
                ADD COLUMN exchange_rate DECIMAL(10,4) DEFAULT 1.0000 AFTER currency
            `);
            console.log('Added exchange_rate column to orders table');
        } catch (error: any) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('exchange_rate column already exists');
            } else {
                throw error;
            }
        }

        console.log('Schema update for multi-currency completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Schema update failed:', error);
        process.exit(1);
    }
}

updateSchema();
