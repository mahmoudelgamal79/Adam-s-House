-- ============================================================
--  Adam's House — Furniture Showroom
--  Database Schema  ·  SQL Server (T-SQL)
--  Tested on: SQL Server 2019+ / SQL Server Express 17+
--
--  HOW TO RUN:
--  1. Open SSMS and connect to your server
--  2. Open this file and click Execute
--  3. Everything is created automatically
-- ============================================================

-- ── Create the database ───────────────────────────────────────────────────
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'adams_house')
BEGIN
    CREATE DATABASE adams_house
    COLLATE Arabic_CI_AS;
END
GO

USE adams_house;
GO

-- ── Drop tables in reverse dependency order (safe re-run) ─────────────────
IF OBJECT_ID('login_attempts',      'U') IS NOT NULL DROP TABLE login_attempts;
IF OBJECT_ID('customer_sessions',   'U') IS NOT NULL DROP TABLE customer_sessions;
IF OBJECT_ID('manager_sessions',    'U') IS NOT NULL DROP TABLE manager_sessions;
IF OBJECT_ID('order_items',         'U') IS NOT NULL DROP TABLE order_items;
IF OBJECT_ID('orders',              'U') IS NOT NULL DROP TABLE orders;
IF OBJECT_ID('product_colors',      'U') IS NOT NULL DROP TABLE product_colors;
IF OBJECT_ID('product_images',      'U') IS NOT NULL DROP TABLE product_images;
IF OBJECT_ID('products',            'U') IS NOT NULL DROP TABLE products;
IF OBJECT_ID('offers',              'U') IS NOT NULL DROP TABLE offers;
IF OBJECT_ID('categories',          'U') IS NOT NULL DROP TABLE categories;
IF OBJECT_ID('showroom',            'U') IS NOT NULL DROP TABLE showroom;
IF OBJECT_ID('customers',           'U') IS NOT NULL DROP TABLE customers;
IF OBJECT_ID('managers',            'U') IS NOT NULL DROP TABLE managers;
GO

-- Drop views if they exist
IF OBJECT_ID('v_products', 'V') IS NOT NULL DROP VIEW v_products;
IF OBJECT_ID('v_orders',   'V') IS NOT NULL DROP VIEW v_orders;
GO


-- ─────────────────────────────────────────────────────────────
--  1. MANAGERS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE managers (
    id            INT           IDENTITY(1,1) PRIMARY KEY,
    username      NVARCHAR(60)  NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    created_at    DATETIME2     NOT NULL DEFAULT GETDATE()
);
GO

-- Seed: username = admin | password = admin123 (SHA-256)
INSERT INTO managers (username, password_hash) VALUES
    (N'admin', N'240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9');
GO


-- ─────────────────────────────────────────────────────────────
--  2. CUSTOMERS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE customers (
    id            INT           IDENTITY(1,1) PRIMARY KEY,
    name          NVARCHAR(120) NOT NULL,
    email         NVARCHAR(180) NOT NULL,
    phone         NVARCHAR(30)  NOT NULL,
    password_hash NVARCHAR(255) NOT NULL,
    registered_at DATETIME2     NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_customers_email UNIQUE (email)
);
GO

CREATE INDEX IX_customers_email ON customers (email);
GO


-- ─────────────────────────────────────────────────────────────
--  3. CATEGORIES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE categories (
    id          NVARCHAR(60)  NOT NULL PRIMARY KEY,   -- slug e.g. 'master-bedrooms'
    name        NVARCHAR(100) NOT NULL,
    icon        NVARCHAR(80)  NOT NULL DEFAULT N'fa-layer-group',
    description NVARCHAR(MAX) NULL,
    image_key   NVARCHAR(120) NULL,                   -- picsum seed / file path
    sort_order  TINYINT       NOT NULL DEFAULT 0
);
GO

INSERT INTO categories (id, name, icon, description, image_key, sort_order) VALUES
    (N'master-bedrooms', N'Master Bedrooms',   N'fa-bed',          N'Grand beds, wardrobes, and dressers for spacious master suites.', N'cat-large-bed', 1),
    (N'childrens-rooms', N'Children''s Rooms', N'fa-child',         N'Bunk beds, study desks, and playful storage for growing families.', N'cat-kids',     2),
    (N'dining-rooms',    N'Dining Rooms',       N'fa-utensils',      N'Dining tables, chairs, and sideboards for memorable gatherings.',  N'cat-dining',   3),
    (N'salons',          N'Salons',             N'fa-shoe-prints',   N'Elegant entryway storage that keeps footwear organised and hidden.', N'cat-shoe',    4),
    (N'corner-sofas',    N'Corner Sofas',       N'fa-couch',         N'L-shaped and modular corner sofas for comfortable living spaces.',  N'cat-corner',  5),
    (N'living-room',     N'Living Room',        N'fa-chair',         N'Complete salon suites with sofas, armchairs, and coffee tables.',  N'cat-living',   6),
    (N'libraries',       N'Libraries',          N'fa-table-cells',   N'Vitrines, niches, and shelving to showcase your finest pieces.',   N'cat-display',  7);
GO


-- ─────────────────────────────────────────────────────────────
--  4. PRODUCTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE products (
    id          INT           IDENTITY(1,1) PRIMARY KEY,
    slug        NVARCHAR(120) NOT NULL,
    name        NVARCHAR(200) NOT NULL,
    category_id NVARCHAR(60)  NOT NULL,
    price       DECIMAL(10,2) NOT NULL,
    status      NVARCHAR(10)  NOT NULL DEFAULT N'active'
                    CONSTRAINT CHK_products_status CHECK (status IN (N'active', N'draft')),
    on_offer    BIT           NOT NULL DEFAULT 0,
    discount    TINYINT       NOT NULL DEFAULT 0
                    CONSTRAINT CHK_products_discount CHECK (discount BETWEEN 0 AND 99),
    description NVARCHAR(MAX) NULL,
    created_at  DATETIME2     NOT NULL DEFAULT GETDATE(),
    updated_at  DATETIME2     NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_products_slug UNIQUE (slug),
    CONSTRAINT FK_products_category FOREIGN KEY (category_id)
        REFERENCES categories (id) ON UPDATE CASCADE
);
GO

CREATE INDEX IX_products_category ON products (category_id);
CREATE INDEX IX_products_status   ON products (status);
CREATE INDEX IX_products_on_offer ON products (on_offer);
GO

INSERT INTO products (slug, name, category_id, price, status, on_offer, discount, description) VALUES
    (N'vienna-canopy-bed',     N'Vienna Canopy Bed',            N'master-bedrooms', 42000.00, N'active', 1, 20, N'Hand-joined canopy in European walnut with brass fittings. A timeless centrepiece for the principal suite. Dimensions: 180×200 cm.'),
    (N'sofia-dresser',         N'Sofia Dresser',                 N'master-bedrooms', 18500.00, N'active', 1, 15, N'Six-drawer dresser with soft-close runners, crafted from solid oak with hand-rubbed finish.'),
    (N'imperial-wardrobe',     N'Imperial Wardrobe',             N'master-bedrooms', 29500.00, N'active', 0,  0, N'Double-door wardrobe with mirrored panels, hanging rail, and adjustable shelving. Solid walnut construction.'),
    (N'astro-bunk-bed',        N'Astro Bunk Bed',                N'childrens-rooms', 16500.00, N'active', 0,  0, N'Stackable pine bunk with safety rails and integrated ladder. Non-toxic, child-safe finish.'),
    (N'explorer-study-set',    N'Explorer Study Set',            N'childrens-rooms', 12800.00, N'active', 0,  0, N'Desk, bookshelf, and chair set designed for homework and creative play.'),
    (N'rainbow-toy-storage',   N'Rainbow Toy Storage',           N'childrens-rooms',  8900.00, N'active', 1, 10, N'Colorful cubby storage unit with bins for toys, books, and clothes. Rounded edges for safety.'),
    (N'toscana-dining-table',  N'Toscana Dining Table',          N'dining-rooms',    32000.00, N'active', 1, 20, N'Extending solid oak table seating 8 to 12 comfortably. Includes protective felt pads.'),
    (N'luna-dining-chairs',    N'Luna Dining Chairs (Set of 6)', N'dining-rooms',    14400.00, N'active', 0,  0, N'Upholstered dining chairs with curved backrests and solid beech legs. Sold as a set of six.'),
    (N'roma-sideboard',        N'Roma Sideboard',                N'dining-rooms',    22800.00, N'active', 0,  0, N'Wide sideboard with wine rack, drawers, and glass display top. Perfect for formal dining rooms.'),
    (N'sorrento-shoe-cabinet', N'Sorrento Shoe Cabinet',         N'salons',           7200.00, N'active', 0,  0, N'Three-tier tilt-out cabinet hiding up to 18 pairs in elegant walnut veneer.'),
    (N'entry-pro-hall-unit',   N'Entry Pro Hall Unit',           N'salons',          11500.00, N'active', 1, 15, N'Combined shoe rack, coat hooks, and bench seat for your entryway. Space for 24 pairs.'),
    (N'milano-corner-sofa',    N'Milano Corner Sofa',            N'corner-sofas',    38500.00, N'active', 1, 15, N'L-shaped modular corner sofa with down-fill cushions and removable covers.'),
    (N'urban-l-sectional',     N'Urban L-Sectional',             N'corner-sofas',    31200.00, N'active', 0,  0, N'Compact corner sofa ideal for apartments. Chaise module and storage ottoman included.'),
    (N'grand-salon-set',       N'Grand Salon Set',               N'living-room',     54000.00, N'active', 1, 20, N'Three-seat sofa, two armchairs, and coffee table with carved walnut frames.'),
    (N'harmony-lounge-set',    N'Harmony Lounge Set',            N'living-room',     41800.00, N'active', 0,  0, N'Two sofas, one armchair, and nested tables. Contemporary lines with premium fabric upholstery.'),
    (N'verona-display-cabinet',N'Verona Display Cabinet',        N'libraries',       24000.00, N'active', 0,  0, N'Tall vitrine with glass shelves, internal LED lighting, and lockable doors.'),
    (N'gallery-wall-niche',    N'Gallery Wall Niche',            N'libraries',       15600.00, N'active', 1, 12, N'Wall-mounted display niche with adjustable glass shelves and integrated spotlight.');
GO


-- ─────────────────────────────────────────────────────────────
--  5. PRODUCT IMAGES  (position 1 = main/cover photo)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE product_images (
    id         INT           IDENTITY(1,1) PRIMARY KEY,
    product_id INT           NOT NULL,
    image_key  NVARCHAR(200) NOT NULL,
    position   TINYINT       NOT NULL DEFAULT 1,
    CONSTRAINT FK_images_product FOREIGN KEY (product_id)
        REFERENCES products (id) ON DELETE CASCADE
);
GO

CREATE INDEX IX_product_images_product ON product_images (product_id, position);
GO

-- Seed 7 images per product
INSERT INTO product_images (product_id, image_key, position)
SELECT
    p.id,
    stem.prefix + N'-' + CAST(n.pos AS NVARCHAR(1)),
    n.pos
FROM products p
CROSS JOIN (VALUES (1),(2),(3),(4),(5),(6),(7)) AS n(pos)
JOIN (
    SELECT N'vienna-canopy-bed'      AS slug, N'vienna-bed'         AS prefix UNION ALL
    SELECT N'sofia-dresser',                   N'sofia-dresser'                UNION ALL
    SELECT N'imperial-wardrobe',               N'imperial-wardrobe'            UNION ALL
    SELECT N'astro-bunk-bed',                  N'astro-bunk'                   UNION ALL
    SELECT N'explorer-study-set',              N'explorer-study'               UNION ALL
    SELECT N'rainbow-toy-storage',             N'rainbow-storage'              UNION ALL
    SELECT N'toscana-dining-table',            N'toscana-table'                UNION ALL
    SELECT N'luna-dining-chairs',              N'luna-chairs'                  UNION ALL
    SELECT N'roma-sideboard',                  N'roma-sideboard'               UNION ALL
    SELECT N'sorrento-shoe-cabinet',           N'sorrento-shoe'                UNION ALL
    SELECT N'entry-pro-hall-unit',             N'entry-pro'                    UNION ALL
    SELECT N'milano-corner-sofa',              N'milano-corner'                UNION ALL
    SELECT N'urban-l-sectional',               N'urban-sectional'              UNION ALL
    SELECT N'grand-salon-set',                 N'grand-salon'                  UNION ALL
    SELECT N'harmony-lounge-set',              N'harmony-lounge'               UNION ALL
    SELECT N'verona-display-cabinet',          N'verona-vitrine'               UNION ALL
    SELECT N'gallery-wall-niche',              N'gallery-niche'
) AS stem ON p.slug = stem.slug;
GO


-- ─────────────────────────────────────────────────────────────
--  6. PRODUCT COLORS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE product_colors (
    id         INT           IDENTITY(1,1) PRIMARY KEY,
    product_id INT           NOT NULL,
    name       NVARCHAR(80)  NOT NULL,
    hex        NCHAR(7)      NOT NULL,
    CONSTRAINT FK_colors_product FOREIGN KEY (product_id)
        REFERENCES products (id) ON DELETE CASCADE
);
GO

CREATE INDEX IX_product_colors_product ON product_colors (product_id);
GO

INSERT INTO product_colors (product_id, name, hex)
SELECT p.id, c.name, c.hex
FROM products p
JOIN (
    SELECT N'vienna-canopy-bed'      AS slug, N'Walnut'           AS name, N'#5c4033' AS hex UNION ALL
    SELECT N'vienna-canopy-bed',              N'Espresso',                  N'#3b2f2f'         UNION ALL
    SELECT N'vienna-canopy-bed',              N'Ivory White',               N'#f5f0e8'         UNION ALL
    SELECT N'sofia-dresser',                  N'Natural Oak',               N'#c4a35a'         UNION ALL
    SELECT N'sofia-dresser',                  N'Walnut',                    N'#5c4033'         UNION ALL
    SELECT N'imperial-wardrobe',              N'Walnut',                    N'#5c4033'         UNION ALL
    SELECT N'imperial-wardrobe',              N'White Oak',                 N'#e8dcc8'         UNION ALL
    SELECT N'astro-bunk-bed',                 N'Natural Pine',              N'#deb887'         UNION ALL
    SELECT N'astro-bunk-bed',                 N'Sky Blue',                  N'#6b9bd1'         UNION ALL
    SELECT N'astro-bunk-bed',                 N'Soft Pink',                 N'#e8b4b8'         UNION ALL
    SELECT N'explorer-study-set',             N'White',                     N'#f5f5f5'         UNION ALL
    SELECT N'explorer-study-set',             N'Grey Oak',                  N'#8b8680'         UNION ALL
    SELECT N'rainbow-toy-storage',            N'Multi Pastel',              N'#e8b4b8'         UNION ALL
    SELECT N'rainbow-toy-storage',            N'Natural Wood',              N'#deb887'         UNION ALL
    SELECT N'toscana-dining-table',           N'Natural Oak',               N'#c4a35a'         UNION ALL
    SELECT N'toscana-dining-table',           N'Walnut',                    N'#5c4033'         UNION ALL
    SELECT N'toscana-dining-table',           N'Ebony',                     N'#2c2416'         UNION ALL
    SELECT N'luna-dining-chairs',             N'Beige Linen',               N'#d4c5ad'         UNION ALL
    SELECT N'luna-dining-chairs',             N'Charcoal',                  N'#36454f'         UNION ALL
    SELECT N'luna-dining-chairs',             N'Olive',                     N'#6b7c4c'         UNION ALL
    SELECT N'roma-sideboard',                 N'Walnut',                    N'#5c4033'         UNION ALL
    SELECT N'roma-sideboard',                 N'Black',                     N'#1a1a1a'         UNION ALL
    SELECT N'sorrento-shoe-cabinet',          N'Walnut',                    N'#5c4033'         UNION ALL
    SELECT N'sorrento-shoe-cabinet',          N'White Gloss',               N'#fafafa'         UNION ALL
    SELECT N'entry-pro-hall-unit',            N'Grey Oak',                  N'#8b8680'         UNION ALL
    SELECT N'entry-pro-hall-unit',            N'White',                     N'#f5f5f5'         UNION ALL
    SELECT N'milano-corner-sofa',             N'Charcoal',                  N'#36454f'         UNION ALL
    SELECT N'milano-corner-sofa',             N'Sand',                      N'#c9b99a'         UNION ALL
    SELECT N'milano-corner-sofa',             N'Forest Green',              N'#2d4a3e'         UNION ALL
    SELECT N'milano-corner-sofa',             N'Navy',                      N'#1e3a5f'         UNION ALL
    SELECT N'urban-l-sectional',              N'Light Grey',                N'#b0b0b0'         UNION ALL
    SELECT N'urban-l-sectional',              N'Terracotta',                N'#c4725a'         UNION ALL
    SELECT N'grand-salon-set',                N'Walnut & Burgundy',         N'#722f37'         UNION ALL
    SELECT N'grand-salon-set',                N'Oak & Cream',               N'#f0e6d3'         UNION ALL
    SELECT N'harmony-lounge-set',             N'Stone',                     N'#9a9a8e'         UNION ALL
    SELECT N'harmony-lounge-set',             N'Deep Blue',                 N'#2c3e6b'         UNION ALL
    SELECT N'verona-display-cabinet',         N'Walnut',                    N'#5c4033'         UNION ALL
    SELECT N'verona-display-cabinet',         N'Black Lacquer',             N'#1a1a1a'         UNION ALL
    SELECT N'gallery-wall-niche',             N'Walnut',                    N'#5c4033'         UNION ALL
    SELECT N'gallery-wall-niche',             N'Brass & Glass',             N'#a07c4a'
) AS c ON p.slug = c.slug;
GO


-- ─────────────────────────────────────────────────────────────
--  7. OFFERS / PROMOTIONS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE offers (
    id          INT           IDENTITY(1,1) PRIMARY KEY,
    title       NVARCHAR(200) NOT NULL,
    description NVARCHAR(MAX) NULL,
    discount    TINYINT       NOT NULL
                    CONSTRAINT CHK_offers_discount CHECK (discount BETWEEN 1 AND 99),
    valid_until DATE          NULL,
    status      NVARCHAR(10)  NOT NULL DEFAULT N'active'
                    CONSTRAINT CHK_offers_status CHECK (status IN (N'active', N'inactive')),
    created_at  DATETIME2     NOT NULL DEFAULT GETDATE()
);
GO

INSERT INTO offers (title, description, discount, valid_until, status) VALUES
    (N'Summer Collection Sale',  N'Selected pieces from our spring collection at reduced prices.', 20, N'2026-12-31', N'active'),
    (N'Bedroom Suite Bundle',    N'Complete large bedroom set with 15% saving when ordered together.', 15, N'2026-12-31', N'active');
GO


-- ─────────────────────────────────────────────────────────────
--  8. ORDERS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE orders (
    id          INT            IDENTITY(1,1) PRIMARY KEY,
    customer_id INT            NOT NULL,
    total       DECIMAL(12,2)  NOT NULL,
    status      NVARCHAR(20)   NOT NULL DEFAULT N'pending'
                    CONSTRAINT CHK_orders_status CHECK (status IN (N'pending', N'confirmed', N'delivered', N'cancelled')),
    notes       NVARCHAR(MAX)  NULL,
    created_at  DATETIME2      NOT NULL DEFAULT GETDATE(),
    updated_at  DATETIME2      NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_orders_customer FOREIGN KEY (customer_id)
        REFERENCES customers (id)
);
GO

CREATE INDEX IX_orders_customer  ON orders (customer_id);
CREATE INDEX IX_orders_status    ON orders (status);
CREATE INDEX IX_orders_created   ON orders (created_at);
GO


-- ─────────────────────────────────────────────────────────────
--  9. ORDER ITEMS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE order_items (
    id           INT           IDENTITY(1,1) PRIMARY KEY,
    order_id     INT           NOT NULL,
    product_id   INT           NOT NULL,
    product_name NVARCHAR(200) NOT NULL,    -- snapshot at time of order
    unit_price   DECIMAL(10,2) NOT NULL,    -- price after any discount
    quantity     TINYINT       NOT NULL DEFAULT 1,
    colors       NVARCHAR(200) NULL,        -- selected colour names, comma-separated
    CONSTRAINT FK_items_order   FOREIGN KEY (order_id)   REFERENCES orders   (id) ON DELETE CASCADE,
    CONSTRAINT FK_items_product FOREIGN KEY (product_id) REFERENCES products (id)
);
GO

CREATE INDEX IX_order_items_order   ON order_items (order_id);
CREATE INDEX IX_order_items_product ON order_items (product_id);
GO


-- ─────────────────────────────────────────────────────────────
-- 10. SHOWROOM SETTINGS  (always a single row)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE showroom (
    id         TINYINT       NOT NULL PRIMARY KEY DEFAULT 1,
    name       NVARCHAR(150) NOT NULL,
    phone      NVARCHAR(30)  NOT NULL,
    address    NVARCHAR(MAX) NOT NULL,
    updated_at DATETIME2     NOT NULL DEFAULT GETDATE(),
    CONSTRAINT CHK_showroom_single_row CHECK (id = 1)
);
GO

INSERT INTO showroom (id, name, phone, address) VALUES
    (1, N'Eng. Mahmoud El-Gamal', N'01123415353', N'Alexandria, Sidi Bishr Qebli, 181 Gamal Abd El-Nasir');
GO


-- ─────────────────────────────────────────────────────────────
-- 11. MANAGER SESSIONS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE manager_sessions (
    token      NCHAR(64)  NOT NULL PRIMARY KEY,    -- 32 random bytes → 64 hex chars
    manager_id INT        NOT NULL,
    expires_at DATETIME2  NOT NULL,
    created_at DATETIME2  NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_mgr_sessions_manager FOREIGN KEY (manager_id)
        REFERENCES managers (id) ON DELETE CASCADE
);
GO

CREATE INDEX IX_mgr_sessions_expires ON manager_sessions (expires_at);
GO


-- ─────────────────────────────────────────────────────────────
-- 12. CUSTOMER SESSIONS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE customer_sessions (
    token       NCHAR(64)  NOT NULL PRIMARY KEY,
    customer_id INT        NOT NULL,
    expires_at  DATETIME2  NOT NULL,
    created_at  DATETIME2  NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_cust_sessions_customer FOREIGN KEY (customer_id)
        REFERENCES customers (id) ON DELETE CASCADE
);
GO

CREATE INDEX IX_cust_sessions_expires ON customer_sessions (expires_at);
GO


-- ─────────────────────────────────────────────────────────────
-- 13. LOGIN ATTEMPT LOG  (server-side rate limiting)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE login_attempts (
    id           INT           IDENTITY(1,1) PRIMARY KEY,
    identifier   NVARCHAR(200) NOT NULL,    -- email or 'manager:admin'
    ip_address   NVARCHAR(45)  NULL,
    attempted_at DATETIME2     NOT NULL DEFAULT GETDATE(),
    success      BIT           NOT NULL DEFAULT 0
);
GO

CREATE INDEX IX_login_attempts_identifier ON login_attempts (identifier);
CREATE INDEX IX_login_attempts_time       ON login_attempts (attempted_at);
GO


-- ─────────────────────────────────────────────────────────────
-- TRIGGER: auto-update updated_at on products
-- ─────────────────────────────────────────────────────────────
CREATE OR ALTER TRIGGER trg_products_updated_at
ON products
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE products
    SET updated_at = GETDATE()
    WHERE id IN (SELECT id FROM inserted);
END;
GO

-- TRIGGER: auto-update updated_at on orders
CREATE OR ALTER TRIGGER trg_orders_updated_at
ON orders
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE orders
    SET updated_at = GETDATE()
    WHERE id IN (SELECT id FROM inserted);
END;
GO

-- TRIGGER: auto-update updated_at on showroom
CREATE OR ALTER TRIGGER trg_showroom_updated_at
ON showroom
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE showroom
    SET updated_at = GETDATE()
    WHERE id IN (SELECT id FROM inserted);
END;
GO


-- ─────────────────────────────────────────────────────────────
-- VIEWS
-- ─────────────────────────────────────────────────────────────

-- Products with category name and computed sale price
CREATE VIEW v_products AS
SELECT
    p.id,
    p.slug,
    p.name,
    p.category_id,
    c.name                                              AS category_name,
    p.price,
    p.status,
    p.on_offer,
    p.discount,
    p.description,
    p.created_at,
    p.updated_at,
    CASE
        WHEN p.on_offer = 1 AND p.discount > 0
        THEN ROUND(p.price * (1.0 - p.discount / 100.0), 2)
        ELSE p.price
    END                                                 AS sale_price
FROM products p
JOIN categories c ON c.id = p.category_id;
GO

-- Orders with customer details and item count
CREATE VIEW v_orders AS
SELECT
    o.id,
    o.total,
    o.status,
    o.notes,
    o.created_at,
    o.updated_at,
    cu.name                                 AS customer_name,
    cu.email                                AS customer_email,
    cu.phone                                AS customer_phone,
    COUNT(oi.id)                            AS item_count
FROM orders o
JOIN customers cu ON cu.id = o.customer_id
LEFT JOIN order_items oi ON oi.order_id = o.id
GROUP BY
    o.id, o.total, o.status, o.notes, o.created_at, o.updated_at,
    cu.name, cu.email, cu.phone;
GO


-- ─────────────────────────────────────────────────────────────
-- VERIFY — quick row counts to confirm seeding succeeded
-- ─────────────────────────────────────────────────────────────
SELECT 'managers'       AS [Table], COUNT(*) AS [Rows] FROM managers       UNION ALL
SELECT 'categories',                COUNT(*)            FROM categories     UNION ALL
SELECT 'products',                  COUNT(*)            FROM products       UNION ALL
SELECT 'product_images',            COUNT(*)            FROM product_images UNION ALL
SELECT 'product_colors',            COUNT(*)            FROM product_colors UNION ALL
SELECT 'offers',                    COUNT(*)            FROM offers         UNION ALL
SELECT 'showroom',                  COUNT(*)            FROM showroom;
GO

-- ============================================================
--  END OF SCHEMA
--  Expected output:
--    managers        1
--    categories      7
--    products       17
--    product_images 119   (17 × 7)
--    product_colors  40
--    offers           2
--    showroom         1
-- ============================================================
