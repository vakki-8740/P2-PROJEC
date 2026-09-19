const fs = require('fs');
const path = require('path');

function createPNG(size) {
  const canvas = [];
  const r = Math.floor(size * 0.2);
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - size / 2;
      const dy = y - size / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < size / 2 - 2) {
        const gradient = (x + y) / (size * 2);
        const red = Math.floor(0 + gradient * 88);
        const green = Math.floor(122 - gradient * 24);
        const blue = Math.floor(255 - gradient * 87);
        canvas.push(red, green, blue, 255);
      } else if (dist < size / 2) {
        canvas.push(0, 0, 0, 255);
      } else {
        canvas.push(0, 0, 0, 0);
      }
    }
  }
  
  return canvas;
}

function writePNG(filename, size) {
  const data = createPNG(size);
  const width = size;
  const height = size;
  
  let png = [];
  
  png.push(137, 80, 78, 71, 13, 10, 26, 10);
  
  function crc32(arr) {
    let crc = 0xFFFFFFFF;
    const table = [];
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) {
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[i] = c;
    }
    for (let i = 0; i < arr.length; i++) {
      crc = table[(crc ^ arr[i]) & 0xFF] ^ (crc >>> 8);
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }
  
  function writeChunk(type, data) {
    const length = data.length;
    png.push((length >> 24) & 255, (length >> 16) & 255, (length >> 8) & 255, length & 255);
    
    const typeBytes = [];
    for (let i = 0; i < type.length; i++) {
      typeBytes.push(type.charCodeAt(i));
    }
    png.push(...typeBytes);
    
    const combined = [...typeBytes, ...data];
    const crc = crc32(combined);
    png.push(...data);
    png.push((crc >> 24) & 255, (crc >> 16) & 255, (crc >> 8) & 255, crc & 255);
  }
  
  const ihdr = [];
  ihdr.push((width >> 24) & 255, (width >> 16) & 255, (width >> 8) & 255, width & 255);
  ihdr.push((height >> 24) & 255, (height >> 16) & 255, (height >> 8) & 255, height & 255);
  ihdr.push(8, 6, 0, 0, 0);
  writeChunk('IHDR', ihdr);
  
  const rawData = [];
  for (let y = 0; y < height; y++) {
    rawData.push(0);
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      rawData.push(data[idx], data[idx + 1], data[idx + 2], data[idx + 3]);
    }
  }
  
  const zlib = require('zlib');
  const compressed = zlib.deflateSync(Buffer.from(rawData));
  writeChunk('IDAT', Array.from(compressed));
  
  writeChunk('IEND', []);
  
  fs.writeFileSync(filename, Buffer.from(png));
  console.log(`Created: ${filename} (${size}x${size})`);
}

const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

writePNG(path.join(iconsDir, 'icon-192.png'), 192);
writePNG(path.join(iconsDir, 'icon-512.png'), 512);

console.log('Icons created successfully!');
