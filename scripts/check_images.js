import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkImages() {
  const { data, error } = await supabase
    .from('menu_items')
    .select('id, name, image_url')
    .order('name');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('\n📸 Menu Items Images:\n');
  console.log('='.repeat(80));
  
  for (const item of data) {
    const isSupabase = item.image_url?.includes('supabase.co');
    const status = isSupabase ? '✅ Migrated' : '⚠️  External';
    const size = item.image_url ? `${item.image_url.length} chars` : 'No URL';
    
    console.log(`${status} | ${item.name.padEnd(30)} | ${size}`);
    if (item.image_url) {
      console.log(`         ${item.image_url.substring(0, 100)}...`);
    }
    console.log('-'.repeat(80));
  }
}

checkImages().catch(console.error);
