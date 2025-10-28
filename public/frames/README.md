# フレーム画像について

このディレクトリには、プロフィール画像に合成するフレーム画像（透過PNG）を配置してください。

## 要件

- **形式**: PNG
- **背景**: 透過（アルファチャンネル付き）
- **推奨サイズ**: 1024x1024px
- **ファイル名例**: `peer-ring.png`, `certification-frame.png`

## 使用方法

ProfileComposerコンポーネントで以下のように指定します：

```jsx
<ProfileComposer frameSrc="/frames/peer-ring.png" />
```

## 既存のフレーム画像

既存のバッジ処理で使用しているフレーム画像を、このディレクトリにコピーしてご使用ください。
