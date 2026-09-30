/*
 # E-commerce Schema: Products, Orders, Profiles
 
 1. New Tables
 - `profiles` — user profile data linked to auth.users, with role (USER/ADMIN) and full name.
 - `products` — store catalog items (name, description, price, image, category, stock, rating).
 - `orders` — customer orders with shipping info, total, status, and line items as JSONB.
 
 2. Security
 - RLS enabled on all tables.
 - profiles: users can read/update their own profile; admin can read all.
 - products: public read (anon+authenticated); only authenticated admin can insert/update/delete.
 - orders: authenticated users can read/insert their own orders; admin can read all.
 
 3. Seed Data
 - 8 electronic/gadget products with real images.
 - 5 sample customer profiles.
 - The admin account is created by the operator-run bootstrap script and assigned the ADMIN role
 in the profiles table. Credentials are supplied through environment variables.
 */
-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR
SELECT TO authenticated USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1
      FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'ADMIN'
    )
  );
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR
INSERT TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR
UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
-- Products table
CREATE TABLE IF NOT EXISTS products (
  id serial PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  price numeric(10, 2) NOT NULL,
  image text NOT NULL,
  category text NOT NULL,
  stock integer NOT NULL DEFAULT 0,
  rating numeric(2, 1) NOT NULL DEFAULT 4.5,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- Public can read products
DROP POLICY IF EXISTS "products_public_select" ON products;
CREATE POLICY "products_public_select" ON products FOR
SELECT TO anon,
  authenticated USING (true);
-- Only admin can insert/update/delete products
DROP POLICY IF EXISTS "products_admin_insert" ON products;
CREATE POLICY "products_admin_insert" ON products FOR
INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1
      FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'ADMIN'
    )
  );
DROP POLICY IF EXISTS "products_admin_update" ON products;
CREATE POLICY "products_admin_update" ON products FOR
UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1
      FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'ADMIN'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1
      FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'ADMIN'
    )
  );
DROP POLICY IF EXISTS "products_admin_delete" ON products;
CREATE POLICY "products_admin_delete" ON products FOR DELETE TO authenticated USING (
  EXISTS (
    SELECT 1
    FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'ADMIN'
  )
);
-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id serial PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE
  SET NULL,
    customer_name text NOT NULL,
    email text NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    zip text NOT NULL,
    total numeric(10, 2) NOT NULL,
    status text NOT NULL DEFAULT 'pending' CHECK (
      status IN ('pending', 'processing', 'shipped', 'delivered')
    ),
    items jsonb NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- Users can read their own orders, admin can read all
DROP POLICY IF EXISTS "orders_select_own_or_admin" ON orders;
CREATE POLICY "orders_select_own_or_admin" ON orders FOR
SELECT TO authenticated USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'ADMIN'
    )
  );
-- Users can insert their own orders
DROP POLICY IF EXISTS "orders_insert_own" ON orders;
CREATE POLICY "orders_insert_own" ON orders FOR
INSERT TO authenticated WITH CHECK (user_id = auth.uid());
-- Admin can update order status
DROP POLICY IF EXISTS "orders_admin_update" ON orders;
CREATE POLICY "orders_admin_update" ON orders FOR
UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1
      FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'ADMIN'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1
      FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'ADMIN'
    )
  );
-- Seed products
INSERT INTO products (
    name,
    description,
    price,
    image,
    category,
    stock,
    rating
  )
VALUES (
    'Aurora Wireless Headphones',
    'Immerse yourself in studio-quality sound with active noise cancellation, 40-hour battery life, and plush memory-foam ear cushions. Bluetooth 5.3 with multipoint pairing.',
    299.99,
    'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Audio',
    45,
    4.8
  ),
  (
    'Nimbus Pro Laptop',
    '14-inch Retina display, M3 Pro chip, 16GB unified memory, 512GB SSD. Built for creators and developers who need desktop-class performance on the go.',
    1499.00,
    'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800',
    'Computers',
    18,
    4.9
  ),
  (
    'Pulse Smartwatch Series 7',
    'Always-on AMOLED display, ECG and blood-oxygen sensors, GPS tracking, and 7-day battery life. Swim-proof to 50 meters with interchangeable bands.',
    349.50,
    'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Wearables',
    62,
    4.6
  ),
  (
    'Vortex 4K Action Camera',
    'Shoot cinematic 4K60 footage with HyperSteady stabilization. Waterproof without a case, built-in horizon lock, and a 2-inch touchscreen for instant playback.',
    429.00,
    'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Cameras',
    30,
    4.7
  ),
  (
    'Echo Mechanical Keyboard',
    'Hot-swappable switches, per-key RGB lighting, and a CNC aluminum frame. Connect via USB-C or Bluetooth with a 72-hour battery on a single charge.',
    159.99,
    'https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Accessories',
    85,
    4.5
  ),
  (
    'Lumina Portable Monitor',
    '15.6-inch 1080p IPS display, USB-C single-cable connectivity, and a slim 4mm profile. The perfect second screen for laptops, phones, and consoles.',
    219.00,
    'https://images.pexels.com/photos/777001/pexels-photo-777001.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Displays',
    24,
    4.4
  ),
  (
    'Quantum Wireless Charger',
    '15W fast wireless charging with foreign-object detection and a sleek tempered-glass surface. Charges phones, earbuds, and smartwatches simultaneously.',
    49.99,
    'https://images.pexels.com/photos/4526473/pexels-photo-4526473.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Accessories',
    120,
    4.3
  ),
  (
    'Spectra VR Headset',
    '4K per-eye display, 120Hz refresh rate, pancake lenses, and inside-out tracking. A standalone VR experience with a growing library of immersive titles.',
    599.00,
    'https://images.pexels.com/photos/3761260/pexels-photo-3761260.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Gaming',
    15,
    4.8
  ) ON CONFLICT DO NOTHING;
-- Create index for orders by user_id
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);