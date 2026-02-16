import sharp from 'sharp';
import { readFileSync, writeFileSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function optimizeHeroImage() {
  const inputPath = join(__dirname, '..', 'src', 'assets', 'hero-food.jpg');
  const tempPath = join(__dirname, '..', 'src', 'assets', 'hero-food-temp.jpg');
  
  console.log('🖼️  Optimizing hero image...\n');
  
  try {
    // Get original size
    const inputSizeBefore = statSync(inputPath).size;
    console.log(`📊 Original: ${(inputSizeBefore / 1024).toFixed(2)} KB`);
    
    // Read and optimize
    const buffer = readFileSync(inputPath);
    const optimized = await sharp(buffer)
      .resize(1920, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .jpeg({
        quality: 75,
        progressive: true,
        mozjpeg: true
      })
      .toBuffer();
    
    // Write to temp file first
    writeFileSync(tempPath, optimized);
    const outputSize = statSync(tempPath).size;
    
    const reduction = ((inputSizeBefore - outputSize) / inputSizeBefore * 100).toFixed(2);
    
    console.log(`✅ Optimized: ${(outputSize / 1024).toFixed(2)} KB`);
    console.log(`📉 Reduction: ${reduction}%\n`);
    
    // Replace original
    writeFileSync(inputPath, optimized);
    
    // Clean up temp
    try {
      const fs = await import('fs');
      fs.unlinkSync(tempPath);
    } catch (e) {
      // temp file might not exist
    }
    
    console.log('✅ Hero image optimized successfully!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

optimizeHeroImage();
