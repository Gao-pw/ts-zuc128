import { ZUC128 } from '../dist/index.js';

const key = new Uint8Array(16).map((_, i) => i + 1);
const iv = new Uint8Array(16).map((_, i) => 16 - i);

const zuc = new ZUC128(key, iv);
const msg = new TextEncoder().encode('Hello 祖冲之 ZUC-128!');
const cipher = zuc.crypt(msg);
const back = new ZUC128(key, iv).crypt(cipher);

console.log('原文:', new TextDecoder().decode(msg));
console.log(
    '密文:',
    Array.from(cipher, (b) => ('0' + b.toString(16)).slice(-2)).join(' '),
);
console.log('解密:', new TextDecoder().decode(back));
