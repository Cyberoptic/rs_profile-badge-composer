# GitHub Actions 自動デプロイ設定ガイド

このガイドに従って、GitHub ActionsによるAWS S3への自動デプロイを設定します。

---

## 📋 前提条件

以下が既に設定されていることを前提としています：

- ✅ AWSアカウントがある
- ✅ S3バケットが作成済み
- ✅ CloudFrontディストリビューションが設定済み
- ✅ GitHubリポジトリへのアクセス権がある

---

## 🔐 ステップ1: AWS IAM OIDC プロバイダーの作成

GitHub ActionsがAWSにアクセスするための認証設定を行います。

### 1-1. AWS コンソールにログイン

https://console.aws.amazon.com/ にアクセスしてログインします。

### 1-2. IAMサービスを開く

1. 上部の検索バーに「**IAM**」と入力
2. 「IAM」をクリック

### 1-3. IDプロバイダーを追加

1. 左メニューから「**IDプロバイダー**」をクリック
2. 「**プロバイダーを追加**」ボタンをクリック
3. 以下の情報を入力：

| 項目 | 値 |
|------|-----|
| プロバイダーのタイプ | **OpenID Connect** |
| プロバイダーのURL | `https://token.actions.githubusercontent.com` |
| 対象者 | `sts.amazonaws.com` |

4. 「**プロバイダーを追加**」ボタンをクリック

✅ 完了！「token.actions.githubusercontent.com」というプロバイダーが作成されました。

---

## 👤 ステップ2: IAMロールの作成

GitHub Actionsが使用するIAMロールを作成します。

### 2-1. IAMロールページを開く

1. IAMダッシュボードの左メニューから「**ロール**」をクリック
2. 「**ロールを作成**」ボタンをクリック

### 2-2. 信頼されたエンティティを選択

1. 「**カスタム信頼ポリシー**」を選択
2. 以下のJSONをコピー＆ペースト（**YOUR_ACCOUNT_ID** と **YOUR_GITHUB_USERNAME** を実際の値に置き換えてください）：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::YOUR_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:YOUR_GITHUB_USERNAME/rs_profile-badge-composer:ref:refs/heads/main"
        }
      }
    }
  ]
}
```

**置き換え例**:
- `YOUR_ACCOUNT_ID` → `123456789012` （AWSアカウントID）
- `YOUR_GITHUB_USERNAME` → `Cyberoptic` （あなたのGitHubユーザー名）

3. 「**次へ**」をクリック

### 2-3. アクセス許可ポリシーをアタッチ

ここでは「**ポリシーをアタッチせずに次へ**」進みます（後で設定します）

1. 「**次へ**」をクリック

### 2-4. ロール名を設定

1. ロール名: `GitHubActionsDeployRole`
2. 説明（オプション）: `GitHub Actions用のデプロイロール`
3. 「**ロールを作成**」をクリック

✅ ロールが作成されました！

---

## 📝 ステップ3: IAMポリシーの作成とアタッチ

S3とCloudFrontへのアクセス権限を設定します。

### 3-1. 作成したロールを開く

1. IAMダッシュボードの「**ロール**」をクリック
2. `GitHubActionsDeployRole` を検索して開く

### 3-2. インラインポリシーを追加

1. 「**許可を追加**」→「**インラインポリシーを作成**」をクリック
2. 「**JSON**」タブをクリック
3. 以下のJSONをコピー＆ペースト（**YOUR_BUCKET_NAME**、**YOUR_ACCOUNT_ID**、**YOUR_DISTRIBUTION_ID** を実際の値に置き換えてください）：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3BucketAccess",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:ListBucket",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::YOUR_BUCKET_NAME",
        "arn:aws:s3:::YOUR_BUCKET_NAME/*"
      ]
    },
    {
      "Sid": "CloudFrontInvalidation",
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation"
      ],
      "Resource": "arn:aws:cloudfront::YOUR_ACCOUNT_ID:distribution/YOUR_DISTRIBUTION_ID"
    }
  ]
}
```

**置き換え方法**:
- `YOUR_BUCKET_NAME` → S3バケット名（例: `my-app-bucket-123456`）
- `YOUR_ACCOUNT_ID` → AWSアカウントID（例: `123456789012`）
- `YOUR_DISTRIBUTION_ID` → CloudFrontディストリビューションID（例: `E1234567890ABC`）

4. 「**次へ**」をクリック
5. ポリシー名: `S3CloudFrontDeployPolicy`
6. 「**ポリシーの作成**」をクリック

✅ ポリシーがアタッチされました！

### 3-3. ロールARNをコピー

1. ロールの詳細ページの上部に「**ARN**」が表示されています
2. ARNをコピーしてメモしてください（後で使います）

例: `arn:aws:iam::123456789012:role/GitHubActionsDeployRole`

---

## 🔑 ステップ4: GitHubシークレットの設定

GitHub Actionsで使用する機密情報を設定します。

### 4-1. GitHubリポジトリの設定を開く

1. ブラウザで以下のURLを開く：
   ```
   https://github.com/Cyberoptic/rs_profile-badge-composer/settings/secrets/actions
   ```

2. または、リポジトリページから：
   - 「**Settings**」タブをクリック
   - 左メニューの「**Secrets and variables**」→「**Actions**」をクリック

### 4-2. シークレットを追加

「**New repository secret**」ボタンを4回クリックして、以下の4つのシークレットを追加します：

#### シークレット 1: AWS_ROLE_ARN

| 項目 | 値 |
|------|-----|
| Name | `AWS_ROLE_ARN` |
| Secret | ステップ3-3でコピーしたARN<br>例: `arn:aws:iam::123456789012:role/GitHubActionsDeployRole` |

#### シークレット 2: AWS_REGION

| 項目 | 値 |
|------|-----|
| Name | `AWS_REGION` |
| Secret | AWSリージョン<br>例: `us-east-1` または `ap-northeast-1`（東京） |

#### シークレット 3: S3_BUCKET

| 項目 | 値 |
|------|-----|
| Name | `S3_BUCKET` |
| Secret | S3バケット名<br>例: `my-app-bucket-123456` |

#### シークレット 4: CLOUDFRONT_DISTRIBUTION_ID

| 項目 | 値 |
|------|-----|
| Name | `CLOUDFRONT_DISTRIBUTION_ID` |
| Secret | CloudFrontディストリビューションID<br>例: `E1234567890ABC` |

✅ 4つのシークレットが設定されました！

---

## 📤 ステップ5: ワークフローファイルをコミット

GitHub Actionsのワークフローファイルをリポジトリに追加します。

### 5-1. 既存のブランチに追加

すでに `feature/profile-composer` ブランチがある場合、そこに追加します：

```bash
cd /path/to/rs_profile-badge-composer
git checkout feature/profile-composer
git pull origin feature/profile-composer
```

### 5-2. ワークフローファイルを確認

以下の2つのファイルが追加されているはずです：

- `.github/workflows/ci.yml` - PRとdevブランチでのビルドテスト
- `.github/workflows/deploy.yml` - mainブランチへの自動デプロイ

### 5-3. コミット＆プッシュ

```bash
git add .github/workflows/
git commit -m "ci: Add GitHub Actions workflows for CI and deploy"
git push origin feature/profile-composer
```

✅ ワークフローがプッシュされました！

---

## ✅ ステップ6: 動作確認

### 6-1. PRを確認

1. PRページを開く：
   ```
   https://github.com/Cyberoptic/rs_profile-badge-composer/pull/2
   ```

2. ページ下部に「**Checks**」セクションが表示され、CIが実行されているはずです

### 6-2. CIの実行を確認

1. Actionsタブを開く：
   ```
   https://github.com/Cyberoptic/rs_profile-badge-composer/actions
   ```

2. 「**CI**」という名前のワークフローが実行中（黄色）または完了（緑）になっているか確認

### 6-3. PRをマージ

CIが成功（緑のチェックマーク）したら、PRをマージします：

1. PRページで「**Merge pull request**」をクリック
2. 「**Confirm merge**」をクリック

### 6-4. 自動デプロイを確認

1. Actionsタブで「**Deploy to AWS S3**」ワークフローが自動で開始されます
2. 約3-5分で完了します
3. 緑のチェックマークが表示されれば成功！

---

## 🎯 完了！

これで、mainブランチへのプッシュ時に自動的にAWS S3にデプロイされるようになりました。

### 動作の流れ

```
コード変更 → PR作成 → CIテスト実行
              ↓
           マージ → 自動デプロイ → S3アップロード → CloudFront更新
```

---

## 🆘 トラブルシューティング

### ❌ CI/Deployが失敗する

**確認項目**:
1. GitHubシークレットが正しく設定されているか
2. IAMロールのARNが正しいか
3. S3バケット名とCloudFront IDが正しいか
4. IAMポリシーのリソースARNが正しいか

**エラーログの確認**:
1. Actionsタブで失敗したワークフローをクリック
2. 赤いバツマークのステップをクリック
3. エラーメッセージを確認

### ❌ 「Access Denied」エラー

**原因**: IAMポリシーの設定が不足している

**対処法**:
1. IAMロールを開く
2. アタッチされているポリシーを確認
3. S3バケット名とCloudFront IDが正しいか確認

### ❌ OIDCエラー

**原因**: 信頼ポリシーのGitHubリポジトリ名が間違っている

**対処法**:
1. IAMロールの「信頼関係」タブを開く
2. リポジトリ名が正しいか確認（`Cyberoptic/rs_profile-badge-composer`）

---

## 📚 参考リンク

- [GitHub Actions公式ドキュメント](https://docs.github.com/ja/actions)
- [AWS OIDC認証の設定](https://docs.github.com/ja/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services)
- [AWS S3 CLI リファレンス](https://docs.aws.amazon.com/cli/latest/reference/s3/)

---

**作成日**: 2025-10-28  
**バージョン**: 1.0.0
