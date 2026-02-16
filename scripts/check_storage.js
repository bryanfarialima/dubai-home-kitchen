// Simple storage checker - requires manual execution in browser console
// Copy and paste this into the browser console while logged into your Supabase dashboard

console.log(`
To check Supabase storage usage:

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to Storage section
4. View the usage metrics at the top

Or run this script in the browser console on any page of your site:

const checkStorage = async () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { data: buckets } = await supabase.storage.listBuckets();
  console.log('Buckets:', buckets);
  
  for (const bucket of buckets) {
    const { data: files } = await supabase.storage.from(bucket.name).list();
    console.log(\`\${bucket.name}:\`, files);
  }
};
checkStorage();
`);

// For now, let's just check what's in the database
import { createClient } from '@supabase/supabase-js';

// You'll need to provide these manually or set them as environment variables
const supabaseUrl = process.argv[2];
const supabaseKey = process.argv[3];

if (!supabaseUrl || !supabaseKey) {
  console.log('\n❌ Usage: node check_storage.js <SUPABASE_URL> <SUPABASE_ANON_KEY>');
  console.log('\nOr check storage directly in Supabase Dashboard:');
  console.log('1. Go to https://supabase.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Go to Storage → Check usage at the top\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStorageUsage() {
  try {
    console.log('\n🔍 Checking Supabase Storage Usage...\n');

    // List all buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error fetching buckets:', bucketsError);
      return;
    }

    console.log('📦 Available buckets:', buckets.length);
    
    let totalSize = 0;
    
    for (const bucket of buckets) {
      console.log(`\n📂 Bucket: ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
      
      // List all files in the bucket
      const { data: files, error: filesError } = await supabase.storage
        .from(bucket.name)
        .list('', {
          limit: 1000,
          sortBy: { column: 'name', order: 'asc' }
        });
      
      if (filesError) {
        console.error(`  ❌ Error listing files in ${bucket.name}:`, filesError);
        continue;
      }

      if (!files || files.length === 0) {
        console.log('  ℹ️  No files found');
        continue;
      }

      let bucketSize = 0;
      console.log(`  📄 Files (${files.length}):`);
      
      for (const file of files) {
        const sizeKB = (file.metadata?.size || 0) / 1024;
        bucketSize += sizeKB;
        console.log(`    - ${file.name}: ${sizeKB.toFixed(2)} KB`);
      }

      totalSize += bucketSize;
      console.log(`  📊 Bucket total: ${bucketSize.toFixed(2)} KB (${(bucketSize / 1024).toFixed(2)} MB)`);
    }

    console.log(`\n✅ Total storage used: ${totalSize.toFixed(2)} KB (${(totalSize / 1024).toFixed(2)} MB)\n`);

    // Supabase free tier limit is 1GB
    const limitMB = 1024;
    const usagePercent = ((totalSize / 1024) / limitMB) * 100;
    console.log(`📈 Storage usage: ${usagePercent.toFixed(2)}% of ${limitMB} MB (Free tier limit)\n`);

    if (usagePercent > 80) {
      console.log('⚠️  Warning: Storage usage is above 80%!');
    } else if (usagePercent > 90) {
      console.log('🚨 Critical: Storage usage is above 90%!');
    } else {
      console.log('✅ Storage usage is healthy.');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkStorageUsage();
