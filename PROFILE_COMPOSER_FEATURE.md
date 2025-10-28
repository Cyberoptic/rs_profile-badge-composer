# ProfileComposer 機能追加

## 概要

プロフィール画像編集機能を追加しました。既存のバッチ処理機能に加えて、個別の画像を細かく調整して出力できる新しいコンポーネントです。

## 新機能

### 1. 出力サイズ選択
- **120px**: Peer-Ring用の小さいサイズ
- **413px**: SNS用の大きいサイズ

### 2. 画像調整機能
- **ドラッグ移動**: マウスやタッチで画像を自由に移動
- **ホイールズーム**: マウスホイールで拡大縮小（60%〜120%）
- **スライダー調整**: 細かい回転調整（±5度）
- **数値入力**: X/Y座標の直接指定

### 3. UI補助機能
- **ガイド表示**: 中央線と三分割線の表示/非表示
- **背景モード**: 透過 or 白背景の選択
- **プレビュー**: リアルタイムで調整結果を確認

### 4. 高品質出力
- **Pica.js使用**: Lanczos3アルゴリズムによる高品質縮小
- **ブラウザ完結**: サーバー不要、すべてクライアント側で処理
- **デフォルト75%縮小**: 被写体が適切なサイズで出力

## 技術仕様

### 使用技術
- **React 18**: UIフレームワーク
- **Pica.js 9.0**: 高品質画像リサイズ（Lanczos3）
- **Canvas API**: 画像合成と変形処理
- **Tailwind CSS**: スタイリング

### ファイル構成
```
src/
├── components/
│   └── ProfileComposer.jsx    # 新規追加：プロフィール画像編集コンポーネント
└── index.css                   # ProfileComposer用スタイル追加
```

### 依存関係追加
```json
{
  "dependencies": {
    "pica": "^9.0.1"
  }
}
```

## 使用方法

### 基本的な使い方

```jsx
import ProfileComposer from './components/ProfileComposer';

function App() {
  return (
    <ProfileComposer
      frameSrc="/frames/peer-ring.png"
      initialImage="/path/to/user-image.jpg"
      defaultScale={0.75}
      onComposed={(blob, filename) => {
        console.log('合成完了:', filename);
      }}
    />
  );
}
```

### Props

| Prop | 型 | デフォルト | 説明 |
|------|------|-----------|------|
| `frameSrc` | string | (必須) | フレーム画像のパス（透過PNG） |
| `initialImage` | string | undefined | 初期表示する画像のパス |
| `defaultScale` | number | 0.75 | 初期拡大率（0.6〜1.2） |
| `onComposed` | function | undefined | 出力完了時のコールバック |
| `className` | string | "" | 追加のCSSクラス |

## 操作方法

### マウス操作
- **ドラッグ**: 画像を移動
- **ホイール**: 拡大/縮小

### タッチ操作
- **スワイプ**: 画像を移動
- **スライダー**: 拡大/縮小調整

### ボタン
- **リセット**: すべての調整を初期値に戻す
- **中央揃え**: X/Y位置を中央に戻す
- **この設定で出力**: 現在の設定で画像を生成・ダウンロード

## セーフエリア拘束

画像が枠から はみ出さないよう、自動的に移動範囲を制限しています。
- 円形のセーフエリアを想定
- 回転後の画像サイズを考慮
- ドラッグ時に自動的に拘束

## パフォーマンス

### 処理時間（目安）
- **120px出力**: 約0.5秒
- **413px出力**: 約1.5秒

### ブラウザ対応
- Chrome/Edge 90+
- Safari 14+
- Firefox 88+

## 既存機能との統合

既存の `ProfileBadgeComposer.jsx` はそのまま残し、新しい `ProfileComposer.jsx` を追加する形で実装しています。

### 統合例

```jsx
// App.jsx での使用例
import { useState } from 'react';
import ProfileComposer from './components/ProfileComposer';

function App() {
  const [mode, setMode] = useState('single'); // 'single' or 'batch'

  return (
    <div>
      <nav>
        <button onClick={() => setMode('single')}>個別編集</button>
        <button onClick={() => setMode('batch')}>バッチ処理</button>
      </nav>

      {mode === 'single' && (
        <ProfileComposer frameSrc="/frames/peer-ring.png" />
      )}
      
      {mode === 'batch' && (
        <ProfileBadgeComposer />
      )}
    </div>
  );
}
```

## トラブルシューティング

### 画像が表示されない
- フレーム画像のパスが正しいか確認
- 画像のCORS設定を確認
- ブラウザのコンソールでエラーを確認

### 出力が失敗する
- ブラウザのメモリ不足の可能性
- 画像サイズが大きすぎる場合は事前にリサイズ
- Pica.jsの読み込みを確認

### プレビューがカクつく
- 画像サイズを小さくする
- ガイド表示をオフにする
- ブラウザのハードウェアアクセラレーションを確認

## 今後の拡張予定

- [ ] Undo/Redo機能
- [ ] スナップ機能（グリッド吸着）
- [ ] 複数フレームの切り替え
- [ ] プリセット保存機能
- [ ] バッチ処理との連携

## ライセンス

既存プロジェクトと同じライセンスに従います。

---

**作成日**: 2025-10-28  
**バージョン**: 1.0.0  
**メンテナー**: RS IT Team
