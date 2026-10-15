// Generates public/grain.png: a 64x64 grey+alpha tile of sparse ink specks with low alpha.
// Tiled on <body> as a plain background (no blend mode, no filter).
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";

const W = 64, H = 64;
let seed = 7;
const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);

const raw = Buffer.alloc((W * 2 + 1) * H);
for (let y = 0; y < H; y++) {
  raw[y * (W * 2 + 1)] = 0; // filter: none
  for (let x = 0; x < W; x++) {
    const o = y * (W * 2 + 1) + 1 + x * 2;
    const r = rand();
    raw[o] = 19; // grey (ink)
    raw[o + 1] = r > 0.55 ? Math.round((r - 0.55) * 40) : 0; // alpha 0..18
  }
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc = (buf) => { let c = 0xffffffff; for (const b of buf) c = crcTable[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const c = Buffer.alloc(4); c.writeUInt32BE(crc(td));
  return Buffer.concat([len, td, c]);
};
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; ihdr[9] = 4; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk("IHDR", ihdr),
  chunk("IDAT", deflateSync(raw, { level: 9 })),
  chunk("IEND", Buffer.alloc(0)),
]);
writeFileSync(new URL("../public/grain.png", import.meta.url), png);
console.log(`public/grain.png ${png.length} bytes`);
