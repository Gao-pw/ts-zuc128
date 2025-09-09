//#region src/plugin.d.ts
type ZUCPlugin = <T extends typeof ZUC128>(Z: T) => T & {
  new (...args: ConstructorParameters<T>): InstanceType<T>;
};
//#endregion
//#region src/index.d.ts
declare class ZUC128 {
  /**
   * 可以扩展密钥的实例
   * @param plugin
   */
  static use<P extends ZUCPlugin>(plugin: P): ReturnType<P>;
  private s;
  private r1;
  private r2;
  constructor(key: Uint8Array, iv: Uint8Array);
  /** 1. 密钥加载 + LFSR 初态（国标 6.2） */
  private init;
  /** 2. 比特重组 BR（国标 6.3） */
  private bitReconstruction;
  /** 3. 非线性函数 F（国标 6.4） */
  private f;
  /** 4. LFSR 更新（初始化模式） */
  private lfsrWithInitialisationMode;
  /** 5. LFSR 更新（工作模式） */
  private lfsrWithWorkMode;
  /** 6. 生成 4 B 密钥流（对外最小粒度） */
  private nextWord;
  /** 7. 加/解密接口：输入任意长度，返回等长密文/明文 */
  crypt(plain: Uint8Array): Uint8Array;
}
//#endregion
export { ZUC128 };