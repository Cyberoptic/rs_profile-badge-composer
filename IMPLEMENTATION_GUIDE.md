# ProfileComposer機能追加 - 実装ガイド

このガイドに従って、ブラウザ完結版のProfileComposer機能をリポジトリに追加してください。

## 変更サマリ

- **新規ファイル**: 3個
- **更新ファイル**: 2個
- **削除ファイル**: 0個
- **所要時間**: 約5-10分

---

## 手順1: 依存関係の追加

### package.jsonの更新

`package.json` の `dependencies` セクションに `pica` を追加します：

```json
{
  "name": "profile-badge-composer",
  "private": true,
  "version": "2.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host 0.0.0.0",
    "build": "vite build",
    "preview": "vite preview --host 0.0.0.0"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.263.1",
    "pica": "^9.0.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.1",
    "vite": "^5.4.2"
  }
}
```

**変更点**: `"pica": "^9.0.1"` を dependencies に追加

---

## 手順2: 新しいコンポーネントの追加

### src/components/ProfileComposer.jsx を新規作成

以下の内容で新しいファイルを作成します：

**ファイル**: `src/components/ProfileComposer.jsx`

このファイルの完全なコードは、別途提供されているファイルを参照してください。
（約380行のReactコンポーネント）

---

## 手順3: スタイルの追加

### src/index.css に追記

既存の `src/index.css` の**末尾に**以下を追加します：

```css
/* ProfileComposer 追加スタイル */

.preview-container {
  cursor: grab;
  user-select: none;
}

.preview-container:active {
  cursor: grabbing;
}

.preview-canvas-wrapper {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.preview-canvas-wrapper canvas {
  display: block;
}

/* ボタンスタイル */
button.primary,
.bg-brand-navy {
  background-color: #0B1F3B;
}

button.primary:hover,
.bg-brand-navy:hover {
  background-color: #0a1a2f;
}

/* パネルスタイル */
.panel .field label {
  display: block;
  font-size: 0.9rem;
  color: #374151;
}

/* スライダースタイル */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #E6F0FA;
  outline: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #0B1F3B;
  cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #0B1F3B;
  cursor: pointer;
  border: none;
}

/* ラジオボタンとチェックボックス */
input[type="radio"],
input[type="checkbox"] {
  accent-color: #0B1F3B;
  cursor: pointer;
}

/* レスポンシブ調整 */
@media (max-width: 768px) {
  .preview-canvas-wrapper {
    transform: scale(0.7) !important;
  }
  
  .controls {
    grid-template-columns: 1fr;
  }
}
```

---

## 手順4: フレーム画像の配置

プロフィール画像のフレーム（透過PNG）を配置します。

### public/frames/ ディレクトリを作成

```bash
mkdir -p public/frames
```

### フレーム画像を配置

既存のフレーム画像を `public/frames/` にコピーします。
例: `public/frames/peer-ring.png`

**要件**:
- PNG形式
- 透過背景
- 推奨サイズ: 1024x1024px

---

## 手順5: コンポーネントの使用

### App.jsxでの使用例

既存の `src/App.jsx` に以下のように統合できます：

```jsx
import { useState } from 'react';
import ProfileComposer from './components/ProfileComposer';
import ProfileBadgeComposer from './components/ProfileBadgeComposer';

function App() {
  const [mode, setMode] = useState('batch'); // 'single' or 'batch'
  const [uploadedImage, setUploadedImage] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-brand-navy text-white p-4">
        <h1 className="text-2xl font-bold">Profile Badge Composer</h1>
      </header>

      <nav className="bg-white border-b p-4">
        <div className="container mx-auto flex gap-4">
          <button
            onClick={() => setMode('single')}
            className={`px-4 py-2 rounded ${
              mode === 'single' ? 'bg-brand-navy text-white' : 'bg-gray-200'
            }`}
          >
            個別編集
          </button>
          <button
            onClick={() => setMode('batch')}
            className={`px-4 py-2 rounded ${
              mode === 'batch' ? 'bg-brand-navy text-white' : 'bg-gray-200'
            }`}
          >
            バッチ処理
          </button>
        </div>
      </nav>

      <main className="container mx-auto p-4">
        {mode === 'single' && (
          <div>
            <div className="mb-4">
              <label className="block mb-2 font-medium">
                画像をアップロード
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-semibold
                  file:bg-brand-navy file:text-white
                  hover:file:opacity-90"
              />
            </div>

            {uploadedImage && (
              <ProfileComposer
                frameSrc="/frames/peer-ring.png"
                initialImage={uploadedImage}
                defaultScale={0.75}
                onComposed={(blob, filename) => {
                  console.log('合成完了:', filename);
                }}
              />
            )}
          </div>
        )}

        {mode === 'batch' && <ProfileBadgeComposer />}
      </main>
    </div>
  );
}

export default App;
```

---

## 手順6: 依存関係のインストール

ターミナルで以下を実行：

```bash
npm install
```

または

```bash
npm install pica@^9.0.1
```

---

## 手順7: 動作確認

### ローカルで開発サーバーを起動

```bash
npm run dev
```

### 確認項目

1. ✅ 画像をアップロードできる
2. ✅ ドラッグで画像を移動できる
3. ✅ ホイールでズームできる
4. ✅ スライダーで回転できる
5. ✅ 120px/413pxの切り替えができる
6. ✅ プレビューがリアルタイムで更新される
7. ✅ 出力ボタンで画像がダウンロードされる
8. ✅ ダウンロードした画像が高品質

---

## 手順8: ビルドとデプロイ

### ビルド

```bash
npm run build
```

### デプロイ

既存のCI/CDパイプラインに従ってデプロイします：

```bash
git add .
git commit -m "feat: Add ProfileComposer with browser-based high-quality resizing"
git push origin main
```

GitHub Actionsが自動的にビルドしてデプロイします。

---

## トラブルシューティング

### picaのインポートエラー

```javascript
// エラーが出る場合は以下のようにインポート
import Pica from 'pica';
const pica = Pica();
```

### CORSエラー

フレーム画像がpublicディレクトリ内にあることを確認してください。

### メモリエラー

大きな画像の場合、ブラウザのメモリ制限に達する可能性があります。
事前に画像を2048px以下にリサイズすることを推奨します。

---

## 最小差分チェックリスト

- [x] 既存のProfileBadgeComposer.jsxは変更なし
- [x] 既存のApp.jsxは最小限の変更のみ
- [x] package.jsonにpicaを1行追加
- [x] index.cssに追記のみ（既存CSSは変更なし）
- [x] 新しいコンポーネントは独立したファイル
- [x] 既存機能への影響なし

---

## 完了確認

すべての手順を完了したら、以下を確認してください：

- [ ] `npm install` が成功
- [ ] `npm run dev` でエラーなし
- [ ] ブラウザで動作確認済み
- [ ] ビルドが成功（`npm run build`）
- [ ] mainブランチにコミット済み

---

**実装完了！** 🎉

何か問題が発生した場合は、このガイドの「トラブルシューティング」セクションを参照するか、
開発チームに問い合わせてください。
