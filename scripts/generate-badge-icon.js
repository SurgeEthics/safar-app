import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

/**
 * Safar Gafargaon - Android Monochrome Status Bar Notification Badge Generator.
 *
 * Android requires status bar icons (and Web Notification badges) to be pure monochrome
 * alpha-masks:
 * - Transparent background (alpha = 0)
 * - Pure white foreground (#FFFFFF) for the icon silhouette
 * - Center cutouts (such as the map pin hole and road arches) must have alpha = 0
 *
 * If an opaque background is used, Android fills the entire square as solid white/black.
 * This script extracts the authentic Safar logo silhouette (Location Pin, Road Highway 'স',
 * and Bengali text 'সফর') directly from the official Safar logo, creating pixel-perfect,
 * crisp, anti-aliased monochrome badge PNGs for Android status bar notifications.
 */

function crc32(buf) {
  let table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    table[i] = c >>> 0;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([len, typeAndData, crc]);
}

function createPng(width, height, getPixel) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;  // RGBA
  ihdr[10] = 0; // Deflate
  ihdr[11] = 0;
  ihdr[12] = 0;

  const raw = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    raw[offset++] = 0; // Filter None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y);
      raw[offset++] = r;
      raw[offset++] = g;
      raw[offset++] = b;
      raw[offset++] = a;
    }
  }

  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', idat),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

function decodePng(buf) {
  let offset = 8;
  let idatChunks = [];
  let width = 0, height = 0;

  while (offset < buf.length) {
    const len = buf.readUInt32BE(offset);
    const type = buf.slice(offset + 4, offset + 8).toString('ascii');
    const data = buf.slice(offset + 8, offset + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
    } else if (type === 'IDAT') {
      idatChunks.push(data);
    }
    offset += 12 + len;
  }

  const decompressed = zlib.inflateSync(Buffer.concat(idatChunks));
  const pixels = Buffer.alloc(width * height * 4);
  const stride = width * 4;
  let prevRow = Buffer.alloc(stride);

  for (let y = 0; y < height; y++) {
    const filter = decompressed[y * (stride + 1)];
    const row = decompressed.slice(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const decodedRow = Buffer.alloc(stride);

    for (let x = 0; x < stride; x++) {
      const a = x >= 4 ? decodedRow[x - 4] : 0;
      const b = prevRow[x];
      const c = x >= 4 ? prevRow[x - 4] : 0;

      let val = row[x];
      if (filter === 1) {
        val = (val + a) & 0xff;
      } else if (filter === 2) {
        val = (val + b) & 0xff;
      } else if (filter === 3) {
        val = (val + Math.floor((a + b) / 2)) & 0xff;
      } else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        val = (val + ((pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c))) & 0xff;
      }
      decodedRow[x] = val;
    }
    decodedRow.copy(pixels, y * stride);
    prevRow = decodedRow;
  }
  return { width, height, pixels };
}

// 1. Load source Safar official logo
const logoPath = path.resolve('public/safar-logo.png');
const { width, height, pixels } = decodePng(fs.readFileSync(logoPath));

// 2. Build high-precision binary silhouette mask
const mask = Buffer.alloc(width * height);

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * 4;
    const r = pixels[idx];
    const g = pixels[idx + 1];
    const b = pixels[idx + 2];
    const a = pixels[idx + 3];
    if (a < 50) continue;

    // Discard outer squircle border and background frame
    if (x < 65 || x > 447 || y < 65 || y > 455) continue;

    // Location pin transparent center hole at (259, 117)
    const distPinHole = Math.hypot(x - 259, y - 117);
    if (distPinHole <= 16.5) continue;

    // Red location pin body
    if (r > 150 && g < 100 && b < 100) {
      mask[y * width + x] = 255;
      continue;
    }
    // Blue origin dot
    if (b > 160 && r < 100) {
      mask[y * width + x] = 255;
      continue;
    }
    // White road or Bengali 'সফর' text
    if (r > 160 && g > 160 && b > 160) {
      mask[y * width + x] = 255;
      continue;
    }
  }
}

// 3. Fill internal highway dashed centerline so the road is completely solid and bold
for (let y = 160; y <= 330; y++) {
  for (let x = 130; x <= 390; x++) {
    if (mask[y * width + x] > 0) continue;
    if (Math.hypot(x - 259, y - 117) <= 18) continue;

    let hasLeft = false, hasRight = false, hasTop = false, hasBottom = false;
    for (let d = 1; d <= 9; d++) {
      if (x - d >= 0 && mask[y * width + (x - d)] > 0) hasLeft = true;
      if (x + d < width && mask[y * width + (x + d)] > 0) hasRight = true;
      if (y - d >= 0 && mask[(y - d) * width + x] > 0) hasTop = true;
      if (y + d < height && mask[(y + d) * width + x] > 0) hasBottom = true;
    }
    if (hasLeft && hasRight && hasTop && hasBottom) {
      mask[y * width + x] = 255;
    }
  }
}

// 4. Guarantee pin hole is completely transparent
for (let y = 90; y <= 145; y++) {
  for (let x = 230; x <= 290; x++) {
    if (Math.hypot(x - 259, y - 117) <= 16.5) {
      mask[y * width + x] = 0;
    }
  }
}

/**
 * Resample mask into target size with 5x5 sub-pixel supersampling for smooth anti-aliased edges
 */
function resampleBadge(targetSize) {
  const padding = targetSize * 0.08;
  const avail = targetSize - padding * 2;
  const contentW = 383 - 129;
  const contentH = 439 - 76;
  const scale = avail / Math.max(contentW, contentH);
  const targetW = contentW * scale;
  const targetH = contentH * scale;
  const startX = (targetSize - targetW) / 2;
  const startY = (targetSize - targetH) / 2;

  return createPng(targetSize, targetSize, (outX, outY) => {
    const origX = 129 + (outX - startX) / scale;
    const origY = 76 + (outY - startY) / scale;

    let hit = 0;
    const subSteps = 5;
    const step = 1 / scale / subSteps;
    const halfSpan = (1 / scale) / 2;

    for (let sy = 0; sy < subSteps; sy++) {
      for (let sx = 0; sx < subSteps; sx++) {
        const sampleX = Math.round(origX - halfSpan + (sx + 0.5) * step);
        const sampleY = Math.round(origY - halfSpan + (sy + 0.5) * step);
        if (sampleX >= 0 && sampleX < width && sampleY >= 0 && sampleY < height) {
          if (mask[sampleY * width + sampleX] > 0) hit++;
        }
      }
    }
    const alpha = hit / (subSteps * subSteps);
    if (alpha <= 0.03) return [0, 0, 0, 0];
    const alphaByte = Math.round(Math.min(1, alpha) * 255);
    return [255, 255, 255, alphaByte];
  });
}

// Generate all standard Android density badge PNGs
const p96 = resampleBadge(96);
const p72 = resampleBadge(72);
const p192 = resampleBadge(192);

fs.writeFileSync('public/notification-badge.png', p96);
fs.writeFileSync('public/notification-badge-96.png', p96);
fs.writeFileSync('public/notification-badge-72.png', p72);
fs.writeFileSync('public/notification-badge-192.png', p192);
fs.writeFileSync('public/safar-badge-mono.png', p96);

console.log('✅ Successfully generated transparent monochrome Safar notification badges:');
console.log(' - public/notification-badge.png (96x96, xhdpi)');
console.log(' - public/notification-badge-96.png (96x96)');
console.log(' - public/notification-badge-72.png (72x72, hdpi)');
console.log(' - public/notification-badge-192.png (192x192, xxxhdpi)');
console.log(' - public/safar-badge-mono.png (96x96)');
