#!/usr/bin/env node

console.log(`
📊 Supabase Storage Usage Check
================================

To check your Supabase storage usage, follow these steps:

🌐 OPTION 1: Supabase Dashboard (Recommended)
-------------------------------------------
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click on "Storage" in the left sidebar
4. View usage metrics at the top of the page
   - Shows: Used space / Total space
   - Shows: Number of objects
   - Shows: Bandwidth used

📂 OPTION 2: Check uploaded files in database
-------------------------------------------
Your menu items are stored in the 'menu_items' table.
Current images in database:

`);

import { createClient } from '@supabase/supabase-js';

// Get credentials from command line
const supabaseUrl = process.argv[2];
const supabaseKey = process.argv[3];

if (!supabaseUrl || !supabaseKey) {
  console.log('To programmatically check:');
  console.log('node scripts/check_storage_info.js <SUPABASE_URL> <ANON_KEY>\n');
} else {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  (async () => {
    const { data: items, error } = await supabase
      .from('menu_items')
      .select('id, name, image_url');
    
    if (error) {
      console.error('Error fetching menu items:', error);
      return;
    }

    console.log('📋 Menu Items with Images:');
    console.log('==========================\n');
    
    items.forEach((item, idx) => {
      console.log(`${idx + 1}. ${item.name}`);
      console.log(`   Image: ${item.image_url || 'No image'}\n`);
    });

    const storageImages = items.filter(i => i.image_url?.includes('/storage/v1/object/public/'));
    console.log(`\n✅ Images in Supabase Storage: ${storageImages.length}`);
    console.log(`📦 Total menu items: ${items.length}\n`);

    console.log('💡 Tip: Images stored in Supabase Storage bucket "menu-images" are:');
    storageImages.forEach(item => {
      const filename = item.image_url.split('/').pop();
      console.log(`   - ${filename}`);
    });
  })();
}

console.log(`
📈 Storage Optimization Tips
============================

1. Compress images before upload (use WebP format)
2. Delete unused images from storage buckets
3. Use image transformations: ?width=400&quality=80
4. Consider CDN caching for frequently accessed images

🎯 Supabase Free Tier Limits
============================
- Database: 500 MB
- Storage: 1 GB
- Bandwidth: 2 GB/month
- API Requests: Unlimited

If you're approaching limits:
- Upgrade to Pro tier ($25/month)
- Optimize existing images
- Remove unused files

`);
