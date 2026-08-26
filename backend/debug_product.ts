import { query } from './src/config/database';
import { generateSlug } from './src/utils/slug';

async function testProductCreation() {
    try {
        console.log("Testing POST /api/admin/products...");
        const name = "Debug Product test " + Date.now();
        const slug = generateSlug(name);

        await query(`
            INSERT INTO products (name, slug, short_description, description, price, sale_price, stock_quantity, category_id, subcategory_id, brand_id, images, badge, is_featured, has_variants)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [name, slug, null, 'Test desc', 10, null, 100, 1, null, 1, JSON.stringify([]), null, 0, 0]);

        console.log("Success! The product went through perfectly.");

    } catch (e: any) {
        console.error("FAILED! MySQL output error: ", e);
    } finally {
        process.exit(0);
    }
}

testProductCreation();
