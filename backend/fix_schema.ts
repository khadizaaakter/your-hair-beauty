import { query } from './src/config/database';

async function fixForeignKeys() {
    try {
        console.log("1. Dropping broken foreign key fk_products_subcategory...");
        await query(`ALTER TABLE products DROP FOREIGN KEY fk_products_subcategory`);

        console.log("2. Adding corrected foreign key pointing to subcategories(id)...");
        await query(`
            ALTER TABLE products 
            ADD CONSTRAINT fk_products_subcategory 
            FOREIGN KEY (subcategory_id) 
            REFERENCES subcategories(id) 
            ON DELETE SET NULL
        `);

        console.log("✅ Successfully corrected the database schema!");

    } catch (e: any) {
        // If it doesn't exist under 'fk_products_subcategory', maybe it's named 'products_ibfk_something'
        console.error("Error occurred. Please verify constraints: ", e);
    } finally {
        process.exit(0);
    }
}

fixForeignKeys();
