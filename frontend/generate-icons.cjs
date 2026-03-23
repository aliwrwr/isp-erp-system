// Generates pwa-192x192.png and pwa-512x512.png
// Blue background (#2563eb) with white "ISP" text center
const zlib = require('zlib');
const fs   = require('fs');

const crcTable = (() => {
  const t = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len  = Buffer.allocUnsafe(4); len.writeUInt32BE(data.length, 0);
  const tb   = Buffer.from(type, 'ascii');
  const crcB = Buffer.allocUnsafe(4); crcB.writeUInt32BE(crc32(Buffer.concat([tb, data])), 0);
  return Buffer.concat([len, tb, data, crcB]);
}

// Simple 5x7 pixel font for digits/letters (only chars we need)
const FONT = {
  'I': [[0,1,1,1,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,1,1,1,0]],
  'S': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,0],[0,1,1,1,0],[0,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  'P': [[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0]],
};

function createPNG(size) {
  // --- pixel buffer (RGB) ---
  const pixels = Buffer.alloc(size * size * 3);

  // Background: #2563eb
  for (let i = 0; i < size * size; i++) {
    pixels[i * 3]     = 37;
    pixels[i * 3 + 1] = 99;
    pixels[i * 3 + 2] = 235;
  }

  // Draw rounded-rect "card" background — slightly lighter blue
  const pad = Math.round(size * 0.08);
  for (let y = pad; y < size - pad; y++) {
    for (let x = pad; x < size - pad; x++) {
      pixels[(y * size + x) * 3]     = 59;
      pixels[(y * size + x) * 3 + 1] = 130;
      pixels[(y * size + x) * 3 + 2] = 246;
    }
  }

  // Draw "ISP" text in white
  const letters = ['I', 'S', 'P'];
  const scale   = Math.max(1, Math.round(size / 32));  // pixel size of each dot
  const charW   = 5 * scale;
  const charH   = 7 * scale;
  const gap     = scale * 2;
  const totalW  = letters.length * charW + (letters.length - 1) * gap;
  const startX  = Math.round((size - totalW) / 2);
  const startY  = Math.round((size - charH) / 2);

  letters.forEach((letter, li) => {
    const bitmap = FONT[letter];
    const ox = startX + li * (charW + gap);
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 5; col++) {
        if (!bitmap[row][col]) continue;
        for (let sy = 0; sy < scale; sy++) {
          for (let sx = 0; sx < scale; sx++) {
            const px = ox + col * scale + sx;
            const py = startY + row * scale + sy;
            if (px < 0 || py < 0 || px >= size || py >= size) continue;
            pixels[(py * size + px) * 3]     = 255;
            pixels[(py * size + px) * 3 + 1] = 255;
            pixels[(py * size + px) * 3 + 2] = 255;
          }
        }
      }
    }
  });

  // Build PNG raw data (filter byte 0 per row + RGB)
  const rowSize = 1 + size * 3;
  const raw     = Buffer.allocUnsafe(size * rowSize);
  for (let y = 0; y < size; y++) {
    raw[y * rowSize] = 0;
    pixels.copy(raw, y * rowSize + 1, y * size * 3, (y + 1) * size * 3);
  }

  const compressed = zlib.deflateSync(raw, { level: 9 });

  const ihdr = Buffer.allocUnsafe(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  const sig = Buffer.from([137,80,78,71,13,10,26,10]);
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', compressed), chunk('IEND', Buffer.alloc(0))]);
}

for (const size of [192, 512]) {
  fs.writeFileSync(`public/pwa-${size}x${size}.png`, createPNG(size));
  console.log(`✅ public/pwa-${size}x${size}.png (${size}x${size})`);
}
