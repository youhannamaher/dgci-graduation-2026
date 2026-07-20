const fs = require('fs');
const path = require('path');

const dirs = [
  'public/logos',
  'public/graduates',
  'public/gallery',
  'public/backgrounds',
  'public/icons'
];

// Ensure directories exist
dirs.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// A simple 1x1 gold-colored PNG base64 string
const goldPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const goldPngBuffer = Buffer.from(goldPngBase64, 'base64');

// A simple 1x1 navy-colored PNG base64 string
const navyPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+phPQAI8AM4G7m4fQAAAABJRU5ErkJggg==';
const navyPngBuffer = Buffer.from(navyPngBase64, 'base64');

// Write placeholder files
const files = [
  { path: 'public/logos/iae-logo.png', buffer: goldPngBuffer },
  { path: 'public/logos/dgci-logo.png', buffer: goldPngBuffer },
  { path: 'public/logos/ainshams-logo.png', buffer: goldPngBuffer },
  { path: 'public/backgrounds/dark-gold-bg.jpg', buffer: navyPngBuffer },
  { path: 'public/backgrounds/invitation-texture.png', buffer: navyPngBuffer },
  { path: 'public/gallery/sample-001.jpg', buffer: goldPngBuffer },
  { path: 'public/gallery/sample-002.jpg', buffer: goldPngBuffer }
];

// Write graduate photo placeholders (student-001 to student-020)
for (let i = 1; i <= 20; i++) {
  const padded = String(i).padStart(3, '0');
  files.push({
    path: `public/graduates/student-${padded}.jpg`,
    buffer: goldPngBuffer
  });
}

// Special check for youhanna-maher
files.push({
  path: 'public/graduates/youhanna-maher.jpg',
  buffer: goldPngBuffer
});

// Write files
files.forEach(file => {
  const filePath = path.join(__dirname, '..', file.path);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, file.buffer);
    console.log(`Created file: ${file.path}`);
  }
});

// Create simple SVG icon for graduation-cap
const gradCapSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
  <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
</svg>`;

fs.writeFileSync(path.join(__dirname, '..', 'public/icons/graduation-cap.svg'), gradCapSvg);
console.log('Created graduation-cap.svg');
