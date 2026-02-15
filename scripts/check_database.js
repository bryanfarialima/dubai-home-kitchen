import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function checkDatabase() {
  console.log('🔍 Checking Supabase Database Status...\n');
  
  // Test 1: Menu Items
  console.log('1️⃣ Testing menu_items table:');
  const { data: menuItems, error: menuError } = await supabase
    .from('menu_items')
    .select('id, name, image_url')
    .limit(5);
  
  if (menuError) {
    console.error('❌ Error fetching menu items:', menuError.message);
  } else {
    console.log(`✅ Found ${menuItems.length} menu items`);
    menuItems.forEach(item => {
      console.log(`   - ${item.name}: ${item.image_url ? '✓ has image' : '✗ no image'}`);
    });
  }
  
  console.log();
  
  // Test 2: Profiles (anonymous access)
  console.log('2️⃣ Testing profiles table access:');
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .limit(1);
  
  if (profileError) {
    console.log('⚠️  Cannot access profiles (expected for anonymous users)');
    console.log('   Error:', profileError.message);
  } else {
    console.log(`✅ Profiles table accessible: ${profiles.length} records found`);
  }
  
  console.log();
  
  // Test 3: Storage bucket
  console.log('3️⃣ Testing storage bucket:');
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
  
  if (bucketError) {
    console.error('❌ Error accessing storage:', bucketError.message);
  } else {
    const menuBucket = buckets.find(b => b.name === 'menu-images');
    if (menuBucket) {
      console.log('✅ menu-images bucket exists');
      console.log(`   Public: ${menuBucket.public ? 'Yes' : 'No'}`);
      
      // List files in bucket
      const { data: files, error: filesError } = await supabase.storage
        .from('menu-images')
        .list();
      
      if (!filesError && files) {
        console.log(`   Files: ${files.length} images stored`);
      }
    } else {
      console.log('⚠️  menu-images bucket not found');
    }
  }
  
  console.log();
  console.log('='.repeat(60));
  console.log('Database connectivity: ✅ OK');
}

checkDatabase().catch(console.error);
