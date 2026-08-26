import { query } from './src/config/database';

async function checkSchema() {
    try {
        console.log("--- Products Table Schema ---");
        const cols = await query(`SHOW FULL COLUMNS FROM products`);
        console.table(cols);

        console.log("\n--- Foreign Keys for products ---");
        const fks = await query<any>(`
            SELECT 
                CONSTRAINT_NAME, 
                COLUMN_NAME, 
                REFERENCED_TABLE_NAME, 
                REFERENCED_COLUMN_NAME
            FROM information_schema.KEY_COLUMN_USAGE
            WHERE TABLE_NAME = 'products' AND TABLE_SCHEMA = 'yourhairbeauty' AND REFERENCED_TABLE_NAME IS NOT NULL;
        `);
        console.table(fks);

    } catch (e: any) {
        console.error("Error: ", e);
    } finally {
        process.exit(0);
    }
}

checkSchema();
