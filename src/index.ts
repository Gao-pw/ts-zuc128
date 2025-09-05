import { rotl } from './utils';
import box from './box';
import { type ZUCPlugin } from './plugin';
const { S0, S1 } = box;
export class ZUC128 {
    /**
     * 可以扩展密钥的实例
     * @param plugin
     */
    static use<P extends ZUCPlugin>(plugin: P): ReturnType<P> {
        return plugin(ZUC128) as ReturnType<P>;
    }

    /* LFSR 16 个 31-bit 寄存器（国标 6.1） */
    private s: u32[] = new Array(16);

    /* 非线性 F 单元内部寄存器 R1 R2（各 32 bit） */
    private r1: u32 = 0;
    private r2: u32 = 0;

    /* 构造同时完成初始化（密钥扩展） */
    constructor(key: Uint8Array, iv: Uint8Array) {
        if (key.length !== 16 || iv.length !== 16)
            throw new Error('ZUC-128 需要 16 B 密钥 + 16 B IV');
        this.init(key, iv);
    }

    /** 1. 密钥加载 + LFSR 初态（国标 6.2） */
    private init(key: Uint8Array, iv: Uint8Array): void {
        const d: u32[] = [
            0x44d7, 0x26bc, 0x626b, 0x135e, 0x5789, 0x35e2, 0x7135, 0x09af,
            0x4d78, 0x2f13, 0x6bc4, 0x1af1, 0x5e26, 0x3d4c, 0x47a8, 0x42d,
        ];

        // 把 16 B 密钥/IV 按大端拆成 16×16 bit → 填充到 s[0..15]
        for (let i = 0; i < 16; i++) {
            const k16 = (key[i] << 8) | iv[i];
            this.s[i] = k16 ^ d[i];
        }

        // 连续跑 32 拍，让寄存器充分混淆
        for (let i = 0; i < 32; i++) {
            this.bitReconstruction();
            this.f();
            this.lfsrWithInitialisationMode(this.r1 >>> 1);
        }
    }

    /** 2. 比特重组 BR（国标 6.3） */
    private bitReconstruction(): [u32, u32, u32, u32] {
        const s = this.s;
        const X0 = ((s[15] << 16) | (s[14] >>> 15)) >>> 0;
        const X1 = ((s[11] << 16) | (s[9] >>> 15)) >>> 0;
        const X2 = ((s[7] << 16) | (s[5] >>> 15)) >>> 0;
        const X3 = ((s[3] << 16) | (s[1] >>> 15)) >>> 0;
        return [X0, X1, X2, X3];
    }

    /** 3. 非线性函数 F（国标 6.4） */
    private f(): u32 {
        const [X0, X1, , X3] = this.bitReconstruction();

        const w = (X0 ^ this.r1) >>> 0;
        const w1 = this.r2;
        const w2 = (this.r1 ^ X1) >>> 0;

        // S 盒层
        const sb =
            (S0[w >>> 24] << 24) |
            (S1[(w >>> 16) & 0xff] << 16) |
            (S0[(w >>> 8) & 0xff] << 8) |
            S1[w & 0xff];

        const u = rotl(sb, 8) ^ w2;
        const v = rotl(u, 16) ^ w1;

        // 更新寄存器
        this.r1 = (rotl(X3 << 8, 9) ^ v) >>> 0;
        this.r2 = u >>> 0;

        return this.r1;
    }

    /** 4. LFSR 更新（初始化模式） */
    private lfsrWithInitialisationMode(u: u32): void {
        const s = this.s;
        const v = (s[0] & 0x7fffffff) >>> 0;
        for (let i = 0; i < 15; i++) s[i] = s[i + 1];
        s[15] = (v ^ u) >>> 0;
    }

    /** 5. LFSR 更新（工作模式） */
    private lfsrWithWorkMode(): void {
        const s = this.s;
        this.f();
        const v = (s[0] & 0x7fffffff) >>> 0;
        for (let i = 0; i < 15; i++) s[i] = s[i + 1];
        s[15] = v >>> 0;
    }

    /** 6. 生成 4 B 密钥流（对外最小粒度） */
    private nextWord(): u32 {
        this.lfsrWithWorkMode();
        const z = this.f() ^ this.bitReconstruction()[3];
        return z >>> 0;
    }

    /** 7. 加/解密接口：输入任意长度，返回等长密文/明文 */
    public crypt(plain: Uint8Array): Uint8Array {
        const out = new Uint8Array(plain.length);
        let i = 0;

        // 按 4 B 对齐批量生成
        while (i + 4 <= plain.length) {
            const z = this.nextWord();
            const view = new DataView(out.buffer, i);
            view.setUint32(0, z, false); // 大端
            for (let j = 0; j < 4; j++) out[i + j] ^= plain[i + j];
            i += 4;
        }

        // 剩余不足 4 B
        while (i < plain.length) {
            const byte = (this.nextWord() >>> (24 - (i & 3) * 8)) & 0xff;
            out[i] = plain[i] ^ byte;
            i++;
        }
        return out;
    }
}


