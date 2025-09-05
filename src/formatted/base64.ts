import type { ZUCPlugin } from '../plugin';

export const formatted: ZUCPlugin = (Z) => {
  return class extends Z {
    constructor(...args: any[]) {
      super(...args);
    }

    encryptBase64(plainText: string): string {
      const plain = new TextEncoder().encode(plainText);
      const cipher = this.crypt(plain);
      return btoa(String.fromCharCode(...cipher));
    }

    decryptBase64(b64: string): string {
      const cipher = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
      const plain = this.crypt(cipher);
      return new TextDecoder().decode(plain);
    }
  };
};