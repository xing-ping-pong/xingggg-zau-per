const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const srcDir = path.join(__dirname, '..', 'public');
const outDir = path.join(srcDir, 'optimized');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

const images = fs.readdirSync(srcDir).filter(f => /\.(jpe?g|png)$/i.test(f));

const widths = [480, 768, 1024, 1600];

(async () => {
  for (const img of images) {
    const input = path.join(srcDir, img);
    const name = path.parse(img).name;
    for (const w of widths) {
      const outWebp = path.join(outDir, `${name}-${w}.webp`);
      const outAvif = path.join(outDir, `${name}-${w}.avif`);
      try {
        await sharp(input)
          .resize({ width: w })
          .webp({ quality: 80 })
          .toFile(outWebp);
        await sharp(input)
          .resize({ width: w })
          .avif({ quality: 50 })
          .toFile(outAvif);
        console.log(`Generated ${outWebp} and ${outAvif}`);
      } catch (err) {
        console.error('Failed to process', input, err.message);
      }
    }
  }
})();
