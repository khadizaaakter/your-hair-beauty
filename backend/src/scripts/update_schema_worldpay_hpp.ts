import { query } from '../config/database';

async function runWorldpaySchemaUpdate() {
    try {
        console.log('Running Worldpay HPP schema update...');

        try {
            await query(`
                ALTER TABLE orders
                ADD COLUMN currency VARCHAR(3) DEFAULT 'GBP' AFTER total_amount
            `);
            console.log('Added orders.currency');
        } catch (error: any) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('orders.currency already exists');
            } else {
                throw error;
            }
        }

        try {
            await query(`
                ALTER TABLE orders
                ADD COLUMN exchange_rate DECIMAL(10,4) DEFAULT 1.0000 AFTER currency
            `);
            console.log('Added orders.exchange_rate');
        } catch (error: any) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('orders.exchange_rate already exists');
            } else {
                throw error;
            }
        }

        await query(`
            ALTER TABLE orders
            MODIFY COLUMN status ENUM(
                'pending',
                'confirmed',
                'processing',
                'shipped',
                'delivered',
                'cancelled',
                'pending_payment',
                'paid',
                'payment_failed'
            ) DEFAULT 'pending_payment'
        `);
        console.log('Updated orders.status enum for payment lifecycle states');

        await query(`
            CREATE TABLE IF NOT EXISTS payment_attempts (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                transaction_reference VARCHAR(255) NOT NULL,
                status ENUM(
                    'INITIATED',
                    'HPP_SESSION_CREATED',
                    'PROCESSING',
                    'AUTHORIZED',
                    'PAID',
                    'FAILED',
                    'CANCELLED',
                    'EXPIRED',
                    'ERROR'
                ) DEFAULT 'INITIATED',
                worldpay_url TEXT NULL,
                last_event_type VARCHAR(100) NULL,
                last_event_at TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY uniq_transaction_reference (transaction_reference),
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('Ensured payment_attempts table');

        await query(`
            CREATE TABLE IF NOT EXISTS webhook_event_logs (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                event_id VARCHAR(255) NOT NULL,
                transaction_reference VARCHAR(255) NOT NULL,
                type VARCHAR(100) NOT NULL,
                timestamp TIMESTAMP NOT NULL,
                raw_payload JSON NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY uniq_event_id (event_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('Ensured webhook_event_logs table');

        try {
            await query('CREATE INDEX idx_payment_attempt_order ON payment_attempts(order_id)');
            console.log('Created index idx_payment_attempt_order');
        } catch (error: any) {
            if (error.code === 'ER_DUP_KEYNAME') {
                console.log('Index idx_payment_attempt_order already exists');
            } else {
                throw error;
            }
        }

        try {
            await query('CREATE INDEX idx_payment_attempt_status ON payment_attempts(status)');
            console.log('Created index idx_payment_attempt_status');
        } catch (error: any) {
            if (error.code === 'ER_DUP_KEYNAME') {
                console.log('Index idx_payment_attempt_status already exists');
            } else {
                throw error;
            }
        }

        try {
            await query('CREATE INDEX idx_webhook_reference ON webhook_event_logs(transaction_reference)');
            console.log('Created index idx_webhook_reference');
        } catch (error: any) {
            if (error.code === 'ER_DUP_KEYNAME') {
                console.log('Index idx_webhook_reference already exists');
            } else {
                throw error;
            }
        }

        console.log('Worldpay HPP schema update completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Worldpay HPP schema update failed:', error);
        process.exit(1);
    }
}

runWorldpaySchemaUpdate();
