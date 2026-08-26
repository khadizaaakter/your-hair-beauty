const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    console.log('Connecting to database...');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'yourhairbeauty'
    });

    try {
        console.log('Adding has_variants column to products table...');
        try {
            await connection.execute('ALTER TABLE products ADD COLUMN has_variants BOOLEAN DEFAULT FALSE;');
            console.log('Successfully added has_variants.');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('Column has_variants already exists.');
            } else {
                throw err;
            }
        }

        console.log('Creating product_variants table...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS product_variants (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_id INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                value VARCHAR(255) NOT NULL,
                color_code VARCHAR(50),
                image VARCHAR(500),
                price_adjustment DECIMAL(10,2) DEFAULT 0,
                stock_quantity INT DEFAULT 0,
                sku VARCHAR(100),
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('Successfully created product_variants.');

        console.log('Adding variant_id column to order_items...');
        try {
            await connection.execute('ALTER TABLE order_items ADD COLUMN variant_id INT NULL;');
            await connection.execute('ALTER TABLE order_items ADD FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL;');
            console.log('Successfully added variant_id to order_items.');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('Column variant_id already exists.');
            } else {
                console.log('Error adding variant_id:', err.message);
            }
        }

        console.log('Migrations finished.');
    } catch (e) {
        console.error('Migration failed:', e);
    } finally {
        await connection.end();
    }
}

migrate();
