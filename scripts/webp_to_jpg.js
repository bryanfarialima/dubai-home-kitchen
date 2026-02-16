import sharp from 'sharp';
import { readFileSync, writeFileSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function convertBackToJpg() {
  const inputPath = join(__dirname, '..', 'src', 'assets', 'hero-food.webp');
  const outputPath = join(__dirname, '..', 'src', 'assets', 'hero-food.jpg');
  
  console.log('🔄 Converting WebP back to optimized JPG...\n');
  
  try {
    const buffer = readFileSync(inputPath);
    const optimized = await sharp(buffer)
      .jpeg({
        quality: 80,
        progressive: true,
        mozjpeg: true
      })
      .toBuffer();
    
    writeFileSync(outputPath, optimized);
    const outputSize = statSync(outputPath).size;
    
    console.log(`✅ JPG created: ${(outputSize / 1024).toFixed(2)} KB`);
    console.log('✅ Conversion complete!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

convertBackToJpg();
