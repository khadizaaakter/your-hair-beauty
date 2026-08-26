import { query } from '../config/database';

async function addColumn(sql: string, successLabel: string, existsLabel: string) {
    try {
        await query(sql);
        console.log(successLabel);
    } catch (error: any) {
        if (error?.code === 'ER_DUP_FIELDNAME') {
            console.log(existsLabel);
            return;
        }
        throw error;
    }
}

async function runCheckoutDiscountSchemaUpdate() {
    try {
        console.log('Running checkout discount schema update...');

        await addColumn(
            `
                ALTER TABLE orders
                ADD COLUMN subtotal_amount DECIMAL(10,2) DEFAULT NULL AFTER user_id
            `,
            'Added orders.subtotal_amount',
            'orders.subtotal_amount already exists'
        );

        await addColumn(
            `
                ALTER TABLE orders
                ADD COLUMN shipping_amount DECIMAL(10,2) DEFAULT 0.00 AFTER subtotal_amount
            `,
            'Added orders.shipping_amount',
            'orders.shipping_amount already exists'
        );

        await addColumn(
            `
                ALTER TABLE orders
                ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0.00 AFTER shipping_amount
            `,
            'Added orders.discount_amount',
            'orders.discount_amount already exists'
        );

        await addColumn(
            `
                ALTER TABLE orders
                ADD COLUMN first_order_discount_amount DECIMAL(10,2) DEFAULT 0.00 AFTER discount_amount
            `,
            'Added orders.first_order_discount_amount',
            'orders.first_order_discount_amount already exists'
        );

        await addColumn(
            `
                ALTER TABLE orders
                ADD COLUMN coupon_discount_amount DECIMAL(10,2) DEFAULT 0.00 AFTER first_order_discount_amount
            `,
            'Added orders.coupon_discount_amount',
            'orders.coupon_discount_amount already exists'
        );

        await addColumn(
            `
                ALTER TABLE orders
                ADD COLUMN coupon_code VARCHAR(50) DEFAULT NULL AFTER coupon_discount_amount
            `,
            'Added orders.coupon_code',
            'orders.coupon_code already exists'
        );

        console.log('Checkout discount schema update completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Checkout discount schema update failed:', error);
        process.exit(1);
    }
}

runCheckoutDiscountSchemaUpdate();
