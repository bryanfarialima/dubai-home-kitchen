import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials');
  console.error('Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Download image from URL
async function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      const data = [];
      response.on('data', (chunk) => data.push(chunk));
      response.on('end', () => resolve(Buffer.concat(data)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

// Compress image to target size
async function compressImage(buffer, maxSizeKB = 200) {
  let quality = 80;
  let width = 800;
  let compressed;

  while (quality > 20) {
    compressed = await sharp(buffer)
      .resize(width, null, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();

    const sizeKB = compressed.length / 1024;
    
    if (sizeKB <= maxSizeKB) {
      console.log(`  ✓ Compressed to ${sizeKB.toFixed(1)}KB (quality: ${quality}, width: ${width}px)`);
      return compressed;
    }

    if (quality > 50) {
      quality -= 10;
    } else if (width > 400) {
      width -= 100;
      quality = 80;
    } else {
      quality -= 5;
    }
  }

  return compressed;
}

// Generate clean filename from item name
function generateFilename(itemName, itemId) {
  const clean = itemName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${clean}-${itemId}.jpg`;
}

async function migrateImages() {
  console.log('🚀 Starting image migration to Supabase Storage...\n');

  // 1. Fetch all menu items with external image URLs
  const { data: items, error: fetchError } = await supabase
    .from('menu_items')
    .select('id, name, image_url')
    .not('image_url', 'is', null)
    .neq('image_url', '');

  if (fetchError) {
    console.error('Error fetching menu items:', fetchError);
    return;
  }

  if (!items || items.length === 0) {
    console.log('No menu items with image URLs found.');
    return;
  }

  console.log(`Found ${items.length} items with images\n`);

  // 2. Create bucket if it doesn't exist
  const bucketName = 'menu-images';
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(b => b.name === bucketName);

  if (!bucketExists) {
    console.log(`Creating bucket: ${bucketName}...`);
    const { error: bucketError } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 1024 * 1024 * 2, // 2MB limit
    });

    if (bucketError) {
      console.error('Error creating bucket:', bucketError);
      return;
    }
    console.log('✓ Bucket created\n');
  } else {
    console.log(`✓ Bucket "${bucketName}" already exists\n`);
  }

  // 3. Process each image
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const item of items) {
    try {
      console.log(`Processing: ${item.name} (${item.id})`);
      
      // Skip if already using Supabase Storage URL
      if (item.image_url.includes('supabase.co/storage')) {
        console.log('  ⊘ Already migrated, skipping\n');
        skipCount++;
        continue;
      }

      // Download original image
      console.log(`  → Downloading from ${item.image_url.substring(0, 50)}...`);
      const imageBuffer = await downloadImage(item.image_url);
      console.log(`  ✓ Downloaded ${(imageBuffer.length / 1024).toFixed(1)}KB`);

      // Compress image
      console.log('  → Compressing...');
      const compressedBuffer = await compressImage(imageBuffer, 200);

      // Generate filename and upload
      const filename = generateFilename(item.name, item.id);
      console.log(`  → Uploading as ${filename}...`);

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filename, compressedBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        console.error('  ✗ Upload error:', uploadError.message);
        errorCount++;
        continue;
      }

      // Get public URL with transformation
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filename);

      // Update database with new URL
      const { error: updateError } = await supabase
        .from('menu_items')
        .update({ image_url: publicUrl })
        .eq('id', item.id);

      if (updateError) {
        console.error('  ✗ Database update error:', updateError.message);
        errorCount++;
        continue;
      }

      console.log(`  ✓ Successfully migrated!\n`);
      successCount++;

    } catch (error) {
      console.error(`  ✗ Error processing ${item.name}:`, error.message);
      errorCount++;
      console.log();
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Migration Summary:');
  console.log('='.repeat(50));
  console.log(`✓ Successfully migrated: ${successCount}`);
  console.log(`⊘ Already migrated:      ${skipCount}`);
  console.log(`✗ Failed:                ${errorCount}`);
  console.log(`📁 Total items:          ${items.length}`);
  console.log('='.repeat(50));

  if (successCount > 0) {
    console.log('\n💡 Next steps:');
    console.log('1. Verify images in Supabase Dashboard > Storage > menu-images');
    console.log('2. Check the website to ensure images load correctly');
    console.log('3. Consider using URL transformation for better performance:');
    console.log('   Add ?width=400&quality=75 to image URLs for automatic optimization');
  }
}

// Run migration
migrateImages().catch(console.error);
