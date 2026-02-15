-- =====================================================
-- SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
-- Apply these policies in Supabase SQL Editor
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES - Users can only see/edit their own profile
-- =====================================================

-- Users can read their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Users can insert their own profile
DROP POLICY IF EXISTS "System can insert profiles" ON profiles;
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- USER_ROLES - Only admins can manage roles
-- =====================================================

-- Admins can view all roles
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
CREATE POLICY "Admins can view all roles"
ON user_roles FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Admins can insert roles
DROP POLICY IF EXISTS "Admins can insert roles" ON user_roles;
CREATE POLICY "Admins can insert roles"
ON user_roles FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Admins can delete roles
DROP POLICY IF EXISTS "Admins can delete roles" ON user_roles;
CREATE POLICY "Admins can delete roles"
ON user_roles FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- =====================================================
-- CATEGORIES - Public read, admin write
-- =====================================================

-- Anyone can view active categories
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
CREATE POLICY "Anyone can view categories"
ON categories FOR SELECT
USING (true);

-- Admins can insert categories
DROP POLICY IF EXISTS "Admins can insert categories" ON categories;
CREATE POLICY "Admins can insert categories"
ON categories FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Admins can update categories
DROP POLICY IF EXISTS "Admins can update categories" ON categories;
CREATE POLICY "Admins can update categories"
ON categories FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Admins can delete categories
DROP POLICY IF EXISTS "Admins can delete categories" ON categories;
CREATE POLICY "Admins can delete categories"
ON categories FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- =====================================================
-- MENU_ITEMS - Public read, admin write
-- =====================================================

-- Anyone can view available menu items
DROP POLICY IF EXISTS "Anyone can view menu items" ON menu_items;
CREATE POLICY "Anyone can view menu items"
ON menu_items FOR SELECT
USING (true);

-- Admins can insert menu items
DROP POLICY IF EXISTS "Admins can insert menu items" ON menu_items;
CREATE POLICY "Admins can insert menu items"
ON menu_items FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Admins can update menu items
DROP POLICY IF EXISTS "Admins can update menu items" ON menu_items;
CREATE POLICY "Admins can update menu items"
ON menu_items FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Admins can delete menu items
DROP POLICY IF EXISTS "Admins can delete menu items" ON menu_items;
CREATE POLICY "Admins can delete menu items"
ON menu_items FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- =====================================================
-- DELIVERY_ZONES - Public read, admin write
-- =====================================================

-- Anyone can view delivery zones (no is_active column in this table)
DROP POLICY IF EXISTS "Anyone can view delivery zones" ON delivery_zones;
CREATE POLICY "Anyone can view delivery zones"
ON delivery_zones FOR SELECT
USING (true);

-- Admins can manage delivery zones
DROP POLICY IF EXISTS "Admins can manage delivery zones" ON delivery_zones;
CREATE POLICY "Admins can manage delivery zones"
ON delivery_zones FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- =====================================================
-- COUPONS - Limited read, admin write
-- =====================================================

-- Users can check if coupon is valid (via code lookup)
DROP POLICY IF EXISTS "Users can check coupons" ON coupons;
CREATE POLICY "Users can check coupons"
ON coupons FOR SELECT
USING (is_active = true OR has_role(auth.uid(), 'admin'));

-- Admins can manage coupons
DROP POLICY IF EXISTS "Admins can manage coupons" ON coupons;
CREATE POLICY "Admins can manage coupons"
ON coupons FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- =====================================================
-- ORDERS - Users see own orders, admins see all
-- =====================================================

-- Users can view their own orders
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders"
ON orders FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- Authenticated users can create orders
DROP POLICY IF EXISTS "Users can create orders" ON orders;
CREATE POLICY "Users can create orders"
ON orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can update order status
DROP POLICY IF EXISTS "Admins can update orders" ON orders;
CREATE POLICY "Admins can update orders"
ON orders FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- =====================================================
-- ORDER_ITEMS - Tied to order permissions
-- =====================================================

-- Users can view their own order items
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
CREATE POLICY "Users can view own order items"
ON order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND (orders.user_id = auth.uid() OR has_role(auth.uid(), 'admin'))
  )
);

-- Users can insert order items when creating order
DROP POLICY IF EXISTS "Users can insert order items" ON order_items;
CREATE POLICY "Users can insert order items"
ON order_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

-- =====================================================
-- REVIEWS - Users can review their completed orders
-- =====================================================

-- Anyone can view approved reviews
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
CREATE POLICY "Anyone can view reviews"
ON reviews FOR SELECT
USING (true);

-- Users can create reviews for their own orders
DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
CREATE POLICY "Users can create reviews"
ON reviews FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = reviews.order_id
    AND orders.user_id = auth.uid()
    AND orders.status = 'delivered'
  )
);

-- Users can update their own reviews
DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
CREATE POLICY "Users can update own reviews"
ON reviews FOR UPDATE
USING (auth.uid() = user_id);

-- =====================================================
-- VERIFICATION QUERIES
-- Run these to verify RLS is working correctly
-- =====================================================

-- Check if RLS is enabled on all tables
/*
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'profiles', 'user_roles', 'categories', 'menu_items',
  'delivery_zones', 'coupons', 'orders', 'order_items', 'reviews'
);
*/

-- List all policies
/*
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
*/
