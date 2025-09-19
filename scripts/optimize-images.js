const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Paths to scan for images
const directories = [
  './public',
  './src/app'
];

// File extensions to process
const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

// Sizes for responsive images
const sizes = [320, 640, 960, 1280];

// Process images
async function processImages() {
  console.log('Starting image optimization...');

  for (const dir of directories) {
    await scanDirectory(dir);
  }

  console.log('Image optimization completed!');
}

// Scan directory recursively
async function scanDirectory(directory) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and .next folders
      if (file !== 'node_modules' && file !== '.next') {
        await scanDirectory(filePath);
      }
    } else {
      const ext = path.extname(file).toLowerCase();
      if (imageExtensions.includes(ext)) {
        await optimizeImage(filePath);
      }
    }
  }
}

// Optimize a single image
async function optimizeImage(filePath) {
  try {
    const ext = path.extname(filePath).toLowerCase();
    const dir = path.dirname(filePath);
    const baseName = path.basename(filePath, ext);
    
    console.log(`Processing ${filePath}...`);

    // Create optimized version of the original
    const optimizedPath = path.join(dir, `${baseName}.webp`);
    await sharp(filePath)
      .webp({ quality: 80 })
      .toFile(optimizedPath);
    
    console.log(`Created WebP: ${optimizedPath}`);
    
    // Create responsive versions
    for (const size of sizes) {
      const responsivePath = path.join(dir, `${baseName}-${size}.webp`);
      await sharp(filePath)
        .resize(size)
        .webp({ quality: 75 })
        .toFile(responsivePath);
        
      console.log(`Created responsive image: ${responsivePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

// Run the optimization
processImages().catch(console.error);
