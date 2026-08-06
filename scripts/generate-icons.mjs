// Generates PWA icons (PNG) from the khatam Star mark.
// Emerald background full-bleed + gilt star centered within the maskable safe zone,
// so a single design serves both "any" and "maskable" purposes.
//
//   node scripts/generate-icons.mjs
//
import sharp from 'sharp';

const STAR_PATH =
  'M50 2 L57.65 31.52 L83.94 16.06 L68.48 42.35 L98 50 L68.48 57.65 L83.94 83.94 L57.65 68.48 L50 98 L42.35 68.48 L16.06 83.94 L31.52 57.65 L2 50 L31.52 42.35 L16.06 16.06 L42.35 31.52 Z';

const BG = '#0F5C3E'; // emerald-600
const FG = '#D4A85A'; // gilt-400

function svg(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="${BG}"/>
  <g transform="translate(50 50) scale(0.62) translate(-50 -50)" fill="${FG}">
    <path d="${STAR_PATH}"/>
  </g>
</svg>`;
}

const TARGETS = [
  { size: 512, file: 'icon-512x512.png' },
  { size: 192, file: 'icon-192x192.png' },
  { size: 180, file: 'apple-touch-icon.png' },
  { size: 32, file: 'favicon-32x32.png' },
];

for (const { size, file } of TARGETS) {
  await sharp(Buffer.from(svg(size))).png().toFile(`public/${file}`);
  console.log(`generated public/${file} (${size}x${size})`);
}

console.log('done');
