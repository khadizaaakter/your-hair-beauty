-- Clean Database - Only Admin User
-- Run this to clear all data except admin

SET FOREIGN_KEY_CHECKS = 0;

-- Clear all data
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM wishlist;
DELETE FROM addresses;
DELETE FROM products;
DELETE FROM subcategories;
DELETE FROM categories;
DELETE FROM brands;
DELETE FROM hero_sliders;
DELETE FROM coupons;
DELETE FROM settings;

-- Reset auto-increment
ALTER TABLE order_items AUTO_INCREMENT = 1;
ALTER TABLE orders AUTO_INCREMENT = 1;
ALTER TABLE products AUTO_INCREMENT = 1;
ALTER TABLE subcategories AUTO_INCREMENT = 1;
ALTER TABLE categories AUTO_INCREMENT = 1;
ALTER TABLE brands AUTO_INCREMENT = 1;
ALTER TABLE hero_sliders AUTO_INCREMENT = 1;
ALTER TABLE coupons AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;

-- Ensure admin user exists with correct password (admin123)
UPDATE users SET password_hash = '$2b$12$XFWmJ.aaN75uOI9Sidaoe.mj9ve9qeABcoGdvZTGvK9plmNYacC9W' WHERE email = 'yourhairandbeautyuk@gmail.com';
INSERT IGNORE INTO users (email, password_hash, name, role, status) VALUES 
('yourhairandbeautyuk@gmail.com', '$2b$12$XFWmJ.aaN75uOI9Sidaoe.mj9ve9qeABcoGdvZTGvK9plmNYacC9W', 'Admin User', 'admin', 'active');

-- Basic settings
INSERT INTO settings (setting_key, setting_value) VALUES 
('store_name', 'Your Hair & Beauty'),
('currency', 'GBP'),
('currency_symbol', '£');

SELECT 'Database cleaned. Only admin user remains.' as 'Status';
