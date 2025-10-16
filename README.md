# Peering Badge Processor

RS Corporation's internal web application for batch processing certification frames/badges on member profile images.

## 🎯 Overview

- **Browser-only processing**: All image operations occur client-side (no server upload)
- **Batch support**: Process 1-30 images per session
- **Template management**: Upload and manage certification frame templates
- **ZIP export**: One-click download of processed images
- **Audit logs**: Track batch runs with CSV export
- **AWS hosting**: Static site on S3 + CloudFront with GitHub Actions CI/CD

## 🏗️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: shadcn/ui (Radix UI) + Tailwind CSS + Noto Sans JP
- **State**: Zustand
- **Processing**: Canvas API + JSZip
- **Storage**: localStorage (templates, settings, logs)
- **Infrastructure**: AWS CDK (S3 + CloudFront OAC)
- **CI/CD**: GitHub Actions with OIDC

## 📋 Prerequisites

- Node.js 20+ and npm
- AWS Account (for deployment)
- AWS CLI configured
- Git

## 🚀 Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Access at `http://localhost:5173`

### 3. Build for Production

```bash
npm run build
```

Output: `dist/`

### 4. Preview Production Build

```bash
npm run preview
```

## 🛠️ Project Structure

```
peering-badge-processor/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── batch/           # Batch processor UI
│   │   ├── templates/       # Template manager UI
│   │   ├── logs/            # Log viewer UI
│   │   └── settings/        # Settings panel UI
│   ├── stores/              # Zustand state management
│   ├── utils/               # Utilities (image processing, storage, CSV, ZIP)
│   ├── types/               # TypeScript type definitions
│   ├── config/              # App configuration
│   ├── lib/                 # Utility functions
│   └── index.css            # Global styles (Tailwind + theme)
├── cdk/                     # AWS CDK infrastructure
│   ├── bin/                 # CDK app entry point
│   └── lib/                 # CDK stack definitions
├── .github/workflows/       # GitHub Actions CI/CD
│   ├── ci.yml               # Build & test on PR
│   └── deploy.yml           # Deploy to AWS on main push
├── public/                  # Static assets
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## ☁️ AWS Infrastructure Setup (CDK)

### 1. Install CDK Dependencies

```bash
cd cdk
npm install
```

### 2. Bootstrap CDK (First Time Only)

```bash
export AWS_PROFILE=your-profile
export AWS_REGION=us-east-1

npx cdk bootstrap aws://YOUR_ACCOUNT_ID/us-east-1
```

### 3. Deploy Infrastructure

```bash
npx cdk deploy
```

**Outputs** (save these for GitHub secrets):
- `BucketName`: S3 bucket name
- `DistributionId`: CloudFront distribution ID
- `DistributionDomainName`: CloudFront domain
- `WebsiteURL`: Full HTTPS URL

### 4. Verify Stack

```bash
npx cdk diff
npx cdk synth
```

## 🔐 GitHub Actions OIDC Setup

### Step 1: Create IAM OIDC Provider (Console or CLI)

**AWS Console:**
1. IAM → Identity providers → Add provider
2. Provider type: OpenID Connect
3. Provider URL: `https://token.actions.githubusercontent.com`
4. Audience: `sts.amazonaws.com`
5. Click **Add provider**

**AWS CLI:**
```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
```

### Step 2: Create IAM Role for GitHub Actions

Create `github-actions-trust-policy.json`:

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
          "token.actions.githubusercontent.com:sub": "repo:YOUR_ORG/peering-badge-processor:ref:refs/heads/main"
        }
      }
    }
  ]
}
```

Replace:
- `YOUR_ACCOUNT_ID`: Your AWS account ID
- `YOUR_ORG`: Your GitHub organization/username
- `peering-badge-processor`: Your repository name

**Create the role:**

```bash
aws iam create-role \
  --role-name GitHubActionsDeployRole \
  --assume-role-policy-document file://github-actions-trust-policy.json
```

### Step 3: Attach Least-Privilege Policy

Create `github-actions-policy.json`:

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

Replace:
- `YOUR_BUCKET_NAME`: From CDK output
- `YOUR_ACCOUNT_ID`: Your AWS account ID
- `YOUR_DISTRIBUTION_ID`: From CDK output

**Attach policy:**

```bash
aws iam put-role-policy \
  --role-name GitHubActionsDeployRole \
  --policy-name S3CloudFrontDeployPolicy \
  --policy-document file://github-actions-policy.json
```

### Step 4: Configure GitHub Secrets

Go to GitHub repo → Settings → Secrets and variables → Actions → New repository secret:

| Secret Name | Value | Example |
|-------------|-------|---------|
| `AWS_ROLE_ARN` | IAM role ARN | `arn:aws:iam::123456789012:role/GitHubActionsDeployRole` |
| `AWS_REGION` | AWS region | `us-east-1` |
| `S3_BUCKET` | S3 bucket name | `peering-badge-processor-123456789012` |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront ID | `E1234567890ABC` |

**Note**: `AWS_ROLE_ARN` is required for OIDC. No access keys needed!

## 🔄 CI/CD Workflows

### CI Workflow (`ci.yml`)

**Triggers**: Pull requests to `main`/`dev`, pushes to `dev`

**Actions**:
- Checkout code
- Install dependencies
- Type check
- Lint
- Build
- Upload build artifacts

### Deploy Workflow (`deploy.yml`)

**Triggers**: Push to `main` branch

**Actions**:
- Checkout code
- Install dependencies
- Build production bundle
- Configure AWS credentials via OIDC
- Sync to S3 with cache headers:
  - `assets/*`: `public,max-age=31536000,immutable`
  - `index.html`: `no-cache`
- Invalidate CloudFront cache
- Upload deployment artifacts

### Branch Strategy

- `main`: Production deployment
- `dev`: Development (CI only, no deploy)
- Feature branches: PR to `dev` or `main`

## 🎨 Design System

### Brand Colors (RS Corporation)

- **Navy**: `#0B1F3B` (Primary brand)
- **Light Blue**: `#E6F0FA` (Accent/backgrounds)
- **White**: `#FFFFFF` (Base)

### Typography

- **Font**: Noto Sans JP (Google Fonts)
- **Weights**: 400 (Regular), 500 (Medium), 700 (Bold)

### Tailwind Theme

Configured in `tailwind.config.js`:
- `brand.navy`, `brand.lightblue`, `brand.white`
- Light/dark mode support
- shadcn/ui variables

## 🔒 Security

### Client-Side Processing

- **No server upload**: All image processing in browser
- **No PII storage**: Data stays in browser localStorage
- **EXIF stripping**: Metadata removed on export
- **sRGB conversion**: Color space normalization

### AWS Security

- **S3 private bucket**: No public access
- **CloudFront OAC**: Secure origin access
- **Security headers** (via Response Headers Policy):
  - `Content-Security-Policy`: Strict self-only
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: same-origin`
  - `Permissions-Policy`: camera/mic/geolocation disabled
  - `Strict-Transport-Security`

### GitHub Actions Security

- **OIDC**: No long-lived access keys
- **Least-privilege IAM**: Scoped to specific bucket/distribution
- **Branch protection**: Deploy only from `main`

## 📦 Features

### Batch Processor

- Drag & drop or file picker (1-30 images)
- Template selection
- Real-time progress tracking
- Per-image retry on error
- Success/failure table
- One-click ZIP download

### Template Management

- Upload PNG/SVG templates
- Preview thumbnails
- Metadata: name, term, version
- Safe area configuration (8-10%)
- Delete templates

### Log Viewer

- Batch run history
- Success/error counts
- Processing duration
- CSV export

### Settings

- Default export format (PNG/JPG/WebP)
- Max image size (long side)
- Safe area percentage
- Filename pattern customization
- Light/dark theme
- Safe area overlay toggle

## 📝 Filename Patterns

Default: `{userId}_{term}_{badgeVer}_{yyyyMMdd}`

**Available tokens**:
- `{userId}`: User identifier
- `{name}`: User name
- `{term}`: Certification term (e.g., 2024Q1)
- `{badgeVer}`: Badge version (e.g., v1)
- `{yyyyMMdd}`: Date (20250115)
- `{yyyyMMdd_HHmm}`: Date + time (20250115_1430)

**ZIP filename**: `peering_badge_{term}_{yyyyMMdd_HHmm}.zip`

## 🧪 Testing

### Browser Compatibility

- Chrome/Edge (latest 2 versions)
- Safari (latest 2 versions)
- Firefox (latest 2 versions)

### Performance Targets

- 30 images processed in ~30 seconds (M2 MacBook, Chrome)
- Smooth UI during processing
- No memory leaks

### Image Validation

- Broken images
- CMYK color space
- Huge file sizes (>50MB rejected)
- Tiny images
- Transparency handling

## 📄 License

© 2025 RS Corporation. All rights reserved. Internal use only.

## 🆘 Support

For issues or questions, contact RS IT Department.

---

**Last Updated**: 2025-01-15
**Version**: 1.0.0
**Maintained by**: RS IT Team
