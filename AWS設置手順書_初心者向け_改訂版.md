# RS Profile Badge Composer - AWS設置手順書（初心者向け・改訂版）

## 🔍 この手順書について

「Merge pull request」ボタンが見つからない方向けの改訂版です。
2つの方法を用意していますので、お客様の状況に合わせてお選びください。

---

## 📋 事前確認：あなたのGitHub権限を確認しましょう

### 確認方法
1. https://github.com/Cyberoptic/rs_profile-badge-composer にアクセス
2. 画面右上の「Settings」タブが見えますか？

#### ✅ 「Settings」タブが見える場合
→ **方法A（GitHubでマージ）** を使用してください

#### ❌ 「Settings」タブが見えない場合
→ **方法B（コマンドラインでマージ）** を使用してください

---

# 方法A：GitHubでマージする（推奨）

## ステップ1：PRページで「Merge pull request」ボタンを探す

### 1-1. PRページを開く
https://github.com/Cyberoptic/rs_profile-badge-composer/pull/1

### 1-2. ページを**一番下までスクロール**してください
💡 マージボタンは、コメント欄やファイル一覧の**さらに下**にあります

### 1-3. 見つけるべき画面要素

**正しい画面では以下が表示されています：**

```
┌─────────────────────────────────────────────┐
│ ✅ This branch has no conflicts with the    │
│    base branch                               │
│                                              │
│ [Merge pull request ▼]  緑色のボタン         │
│                                              │
│ または                                        │
│                                              │
│ • Squash and merge                          │
│ • Rebase and merge                          │
└─────────────────────────────────────────────┘
```

### 1-4. ボタンが見つからない場合

以下のメッセージが表示されていませんか？

#### パターン1：権限不足のメッセージ
```
「Ask someone with write access to this repository to merge this pull request」
（このリポジトリへの書き込み権限を持つ人にマージを依頼してください）
```
→ **方法B（コマンドラインでマージ）** に進んでください

#### パターン2：競合エラー
```
「This branch has conflicts that must be resolved」
（このブランチには解決が必要な競合があります）
```
→ **方法B（コマンドラインでマージ）** に進んでください

### 1-5. ボタンが見つかった場合

1. **「Merge pull request」** ボタンをクリック
2. **「Confirm merge」** ボタンをクリック
3. ✅ 「Pull request successfully merged and closed」と表示されればOK

**→ ステップ2（AWS Amplifyの設定）に進んでください**

---

# 方法B：コマンドラインでマージする

GitHubの画面からマージできない場合、コマンドラインで直接マージします。

## 必要なもの
- ✅ パソコンのターミナル（WindowsならGit Bash、MacならTerminal）
- ✅ Gitがインストールされていること
- ✅ GitHubアカウントとの認証設定

## ステップB-1：リポジトリをクローン（初回のみ）

### 既にリポジトリをお持ちの方
このステップはスキップして「ステップB-2」へ進んでください。

### リポジトリをまだお持ちでない方

ターミナルを開いて、以下を実行：

```bash
# 作業フォルダに移動（例：デスクトップ）
cd ~/Desktop

# リポジトリをクローン
git clone https://github.com/Cyberoptic/rs_profile-badge-composer.git

# フォルダに移動
cd rs_profile-badge-composer
```

💡 **この作業の意味**  
GitHubからあなたのパソコンにプロジェクトをコピーしています。

## ステップB-2：最新情報を取得

```bash
# 現在の場所を確認
pwd
# 表示例：/Users/yourname/Desktop/rs_profile-badge-composer

# 最新情報を取得
git fetch origin

# mainブランチに切り替え
git checkout main

# mainブランチを最新に更新
git pull origin main
```

💡 **この作業の意味**  
GitHubの最新状態をあなたのパソコンに反映させています。

## ステップB-3：開発ブランチをマージ

```bash
# genspark_ai_developerブランチをmainブランチにマージ
git merge origin/genspark_ai_developer -m "Deploy: Merge production-ready code to main"
```

### ⚠️ エラーが出た場合

#### エラー例1：競合（conflict）
```
CONFLICT (content): Merge conflict in src/components/ProfileBadgeComposer.jsx
```

**対処方法：**
```bash
# 競合を確認
git status

# 競合ファイルを開いて手動で修正
# エディタで「<<<<<<<」「=======」「>>>>>>>」マークを探して修正

# 修正後、ステージング
git add .

# マージを完了
git commit -m "Deploy: Resolve merge conflicts"
```

#### エラー例2：認証エラー
```
Permission denied (publickey)
```

**対処方法：**
GitHubの認証設定が必要です。以下のいずれかを実行してください：
- GitHubにSSH鍵を登録する
- HTTPS認証を使用する（Personal Access Tokenが必要）

詳しくは → https://docs.github.com/ja/authentication

## ステップB-4：GitHubにプッシュ

```bash
# mainブランチをGitHubにプッシュ
git push origin main
```

### 成功メッセージの例
```
To https://github.com/Cyberoptic/rs_profile-badge-composer.git
   150537f..fcc2eab  main -> main
```

✅ これが表示されれば、マージ完了です！

## ステップB-5：PR状態の確認

ブラウザで再度PRページを開いてください：
https://github.com/Cyberoptic/rs_profile-badge-composer/pull/1

**以下のように表示されていればOK：**
```
✅ Merged
Cyberoptic merged 10 commits into main from genspark_ai_developer
```

**→ ステップ2（AWS Amplifyの設定）に進んでください**

---

# ステップ2：AWS Amplifyでアプリをデプロイ

ここからは方法A・Bどちらでも同じ手順です。

## 2-1. AWSマネジメントコンソールにログイン

### アカウントをお持ちでない場合
1. https://aws.amazon.com/jp/ にアクセス
2. 右上の「アカウント作成」をクリック
3. メールアドレス、パスワード、クレジットカード情報を入力
   - ⚠️ 無料枠内で使用すれば料金は発生しません
   - ⚠️ クレジットカードは本人確認のために必要です

### 既にアカウントをお持ちの場合
1. https://console.aws.amazon.com/ にアクセス
2. メールアドレスとパスワードでログイン

💡 **AWS無料利用枠について**  
新規アカウントは12ヶ月間、多くのサービスを無料で利用できます。  
詳細 → https://aws.amazon.com/jp/free/

## 2-2. AWS Amplifyサービスを開く

### 方法1：検索から開く
1. 画面上部の検索ボックスに「**Amplify**」と入力
2. 検索結果から「**AWS Amplify**」をクリック

### 方法2：サービス一覧から開く
1. 左上の「サービス」メニューをクリック
2. 「フロントエンドのウェブとモバイル」カテゴリから「**AWS Amplify**」を選択

💡 **AWS Amplifyとは？**  
ウェブアプリを簡単に公開できるサービスです。GitHubと連携して自動でデプロイできます。

## 2-3. 新しいアプリを作成

1. 「**新しいアプリ**」ボタン（または「Get Started」）をクリック
2. 「**GitHub**」を選択
3. 「**続行**」または「Continue」をクリック

### 🔐 GitHub認証画面が表示されます

#### 初回の場合
1. 「**Authorize AWS Amplify**」（AWS Amplifyを認証する）をクリック
2. GitHubのパスワードを入力して確認

#### 既に認証済みの場合
この画面はスキップされます。

💡 **この作業の意味**  
AWSがあなたのGitHubリポジトリにアクセスできるように許可しています。

## 2-4. リポジトリとブランチを選択

### リポジトリ選択
1. ドロップダウンメニューから「**Cyberoptic/rs_profile-badge-composer**」を選択
2. もし表示されない場合：
   - 「リポジトリが見つかりませんか？」をクリック
   - GitHub側で再度アクセス許可を確認

### ブランチ選択
1. ブランチは「**main**」を選択
2. ✅ モノレポ（monorepo）のチェックボックスは**オフ**のまま
3. 「**次へ**」または「Next」をクリック

💡 **ブランチとは？**  
コードのバージョン管理における「作業の流れ」です。  
mainブランチは「本番環境用の確定したコード」が入っています。

## 2-5. ビルド設定を確認

Amplifyが自動的に設定を検出します：

### 表示される情報
```
アプリ名: rs_profile-badge-composer
環境: production
ビルドコマンド: npm run build
ビルドディレクトリ: dist
Node.jsバージョン: 18
```

### 重要：amplify.ymlが検出されているか確認

「✅ amplify.yml detected」と表示されていればOK

### 設定の編集（必要に応じて）

#### アプリ名を変更したい場合
デフォルトの「rs_profile-badge-composer」から変更できます。  
例：「rs-badge-composer-prod」など

#### 環境名を変更したい場合
デフォルトの「production」から変更できます。  
例：「prod」「main」など

### 続行
「**次へ**」または「Next」をクリック

💡 **ビルドとは？**  
あなたが書いたソースコードを、ブラウザで動くファイルに変換する作業です。  
Viteが自動的に最適化されたHTMLとJavaScriptを生成します。

## 2-6. 最終確認と作成

### 確認画面で以下をチェック
- ✅ リポジトリ：Cyberoptic/rs_profile-badge-composer
- ✅ ブランチ：main
- ✅ アプリ名：（あなたが設定した名前）
- ✅ ビルド設定：amplify.ymlを使用

### デプロイ開始
「**保存してデプロイ**」または「Save and deploy」をクリック

💡 **この作業の意味**  
ここまでの設定を保存して、実際にアプリの公開作業を開始します。

---

# ステップ3：デプロイの進行を確認

## 3-1. デプロイ画面の見方

デプロイが始まると、以下のような画面が表示されます：

```
┌─────────────────────────────────────────┐
│ main                                     │
│                                          │
│ ● Provision    ← 環境準備中              │
│ ○ Build        ← ビルド待機中             │
│ ○ Deploy       ← デプロイ待機中           │
│ ○ Verify       ← 検証待機中              │
└─────────────────────────────────────────┘
```

### ステータスの意味
- ⚪️ 灰色：まだ実行していない
- 🔵 青色（回転中）：現在実行中
- ✅ 緑色：成功
- ❌ 赤色：エラー

## 3-2. 各ステップの所要時間

| ステップ | 説明 | 目安時間 |
|---------|------|---------|
| **Provision** | サーバー環境を準備 | 1-2分 |
| **Build** | npm installとnpm run buildを実行 | 2-3分 |
| **Deploy** | ビルドしたファイルをCDNに配置 | 1分 |
| **Verify** | デプロイが正しくできたか確認 | 30秒 |

**合計：約5-7分**

💡 コーヒーを淹れたり、一息つく時間です☕

## 3-3. ビルドログを確認（任意）

各ステップをクリックすると、詳細なログが表示されます。

### Buildステップで確認すべきポイント

#### ✅ 成功している場合
```
npm install
...
added 250 packages

npm run build
...
✓ built in 3.45s
dist/index.html                    0.50 kB
dist/assets/index-xxxxx.js       150.25 kB
```

#### ❌ エラーの場合
```
ERROR: Module not found
npm ERR! code ENOENT
```

→ **「よくある問題と解決方法」** を参照してください

---

# ステップ4：アプリにアクセス

## 4-1. デプロイ完了を確認

すべてのステップが ✅ 緑色になったら完了です！

```
┌─────────────────────────────────────────┐
│ main                                     │
│                                          │
│ ✅ Provision    完了                     │
│ ✅ Build        完了                     │
│ ✅ Deploy       完了                     │
│ ✅ Verify       完了                     │
│                                          │
│ 🌐 https://main.xxxxx.amplifyapp.com   │
└─────────────────────────────────────────┘
```

## 4-2. アプリのURLを取得

### 方法1：デプロイ画面から
画面上部に表示されている「🌐 https://...」のURLをクリック

### 方法2：アプリの詳細画面から
1. 左サイドバーの「アプリ設定」→「全般」
2. 「アプリのURL」セクションに表示

## 4-3. URLの形式

```
https://main.d1234567890ab.amplifyapp.com
         ↑    ↑
      ブランチ名  自動生成されたID
```

### カスタムドメインを設定する場合
「ドメイン管理」から独自ドメインを追加できます（任意）。  
例：`https://badge.rs-corporation.com`

💡 **カスタムドメインは後から設定できます**  
まずはAmplifyのデフォルトURLで動作確認してください。

## 4-4. アプリの動作確認

ブラウザでURLを開いて、以下を確認してください：

### ✅ チェックリスト
- [ ] 画面が正しく表示される
- [ ] 「画像を追加」エリアが表示される
- [ ] ファイルをドラッグ&ドロップできる
- [ ] プレビューが表示される
- [ ] ダウンロードボタンが機能する

### 🎉 すべて動作していれば、デプロイ成功です！

---

# 自動デプロイの仕組み

## これ以降の更新作業

今後、コードを更新したい場合：

### 1. ローカルで変更を加える
```bash
# ファイルを編集

# 変更をコミット
git add .
git commit -m "機能追加: 〇〇"

# GitHubにプッシュ
git push origin main
```

### 2. 自動デプロイが開始される
GitHubにプッシュすると、**AWS Amplifyが自動的に検知**して再ビルド＆再デプロイします。

### 3. 数分後にアプリが更新される
約5-7分後、変更が反映されたアプリがライブになります。

💡 **これがCI/CD（継続的インテグレーション/デプロイ）です！**  
手動でサーバーにアップロードする必要はありません。

---

# よくある問題と解決方法

## 問題1：「Merge pull request」ボタンが見つからない

### 原因
- ページを下までスクロールしていない
- マージ権限がない
- PRが既にマージされている

### 解決方法
1. PRページを**一番下までスクロール**
2. それでも見つからない場合は「**方法B（コマンドラインでマージ）**」を使用

## 問題2：ビルドエラー「Module not found」

### エラーメッセージの例
```
Error: Cannot find module 'react'
```

### 原因
`package.json`と実際のコードで使用しているモジュールが一致していない

### 解決方法
```bash
# ローカルで依存関係を再インストール
cd /path/to/rs_profile-badge-composer
npm install

# package-lock.jsonも含めてコミット
git add package.json package-lock.json
git commit -m "fix: update dependencies"
git push origin main
```

## 問題3：デプロイ後に画面が真っ白

### 原因
JavaScriptのエラー、またはファイルパスの問題

### 解決方法
1. ブラウザの開発者ツールを開く（F12キー）
2. 「Console」タブでエラーを確認
3. エラーメッセージを元に修正

### よくあるエラー
```
Failed to load module script
```
→ Viteの設定（`vite.config.js`）の`base`パスを確認

## 問題4：GitHubの認証エラー

### エラーメッセージの例
```
Permission denied (publickey)
fatal: Could not read from remote repository
```

### 解決方法（HTTPS認証を使用）
```bash
# HTTPSでクローン
git clone https://github.com/Cyberoptic/rs_profile-badge-composer.git

# またはリモートURLを変更
git remote set-url origin https://github.com/Cyberoptic/rs_profile-badge-composer.git
```

### 解決方法（SSH鍵を設定）
1. SSH鍵を生成：`ssh-keygen -t ed25519 -C "your_email@example.com"`
2. GitHubに公開鍵を登録：https://github.com/settings/keys
3. 再度プッシュを試みる

詳細 → https://docs.github.com/ja/authentication/connecting-to-github-with-ssh

## 問題5：AWS Amplifyでリポジトリが見つからない

### 原因
AmplifyにGitHubのアクセス権限が付与されていない

### 解決方法
1. GitHubの設定ページを開く：https://github.com/settings/installations
2. 「AWS Amplify」の設定を開く
3. 「Repository access」で対象リポジトリへのアクセスを許可
4. Amplifyの画面に戻って再読み込み

## 問題6：デプロイは成功したがアプリが古いまま

### 原因
ブラウザのキャッシュ

### 解決方法
- **Windows/Linux**: Ctrl + Shift + R（スーパーリロード）
- **Mac**: Cmd + Shift + R
- または：ブラウザのキャッシュをクリア

---

# 用語集

## GitHub関連

### リポジトリ（Repository）
プロジェクトのファイルとその履歴を保管する場所。  
例：書類を保管するキャビネット

### ブランチ（Branch）
コードの並行した開発ラインを管理する仕組み。  
例：本の章ごとに別々に執筆してから最後に結合

### プルリクエスト（Pull Request、PR）
変更内容を確認してもらい、mainブランチに統合する依頼。  
例：編集した原稿を編集長に提出して承認を得る

### マージ（Merge）
あるブランチの変更を別のブランチに統合すること。  
例：別々に書いた章を1つの本にまとめる

### コミット（Commit）
変更内容を記録すること。スナップショットのようなもの。  
例：文書の「上書き保存」+ 変更履歴の記録

### プッシュ（Push）
ローカルの変更をGitHubに送信すること。  
例：パソコンのファイルをクラウドストレージにアップロード

### クローン（Clone）
GitHubからリポジトリをダウンロードすること。  
例：クラウドのファイルを自分のパソコンにダウンロード

## AWS関連

### AWS（Amazon Web Services）
Amazonが提供するクラウドコンピューティングサービス。

### AWS Amplify
ウェブアプリやモバイルアプリをホスティング（公開）するサービス。

### デプロイ（Deploy）
アプリを本番環境に配置して、一般公開すること。  
例：完成した製品を店頭に並べる

### ビルド（Build）
ソースコードを実行可能な形式に変換すること。  
例：小麦粉と卵からパンを焼く

### CI/CD
継続的インテグレーション/継続的デプロイ。  
コードの変更を自動でテスト＆デプロイする仕組み。

### ホスティング（Hosting）
ウェブサイトやアプリを公開するためのサーバーを提供すること。

## 開発関連

### Vite
高速なフロントエンド開発ツール。ビルドとホットリロードを提供。

### React
ユーザーインターフェースを構築するためのJavaScriptライブラリ。

### Node.js
JavaScriptをサーバー側でも実行できる実行環境。

### npm
Node.jsのパッケージ管理ツール。ライブラリのインストールに使用。

### amplify.yml
AWS Amplifyのビルド設定ファイル。  
どのコマンドでビルドするか、どのファイルをデプロイするかを指定。

---

# 印刷用チェックリスト

作業の進捗管理にご活用ください。

## ステップ1：PRのマージ

### 方法A（GitHub）
- [ ] PRページにアクセス
- [ ] ページを下までスクロール
- [ ] 「Merge pull request」ボタンをクリック
- [ ] 「Confirm merge」をクリック
- [ ] マージ成功のメッセージを確認

### 方法B（コマンドライン）
- [ ] リポジトリをクローン（初回のみ）
- [ ] `git fetch origin`
- [ ] `git checkout main`
- [ ] `git merge origin/genspark_ai_developer`
- [ ] （競合があれば解決）
- [ ] `git push origin main`
- [ ] PRページでマージ状態を確認

## ステップ2：AWS Amplifyの設定
- [ ] AWSマネジメントコンソールにログイン
- [ ] AWS Amplifyサービスを開く
- [ ] 「新しいアプリ」をクリック
- [ ] GitHubを選択して認証
- [ ] リポジトリ「Cyberoptic/rs_profile-badge-composer」を選択
- [ ] ブランチ「main」を選択
- [ ] ビルド設定を確認（amplify.yml検出）
- [ ] 「保存してデプロイ」をクリック

## ステップ3：デプロイの確認
- [ ] Provisionステップ完了を確認（✅）
- [ ] Buildステップ完了を確認（✅）
- [ ] Deployステップ完了を確認（✅）
- [ ] Verifyステップ完了を確認（✅）

## ステップ4：アプリの動作確認
- [ ] アプリのURLをコピー
- [ ] ブラウザでURLを開く
- [ ] 画面が正しく表示される
- [ ] 画像アップロード機能が動作する
- [ ] プレビュー表示が動作する
- [ ] ダウンロード機能が動作する

## 🎉 完了！

---

# 困ったときの連絡先

## 公式ドキュメント

### AWS Amplify
https://docs.aws.amazon.com/ja_jp/amplify/

### GitHub
https://docs.github.com/ja

### Vite
https://ja.vitejs.dev/

## サポート

### AWSサポート
https://aws.amazon.com/jp/premiumsupport/

### GitHubサポート
https://support.github.com/

---

**最終更新：2025年10月16日**  
**バージョン：2.0（PRマージ問題対応版）**

# 📧 この手順書に関するご質問

この手順書でわからないことがあれば、以下をお知らせください：

1. どのステップで困っていますか？
2. どんなエラーメッセージが表示されていますか？
3. スクリーンショットを共有できますか？

できる限りサポートいたします！
