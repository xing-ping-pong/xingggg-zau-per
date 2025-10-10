This project includes a small image optimization helper.

scripts/convert-images.js
- Converts JPEG/PNG files in /public to WebP and AVIF variants at multiple widths.
- Outputs to /public/optimized/

Requirements
- Node.js
- npm install sharp

Run

```bash
node scripts/convert-images.js
```

Notes
- The script does not delete original files; it creates optimized copies.
- Use the generated images with `<Image src="/optimized/imagename-1024.webp" />` or a responsive `srcSet`.
- For production, consider using a CDN or on-the-fly optimization (Cloudinary, ImageKit, Vercel Image Optimization).