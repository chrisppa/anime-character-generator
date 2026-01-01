// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

// Corrected path to the images directory
const imagesDir = path.join(__dirname, './public/images');
const indexFile = path.join(imagesDir, 'index.ts');

// Added 'webp' to the regex pattern
const files = fs.readdirSync(imagesDir).filter(file => /\.(png|jpg|jpeg|svg|gif|webp)$/.test(file));

const imageExports = files.map(file => {
  const name = path.basename(file, path.extname(file));
  return `export { default as ${name} } from './${file}';`;
}).join('\n');

fs.writeFileSync(indexFile, imageExports, 'utf8');
console.log('index.ts generated successfully!');