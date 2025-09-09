# @siroi/ts-zuc128

国密算法 ZUC128 的 TypeScript 实现

## 简介

`@siroi/ts-zuc128` 是一个基于 TypeScript 开发的国密算法 ZUC128 实现库，提供了符合国密标准的祖冲之序列密码算法（ZUC128）功能，可用于数据加密、解密等安全相关场景。

## 安装

使用 npm:

bash

```bash
npm install @siroi/ts-zuc128
```

使用 yarn:

bash

```bash
yarn add @siroi/ts-zuc128
```

使用 pnpm:

bash

```bash
pnpm add @siroi/ts-zuc128
```

## 用法示例

typescript

```typescript
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
```

### 构建

bash

```bash
pnpm build
```

![]()

### 发布

bash

```bash
pnpm release
```

![]()

## 许可证

本项目基于 MIT 许可证开源，详情参见 [LICENSE](https://www.doubao.com/chat/LICENSE) 文件。

## 仓库地址

[https://github.com/Gao-pw/ts-zuc128/](https://github.com/Gao-pw/ts-zuc128/)
