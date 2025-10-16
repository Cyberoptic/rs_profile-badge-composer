# AWS Amplify デプロイガイド

このガイドでは、Profile Badge Composer を AWS Amplify にデプロイする手順を説明します。

---

## 📋 前提条件

- AWSアカウント（既存のものを使用）
- GitHubリポジトリへのアクセス権限
- AWS Amplify コンソールへのアクセス

---

## 🚀 デプロイ手順

### ステップ1: Pull Requestのマージ

1. **PRを確認**
   - URL: https://github.com/Cyberoptic/rs_profile-badge-composer/pull/1
   - タイトル: "feat: Comprehensive UI Improvements and Bug Fixes (6/7 User Requests Complete)"
   - すべての変更内容を確認

2. **mainブランチにマージ**
   ```bash
   # ローカルでの確認（オプション）
   git checkout main
   git pull origin main
   git merge genspark_ai_developer
   git push origin main
   ```
   
   または、GitHubのWebインターフェースから：
   - PRページで「Merge pull request」ボタンをクリック
   - マージ方法を選択（推奨: "Squash and merge"）
   - 「Confirm merge」をクリック

---

### ステップ2: AWS Amplify コンソールでの設定

#### 2-1. Amplify アプリの作成

1. **AWS Management Console にログイン**
   - https://console.aws.amazon.com/

2. **AWS Amplify サービスを開く**
   - サービス検索で「Amplify」と入力
   - 「AWS Amplify」を選択

3. **新しいアプリを作成**
   - 「Host web app」または「New app」をクリック
   - 「Host web app」を選択

#### 2-2. リポジトリの接続

1. **Git プロバイダーを選択**
   - 「GitHub」を選択
   - 「Continue」をクリック

2. **GitHub認証**
   - GitHubアカウントでログイン
   - AWS Amplifyにリポジトリへのアクセスを許可

3. **リポジトリとブランチを選択**
   - **Repository**: `Cyberoptic/rs_profile-badge-composer`
   - **Branch**: `main`
   - 「Next」をクリック

#### 2-3. ビルド設定の確認

1. **ビルド設定**
   - Amplifyが自動的に `amplify.yml` を検出します
   - 以下の設定が自動入力されます：
   
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: dist
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

2. **アプリ名の設定**
   - App name: `profile-badge-composer`（任意の名前）

3. **環境変数の設定（不要）**
   - このアプリは環境変数を使用しないため、設定不要

4. **詳細設定（オプション）**
   - すべてデフォルトのままでOK

5. **「Next」をクリック**

#### 2-4. 確認とデプロイ

1. **設定を確認**
   - リポジトリ: `Cyberoptic/rs_profile-badge-composer`
   - ブランチ: `main`
   - ビルド設定: `amplify.yml`
   - 出力ディレクトリ: `dist`

2. **「Save and deploy」をクリック**

---

### ステップ3: デプロイの監視

1. **ビルドプロセスの確認**
   - Amplify コンソールで自動的にビルドが開始されます
   - 以下の段階があります：
     - ✓ **Provision** (約1分): 環境のセットアップ
     - ✓ **Build** (約2-3分): npm install と build
     - ✓ **Deploy** (約1分): ビルド成果物のデプロイ
     - ✓ **Verify** (約30秒): デプロイの検証

2. **ビルドログの確認**
   - 各段階をクリックすると詳細ログが表示されます
   - エラーが発生した場合はログで原因を確認

3. **完了確認**
   - すべての段階が緑色のチェックマークになれば成功

---

### ステップ4: アプリケーションへのアクセス

1. **デプロイ完了後の URL**
   - Amplify コンソールに表示される URL をクリック
   - 形式: `https://main.xxxxxxxxxxxxx.amplifyapp.com`

2. **動作確認**
   - アプリケーションが正常に動作することを確認
   - 以下の機能をテスト：
     - ✓ 画像のアップロード
     - ✓ プレビューの表示
     - ✓ 設定の変更
     - ✓ テンプレートの保存/読込
     - ✓ 画像のダウンロード

---

## 🔧 カスタムドメインの設定（オプション）

### 独自ドメインの追加

1. **Amplify コンソールでアプリを開く**

2. **左メニューから「Domain management」を選択**

3. **「Add domain」をクリック**

4. **ドメインを入力**
   - 例: `badge-composer.example.com`

5. **DNS設定の更新**
   - Amplifyが提供するCNAMEレコードを、ドメインのDNS設定に追加
   - Route 53を使用している場合は自動設定可能

6. **SSL証明書の発行**
   - AWS Certificate Manager (ACM) が自動的にSSL証明書を発行
   - 通常5-10分で完了

7. **確認**
   - DNSの伝播を待つ（最大48時間、通常は数分～数時間）
   - カスタムドメインでアクセス可能になります

---

## 🔄 継続的デプロイ（CI/CD）

### 自動デプロイの仕組み

AWS Amplifyは、GitHubリポジトリと連携して自動デプロイを実行します：

1. **自動トリガー**
   - `main` ブランチへの push または PR のマージ
   - 自動的にビルド＆デプロイが開始

2. **デプロイフロー**
   ```
   GitHub (main branch)
     ↓ push/merge
   AWS Amplify
     ↓ 自動検知
   Build (npm ci → npm run build)
     ↓ 成功
   Deploy (dist → CloudFront CDN)
     ↓ 完了
   Live URL 更新
   ```

3. **ブランチベースのデプロイ**
   - 開発用ブランチ（例: `develop`）を追加して、別環境でテスト可能
   - Amplify コンソールで「Connect branch」から設定

---

## 📊 ビルド設定の詳細

### amplify.yml の構成

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci          # package-lock.json から正確にインストール
    build:
      commands:
        - npm run build   # Vite でプロダクションビルド
  artifacts:
    baseDirectory: dist   # ビルド出力ディレクトリ
    files:
      - '**/*'           # すべてのファイルをデプロイ
  cache:
    paths:
      - node_modules/**/* # 次回ビルドの高速化
```

### ビルド仕様

- **Node.js バージョン**: Amplify が自動選択（通常は最新 LTS）
- **ビルド時間**: 約2-3分
- **出力サイズ**: 約187KB（gzip後: 約59KB）
- **キャッシュ**: node_modules がキャッシュされ、2回目以降は高速化

---

## 🛠️ トラブルシューティング

### ビルドエラーが発生した場合

1. **ログの確認**
   - Amplify コンソールの「Build logs」でエラー詳細を確認

2. **よくあるエラー**

   **エラー: `npm ci` が失敗**
   ```
   解決策: package-lock.json が最新であることを確認
   git add package-lock.json
   git commit -m "update package-lock.json"
   git push origin main
   ```

   **エラー: `npm run build` が失敗**
   ```
   解決策: ローカルでビルドをテスト
   npm ci
   npm run build
   # エラーを修正してコミット
   ```

   **エラー: `dist` ディレクトリが見つからない**
   ```
   解決策: amplify.yml の baseDirectory を確認
   artifacts:
     baseDirectory: dist  # Vite のデフォルト出力
   ```

3. **ローカルでの再現**
   ```bash
   # Amplifyと同じ手順でビルド
   rm -rf node_modules
   npm ci
   npm run build
   ```

### デプロイ後にページが表示されない

1. **ブラウザキャッシュをクリア**
   - Ctrl + Shift + R (Windows/Linux)
   - Cmd + Shift + R (Mac)

2. **CloudFront のキャッシュをクリア**
   - Amplify コンソールで「Invalidate cache」を実行

3. **エラーコンソールを確認**
   - ブラウザの開発者ツールでJavaScriptエラーを確認

---

## 📈 パフォーマンスとスケーリング

### 自動最適化

AWS Amplifyは以下を自動で提供：

- ✓ **CDN配信**: CloudFront による高速配信
- ✓ **HTTPS**: 自動SSL証明書
- ✓ **圧縮**: Gzip/Brotli 圧縮
- ✓ **キャッシング**: 静的ファイルの効率的なキャッシュ
- ✓ **グローバル配信**: 世界中のエッジロケーション

### スケーリング

- **自動スケール**: トラフィック増加に自動対応
- **料金**: 無料枠あり（月1000ビルド分まで）
- **帯域幅**: 従量課金（最初の15GBは無料）

---

## 💰 料金について

### AWS Amplify 料金（2024年時点）

**ビルド & デプロイ**
- 最初の1,000ビルド分/月: 無料
- それ以降: $0.01/ビルド分

**ホスティング**
- 最初の15GB配信/月: 無料
- それ以降: $0.15/GB

**ストレージ**
- 最初の5GB/月: 無料
- それ以降: $0.023/GB

**このアプリの推定コスト**
- 月間10回デプロイ、1000ユーザー利用: **無料枠内**
- 月間100回デプロイ、10000ユーザー利用: **約$5-10**

---

## 📝 次のステップ

### デプロイ完了後

1. ✓ カスタムドメインの設定（オプション）
2. ✓ Google Analytics の追加（オプション）
3. ✓ エラー監視の設定（Sentry など）
4. ✓ ユーザーフィードバックの収集

### 継続的な改善

1. **パフォーマンス監視**
   - Amplify コンソールの「Monitoring」タブ
   - CloudWatch メトリクスの確認

2. **ユーザーフィードバック**
   - 実際の使用状況を監視
   - 改善点を収集

3. **定期的な更新**
   - 依存関係の更新
   - 新機能の追加
   - バグ修正

---

## 🎯 チェックリスト

デプロイ前の確認：

- [ ] PRがmainブランチにマージされている
- [ ] ローカルで `npm run build` が成功する
- [ ] amplify.yml が正しく設定されている
- [ ] GitHubリポジトリへのアクセス権限がある
- [ ] AWSアカウントにログインできる

デプロイ後の確認：

- [ ] Amplify URLでアプリが表示される
- [ ] 画像アップロード機能が動作する
- [ ] プレビュー表示が正常に動作する
- [ ] ダウンロード機能が動作する
- [ ] モバイルでも正常に表示される

---

## 🆘 サポート

問題が発生した場合：

1. **AWS Amplify ドキュメント**
   - https://docs.aws.amazon.com/amplify/

2. **GitHub Issues**
   - リポジトリのIssuesセクションで質問

3. **AWS サポート**
   - AWS Management Console からサポートケースを作成

---

## 🎉 完了！

Profile Badge Composer が AWS Amplify で稼働しています！

**アプリケーションURL**: `https://main.xxxxxxxxxxxxx.amplifyapp.com`

ユーザーにURLを共有して、アプリケーションを使ってもらいましょう！
