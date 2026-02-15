import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://jkzlrsaohlbfpoyzjfpo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprempycnNhb2hsYmZwb3l6amZwbyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzM5MTc5MDA4LCJleHAiOjIwNTQ3NTUwMDh9.qLSU0xQJvp7cHvPxvvBcNxkTaHj4WKUfQqMUf8S8XbI'
);

async function checkMenu() {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*');
  
  console.log('Menu items no banco:', data?.length || 0);
  if (data && data.length > 0) {
    data.forEach(item => {
      console.log(`- ${item.name} (AED ${item.price})`);
    });
  } else {
    console.log('Nenhum prato encontrado no banco de dados!');
  }
  if (error) console.error('Erro:', error);
}

checkMenu();
