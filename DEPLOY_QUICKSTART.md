# AWS Amplify デプロイ - クイックスタート

## 🚀 5ステップでデプロイ

### 1️⃣ PRをマージ
```bash
# GitHub Web UIで以下を実行：
https://github.com/Cyberoptic/rs_profile-badge-composer/pull/1
→ 「Merge pull request」→「Confirm merge」
```

### 2️⃣ AWS Amplify を開く
1. https://console.aws.amazon.com/ にログイン
2. サービス検索で「Amplify」
3. 「Host web app」をクリック

### 3️⃣ GitHubと接続
1. 「GitHub」を選択
2. リポジトリ: `Cyberoptic/rs_profile-badge-composer`
3. ブランチ: `main`
4. 「Next」

### 4️⃣ ビルド設定（自動検出）
1. amplify.yml が自動検出される ✓
2. App name: `profile-badge-composer`
3. 「Next」→「Save and deploy」

### 5️⃣ 完了を待つ
- ⏱️ ビルド時間: 約3-5分
- ✅ 完了後、URLが表示されます
- 🌐 `https://main.xxxxxxxxxxxxx.amplifyapp.com`

---

## ✅ デプロイ完了後の確認

1. **URLにアクセス**
   - Amplify コンソールに表示されたURLをクリック

2. **動作テスト**
   - [ ] 画像アップロード
   - [ ] プレビュー表示
   - [ ] 設定変更
   - [ ] ダウンロード

3. **URLを共有**
   - ユーザーにデプロイされたURLを共有

---

## 🔧 トラブルシューティング

### ビルドエラー
```bash
# ローカルで確認
cd /home/user/webapp
npm ci
npm run build
# エラーがあれば修正してpush
```

### ページが表示されない
- ブラウザキャッシュをクリア: Ctrl + Shift + R
- 開発者ツールでエラーを確認

---

## 📚 詳細ドキュメント

完全なデプロイ手順は `AWS_DEPLOYMENT_GUIDE.md` を参照してください。

---

## 💡 継続的デプロイ

今後、`main` ブランチに push すると自動的にデプロイされます！

```bash
git push origin main
# → 自動的にAmplifyがビルド＆デプロイ
```

---

## 🎉 完了！

お疲れ様でした！アプリケーションがAWS上で動いています。
