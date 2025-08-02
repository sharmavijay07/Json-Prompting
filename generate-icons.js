// Simple icon generator for PromptStruct extension
// Run with: node generate-icons.js

const fs = require('fs');
const path = require('path');

// Create a simple SVG icon
function createSVGIcon(size) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
        </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#grad)"/>
    <text x="${size/2}" y="${size/2}" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold" text-anchor="middle" dominant-baseline="central" fill="white">{}</text>
    <circle cx="${size/2}" cy="${size/2 - size * 0.1}" r="${size * 0.03}" fill="white"/>
    <circle cx="${size/2}" cy="${size/2}" r="${size * 0.03}" fill="white"/>
    <circle cx="${size/2}" cy="${size/2 + size * 0.1}" r="${size * 0.03}" fill="white"/>
</svg>`;
}

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir);
}

// Generate SVG icons for different sizes
const sizes = [16, 32, 48, 128];

sizes.forEach(size => {
    const svgContent = createSVGIcon(size);
    const filename = path.join(iconsDir, `icon${size}.svg`);
    fs.writeFileSync(filename, svgContent);
    console.log(`Generated ${filename}`);
});

console.log('SVG icons generated successfully!');
console.log('To convert to PNG, you can:');
console.log('1. Open create-icons.html in a browser and download the PNG versions');
console.log('2. Use an online SVG to PNG converter');
console.log('3. Use a tool like Inkscape or ImageMagick');
