// One-off: pull a curated fitness photo set into Cloudinary under `pulse/`.
// Run from server/:  node scripts/upload-cloudinary.mjs
import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const src = (id) => `https://images.unsplash.com/photo-${id}?w=1400&q=80&fm=jpg&fit=max`;

const ASSETS = {
  // hero + site
  hero: '1571019613454-1cb2f99b2d8b',
  'studio-interior': '1540497077202-7c8a3999166f',
  'program-bg': '1517836357463-d25dfeac3438',
  // classes
  'class-spin': '1534787238916-9ba6764efd4f',
  'class-hiit': '1549060279-7e168fcee0c2',
  'class-strength': '1581009146145-b5ef050c2e1e',
  'class-yoga': '1544367567-0f2fcb009e0b',
  // coaches
  'coach-maya': '1594381898411-846e7d193883',
  'coach-andre': '1571731956672-f2b94d7dd0cb',
  'coach-ivy': '1518611012118-696072aa579a',
  // gallery / texture
  'gallery-1': '1583454110551-21f2fa2afe61',
  'gallery-2': '1574680096145-d05b474e2155',
  'gallery-3': '1599058917212-d750089bc07e',
  'gallery-4': '1546483875-ad9014c88eba',
  'gallery-5': '1550345332-09e3ac987658',
  'gallery-6': '1526506118085-60ce8714f8c5',
};

let ok = 0;
let failed = 0;
for (const [publicId, photoId] of Object.entries(ASSETS)) {
  try {
    const res = await cloudinary.uploader.upload(src(photoId), {
      public_id: `pulse/${publicId}`,
      overwrite: true,
      invalidate: true,
      resource_type: 'image',
    });
    ok++;
    console.log(`✓ ${publicId}  (${res.width}x${res.height})`);
  } catch (err) {
    failed++;
    console.error(`✗ ${publicId}  — ${err?.message || err}`);
  }
}
console.log(`\nDone. ${ok} uploaded, ${failed} failed.`);
