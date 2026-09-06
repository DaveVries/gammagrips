/**
 * Pack the favicon PNGs into a multi-size .ico.
 *
 * An ICO is a 6-byte header, one 16-byte directory entry per image, then the
 * image payloads — and since Vista those payloads may be PNGs verbatim, so no
 * BMP encoding is needed. sharp cannot write ICO, and this is ~30 lines.
 */
import { readFileSync, writeFileSync } from "node:fs";

const sizes = [16, 32, 48];
const pngs = sizes.map((s) => readFileSync(`brand/png/favicon-${s}.png`));

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // 1 = icon
header.writeUInt16LE(sizes.length, 4);

let offset = 6 + 16 * sizes.length;
const entries = sizes.map((s, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(s === 256 ? 0 : s, 0); // width  (0 means 256)
  e.writeUInt8(s === 256 ? 0 : s, 1); // height
  e.writeUInt8(0, 2); // palette size, 0 for truecolour
  e.writeUInt8(0, 3); // reserved
  e.writeUInt16LE(1, 4); // colour planes
  e.writeUInt16LE(32, 6); // bits per pixel
  e.writeUInt32LE(pngs[i].length, 8);
  e.writeUInt32LE(offset, 12);
  offset += pngs[i].length;
  return e;
});

writeFileSync("src/app/favicon.ico", Buffer.concat([header, ...entries, ...pngs]));
console.log(`favicon.ico  ${sizes.join("/")}px  ${offset} bytes`);
