import sharp from 'sharp';
import { readFileSync, writeFileSync, statSync, unlinkSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function convertToWebP() {
  const inputPath = join(__dirname, '..', 'src', 'assets', 'hero-food.jpg');
  const outputPath = join(__dirname, '..', 'src', 'assets', 'hero-food.webp');
  
  console.log('🖼️  Converting hero image to WebP...\n');
  
  try {
    const inputSize = statSync(inputPath).size;
    console.log(`📊 Original JPG: ${(inputSize / 1024).toFixed(2)} KB`);
    
    // Convert to WebP with quality 80
    const buffer = readFileSync(inputPath);
    const webpBuffer = await sharp(buffer)
      .webp({
        quality: 80,
        effort: 6 // Max compression effort
      })
      .toBuffer();
    
    writeFileSync(outputPath, webpBuffer);
    const outputSize = statSync(outputPath).size;
    
    const reduction = ((inputSize - outputSize) / inputSize * 100).toFixed(2);
    
    console.log(`✅ WebP created: ${(outputSize / 1024).toFixed(2)} KB`);
    console.log(`📉 Reduction: ${reduction}%\n`);
    
    // Delete old JPG
    unlinkSync(inputPath);
    console.log('🗑️  Removed old JPG file');
    console.log('✅ Conversion complete!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

convertToWebP();
