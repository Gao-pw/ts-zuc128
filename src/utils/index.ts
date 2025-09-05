/** 循环左移 (JS 的 >>> 保证无符号) */
export const rotl = (x: u32, n: number): u32 =>
  ((x << n) | (x >>> (32 - n))) >>> 0;

/** 按字节异或 */
export const xorBytes = (a: Uint8Array, b: Uint8Array): Uint8Array => {
  const out = new Uint8Array(a.length);
  for (let i = 0; i < a.length; i++) out[i] = a[i] ^ b[i];
  return out;
};