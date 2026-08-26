-- Your Hair & Beauty - Complete Seed Data
-- Uses DELETE instead of TRUNCATE to handle foreign keys properly

-- Disable foreign key checks for the entire session
SET FOREIGN_KEY_CHECKS = 0;

-- Clear all tables using DELETE (works better with foreign keys)
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

-- Reset auto-increment counters
ALTER TABLE order_items AUTO_INCREMENT = 1;
ALTER TABLE orders AUTO_INCREMENT = 1;
ALTER TABLE products AUTO_INCREMENT = 1;
ALTER TABLE subcategories AUTO_INCREMENT = 1;
ALTER TABLE categories AUTO_INCREMENT = 1;
ALTER TABLE brands AUTO_INCREMENT = 1;
ALTER TABLE hero_sliders AUTO_INCREMENT = 1;
ALTER TABLE coupons AUTO_INCREMENT = 1;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- CATEGORIES (15)
-- ============================================
INSERT INTO categories (id, name, slug, image) VALUES
(1, 'Hair Care', 'hair-care', '/images/categories/hair-care.jpg'),
(2, 'Wigs', 'wigs', '/images/categories/wigs.jpg'),
(3, 'Hair Extensions', 'hair-extensions', '/images/categories/hair-extensions.jpg'),
(4, 'Braids & Crochet', 'braids-crochet', '/images/categories/braids-crochet.jpg'),
(5, 'Hair Color', 'hair-color', '/images/categories/hair-color.jpg'),
(6, 'Electrical', 'electrical', '/images/categories/electrical.jpg'),
(7, 'Accessories', 'accessories', '/images/categories/accessories.jpg'),
(8, 'Skincare', 'skincare', '/images/categories/skincare.jpg'),
(9, 'Body Care', 'body-care', '/images/categories/body-care.jpg'),
(10, 'Fragrance', 'fragrance', '/images/categories/fragrance.jpg'),
(11, 'Makeup', 'makeup', '/images/categories/makeup.jpg'),
(12, 'Wellness', 'wellness', '/images/categories/wellness.jpg'),
(13, 'Kids', 'kids', '/images/categories/kids.jpg'),
(14, 'Mens', 'mens', '/images/categories/mens.jpg'),
(15, 'Barber', 'barber', '/images/categories/barber.jpg');

-- ============================================
-- SUBCATEGORIES
-- ============================================
INSERT INTO subcategories (category_id, name, slug) VALUES
(1, 'Shampoo', 'shampoo'),
(1, 'Conditioner', 'conditioner'),
(1, 'Treatments', 'treatments'),
(1, 'Oils', 'oils'),
(1, 'Styling', 'styling'),
(1, 'Finishing', 'finishing'),
(1, 'Hair Gel', 'hair-gel'),
(1, 'Adhesives', 'adhesives'),
(2, 'Lace Front', 'lace-front'),
(2, 'HD Lace', 'hd-lace'),
(2, 'Closure', 'closure'),
(2, 'Headband Wigs', 'headband-wigs'),
(3, 'Clip-ins', 'clip-ins'),
(3, 'Tape-ins', 'tape-ins'),
(3, 'Wefts', 'wefts'),
(3, 'Ponytails', 'ponytails'),
(3, 'I-Tips', 'i-tips'),
(4, 'Braiding Hair', 'braiding-hair'),
(4, 'Crochet Braids', 'crochet-braids'),
(4, 'Pre-Stretched', 'pre-stretched'),
(4, 'Locs', 'locs'),
(5, 'Permanent', 'permanent'),
(5, 'Semi-Permanent', 'semi-permanent'),
(5, 'Developer', 'developer'),
(5, 'Bleach', 'bleach'),
(6, 'Hair Dryers', 'hair-dryers'),
(6, 'Straighteners', 'straighteners'),
(6, 'Curlers', 'curlers'),
(6, 'Clippers', 'clippers'),
(7, 'Brushes & Combs', 'brushes-combs'),
(7, 'Hair Tools', 'hair-tools'),
(7, 'Caps & Bonnets', 'caps-bonnets'),
(7, 'Mirrors', 'mirrors'),
(8, 'Cleansers', 'cleansers'),
(8, 'Serums', 'serums'),
(8, 'Moisturizers', 'moisturizers'),
(8, 'Masks', 'masks'),
(9, 'Lotion', 'lotion'),
(9, 'Wash', 'wash'),
(9, 'Scrub', 'scrub'),
(9, 'Oil', 'oil'),
(10, 'Perfume', 'perfume'),
(10, 'Body Mist', 'body-mist'),
(10, 'Cologne', 'cologne'),
(11, 'Face', 'face'),
(11, 'Eyes', 'eyes'),
(11, 'Lips', 'lips'),
(11, 'Brushes', 'brushes'),
(12, 'Supplements', 'supplements'),
(12, 'Aromatherapy', 'aromatherapy'),
(12, 'Bath', 'bath'),
(13, 'Kids Hair Care', 'kids-hair-care'),
(13, 'Kids Styling', 'kids-styling'),
(13, 'Kids Accessories', 'kids-accessories'),
(14, 'Mens Hair Care', 'mens-hair-care'),
(14, 'Mens Styling', 'mens-styling'),
(14, 'Beard Care', 'beard-care'),
(14, 'Shaving', 'shaving'),
(15, 'Clippers & Trimmers', 'clippers-trimmers'),
(15, 'Shears', 'shears'),
(15, 'Capes', 'capes'),
(15, 'Shaving Products', 'shaving-products');

-- ============================================
-- BRANDS
-- ============================================
INSERT INTO brands (id, name, slug, logo) VALUES
(1, 'X-Pression', 'x-pression', '/images/brands/xpression.png'),
(2, 'SheaMoisture', 'sheamoisture', '/images/brands/sheamoisture.png'),
(3, 'Camille Rose', 'camille-rose', '/images/brands/camillerose.png'),
(4, 'CHI', 'chi', '/images/brands/chi.png'),
(5, 'KeraCare', 'keracare', '/images/brands/keracare.png'),
(6, 'Difeel', 'difeel', '/images/brands/difeel.png'),
(7, 'Creme of Nature', 'creme-of-nature', '/images/brands/cremeofnature.jpg'),
(8, 'AS I AM', 'as-i-am', '/images/brands/asiam.png'),
(9, 'Palmers', 'palmers', '/images/brands/palmers.png'),
(10, 'Cantu', 'cantu', '/images/brands/cantu.png'),
(11, 'ORS', 'ors', '/images/brands/ors.png'),
(12, 'Ebin New York', 'ebin-new-york', '/images/brands/ebin.png'),
(13, 'RedOne', 'redone', '/images/brands/redone.png'),
(14, 'Mielle', 'mielle', '/images/brands/mielle.jpg'),
(15, 'The Doux', 'the-doux', '/images/brands/thedoux.png'),
(16, 'African Pride', 'african-pride', '/images/brands/africanpride.png'),
(17, 'Eco Style', 'eco-style', '/images/brands/ecostyle.jpg'),
(18, 'Moroccanoil', 'moroccanoil', '/images/brands/moroccanoil.png'),
(19, 'Biosilk', 'biosilk', '/images/brands/biosilk.jpg'),
(20, 'Colour Wow', 'colour-wow', '/images/brands/colourwow.png'),
(21, 'Jamaican Mango', 'jamaican-mango', '/images/brands/jamaicanmango.jpg'),
(22, 'Just For Me', 'just-for-me', '/images/brands/justforme.png'),
(23, 'Sensationnel', 'sensationnel', '/images/brands/sensationnel.jpg'),
(24, 'TGIN', 'tgin', '/images/brands/tgin.png'),
(25, 'Wahl', 'wahl', '/images/brands/wahl.png'),
(26, 'Andis', 'andis', '/images/brands/andis.jpg'),
(27, 'Red by Kiss', 'red-by-kiss', '/images/brands/redbykiss.png'),
(28, 'Gummy', 'gummy', '/images/brands/gummy.webp'),
(29, 'Dart', 'dart', '/images/brands/dart.png'),
(30, 'Astral', 'astral', '/images/brands/astral.jpeg');

-- ============================================
-- PRODUCTS
-- ============================================
INSERT INTO products (id, name, short_description, description, price, sale_price, stock_quantity, category_id, brand_id, images, badge, is_featured) VALUES
(1, 'Wonder Lace Bond Supreme', 'Professional-grade lace bond adhesive', 'Professional-grade lace bond adhesive for secure wig application. Long-lasting hold that keeps your wig secure all day.', 15.99, NULL, 50, 1, 12, '[\"/images/products/ebin-wonder-lace-bond-supreme.png\"]', 'bestseller', 1),
(2, 'Aqua Hair Wax Bright White', 'Strong hold hair wax for styling', 'Strong hold hair wax for styling and finishing. Gives a clean, fresh look with maximum hold.', 9.99, NULL, 100, 1, 13, '[\"/images/products/redone-aqua-hair-wax-white.png\"]', 'new', 1),
(3, 'Aqua Hair Gel Wax Black', 'Black-tinted gel wax for natural look', 'Black-tinted gel wax for natural-looking hold. Perfect for dark hair styling without residue.', 9.99, NULL, 80, 1, 13, '[\"/images/products/redone-aqua-hair-gel-wax-black.png\"]', NULL, 0),
(4, 'Wonder Lace Bond Active', 'Active formula lace bond for workouts', 'Active formula lace bond for secure hold during workouts and active lifestyles.', 14.99, 12.99, 60, 1, 12, '[\"/images/products/ebin-wonder-lace-bond-active.png\"]', 'sale', 1),
(5, 'Wonder Lace Melt Spray', 'Invisible lace melting spray', 'Invisible lace melting spray for seamless blending. Creates an undetectable hairline.', 12.99, NULL, 75, 1, 12, '[\"/images/products/ebin-wonder-lace-melt-spray.png\"]', NULL, 1);

-- ============================================
-- HERO SLIDERS
-- ============================================
INSERT INTO hero_sliders (id, image, title, description, button_text, button_link, order_index, is_active) VALUES
(1, '/images/hero/hero-moroccanoil.png', 'Moroccanoil Collection', 'Experience the power of argan oil for silky, shiny hair.', 'Shop Moroccanoil', '/shop?brand=Moroccanoil', 1, 1),
(2, '/images/hero/hero-olaplex.png', 'Olaplex Hair Repair', 'The original bond builder for stronger, healthier hair.', 'Shop Olaplex', '/shop?brand=Olaplex', 2, 1),
(3, '/images/hero/hero-thedoux.jpg', 'The Doux Styling', 'Professional quality texture for every curl type.', 'Shop The Doux', '/shop?brand=The+Doux', 3, 1),
(4, '/images/hero/hero-creme-of-nature.jpg', 'Creme of Nature', 'Certified natural ingredients for healthy, beautiful hair.', 'Shop Creme of Nature', '/shop?brand=Creme+of+Nature', 4, 1);

-- ============================================
-- COUPONS
-- ============================================
INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_uses, is_active) VALUES
('WELCOME10', 'percentage', 10.00, 20.00, 100, 1),
('SAVE5', 'fixed', 5.00, 30.00, NULL, 1),
('SUMMER20', 'percentage', 20.00, 50.00, 50, 1);

-- ============================================
-- SETTINGS
-- ============================================
INSERT INTO settings (setting_key, setting_value) VALUES 
('header_text', 'FREE UK DELIVERY ON ORDERS OVER Â£50'),
('free_shipping_threshold', '50'),
('contact_phone', '+44 123 456 7890'),
('contact_email', 'info@yourhairbeauty.co.uk'),
('admin_email', 'yourhairandbeautyuk@gmail.com'),
('instagram_url', 'https://www.instagram.com/yourhairandbeauty1'),
('tiktok_url', 'https://www.tiktok.com/@yourhairandbeauty1?_r=1&_t=ZN-94DcnGT6U7D'),
('google_review_url', 'https://g.page/r/CTlrynC6OrBbEBM/review'),
('store_name', 'Your Hair & Beauty'),
('currency', 'GBP'),
('currency_symbol', 'Â£'),
('address', '123 Beauty Lane, London, UK'),
('vat_number', 'GB123456789');

-- ============================================
-- ADMIN USER (password: admin123)
-- ============================================
UPDATE users SET password_hash = '$2b$12$XFWmJ.aaN75uOI9Sidaoe.mj9ve9qeABcoGdvZTGvK9plmNYacC9W' WHERE email = 'yourhairandbeautyuk@gmail.com';
INSERT IGNORE INTO users (email, password_hash, name, role, status) VALUES 
('yourhairandbeautyuk@gmail.com', '$2b$12$XFWmJ.aaN75uOI9Sidaoe.mj9ve9qeABcoGdvZTGvK9plmNYacC9W', 'Admin User', 'admin', 'active');

-- ============================================
-- VERIFY
-- ============================================
SELECT 'Categories' as 'Table', COUNT(*) as 'Count' FROM categories
UNION ALL SELECT 'Subcategories', COUNT(*) FROM subcategories
UNION ALL SELECT 'Brands', COUNT(*) FROM brands
UNION ALL SELECT 'Products', COUNT(*) FROM products
UNION ALL SELECT 'Hero Sliders', COUNT(*) FROM hero_sliders
UNION ALL SELECT 'Coupons', COUNT(*) FROM coupons
UNION ALL SELECT 'Settings', COUNT(*) FROM settings;

