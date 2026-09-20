// PWA 아이콘 생성 스크립트 (1회성). sharp로 public/logo.svg를 브랜드 배경(#FF4805) 위에
// 중앙 배치해 icon-192/512, maskable-512, apple-touch-icon-180을 만든다.
// 실행: node scripts/generate-pwa-icons.mjs
import sharp from 'sharp';
import { mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'public/icons');
mkdirSync(outDir, { recursive: true });

const BRAND = '#FF4805';
const logoPath = path.join(root, 'public/logo.svg');

async function makeIcon({ size, out, safeRatio = 1 }) {
  // 로고 원본 비율 79:22 유지, 아이콘 폭의 (safeRatio) 만큼 차지하게 스케일
  const targetW = Math.round(size * 0.62 * safeRatio);
  const targetH = Math.round((targetW * 22) / 79);

  const logoBuf = await sharp(logoPath)
    .resize({ width: targetW, height: targetH, fit: 'contain' })
    .png()
    .toBuffer();

  const bg = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BRAND,
    },
  })
    .png()
    .toBuffer();

  await sharp(bg)
    .composite([
      {
        input: logoBuf,
        left: Math.round((size - targetW) / 2),
        top: Math.round((size - targetH) / 2),
      },
    ])
    .png()
    .toFile(path.join(outDir, out));

  console.log('생성:', out);
}

await makeIcon({ size: 192, out: 'icon-192.png' });
await makeIcon({ size: 512, out: 'icon-512.png' });
// maskable: 중앙 80% safe-area 안에 로고가 들어오도록 축소
await makeIcon({ size: 512, out: 'icon-maskable-512.png', safeRatio: 0.72 });
await makeIcon({ size: 180, out: 'apple-touch-icon-180.png' });

console.log('완료');
