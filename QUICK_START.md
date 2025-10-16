# Quick Start Guide

## 🚀 Get Running in 3 Steps

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Start Development Server

```bash
npm run dev
```

Access at: **http://localhost:5173**

### Step 3: Try It Out

1. Click **Templates** tab
2. Click **Upload Template** button
3. Upload a PNG/SVG frame image
4. Enter: Name="Test Badge", Term="2025Q1", Version="v1"
5. Click **Batch Processor** tab
6. Select your template
7. Drag & drop 1-3 test images
8. Click **Process All**
9. Click **Download ZIP**

Done! 🎉

---

## 📦 Production Build

```bash
npm run build
```

Output: `dist/` directory

Preview production build:

```bash
npm run preview
```

---

## ☁️ Deploy to AWS (First Time)

### Prerequisites

- AWS CLI installed and configured
- AWS account with permissions

### Deploy Infrastructure

```bash
cd cdk
npm install
export AWS_PROFILE=your-profile
npx cdk bootstrap  # First time only
npx cdk deploy
```

**Save outputs**: BucketName, DistributionId, DistributionDomainName

### Configure GitHub Actions

1. Follow **README.md** → "GitHub Actions OIDC Setup"
2. Create IAM OIDC provider
3. Create IAM role with trust policy
4. Attach S3 + CloudFront policy
5. Add secrets to GitHub repo:
   - AWS_ROLE_ARN
   - AWS_REGION
   - S3_BUCKET
   - CLOUDFRONT_DISTRIBUTION_ID

### Push to Deploy

```bash
git checkout -b main  # or your main branch
git add .
git commit -m "Initial deployment"
git push origin main
```

GitHub Actions will automatically deploy! 🚀

---

## 🔧 Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (hot reload) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run type-check` | TypeScript type checking |

---

## 📁 Key Files to Know

- **src/App.tsx**: Main application layout
- **src/components/batch/BatchProcessor.tsx**: Core batch processing UI
- **src/utils/imageProcessing.ts**: Canvas-based image processing logic
- **src/stores/useAppStore.ts**: Global state (Zustand)
- **tailwind.config.js**: Brand colors (navy, light-blue, white)
- **cdk/lib/static-site-stack.ts**: AWS infrastructure definition

---

## 🆘 Troubleshooting

### Port 5173 already in use

```bash
# Kill the process using the port
npx kill-port 5173
# or
lsof -ti:5173 | xargs kill
```

### Type errors after installing dependencies

```bash
npm run type-check
```

### Build errors

1. Clear node_modules: `rm -rf node_modules package-lock.json`
2. Reinstall: `npm install`
3. Rebuild: `npm run build`

### CDK deployment fails

1. Check AWS credentials: `aws sts get-caller-identity`
2. Ensure region is set: `export AWS_REGION=us-east-1`
3. Bootstrap if needed: `npx cdk bootstrap`

---

## 📚 Learn More

- **Full Documentation**: See `README.md`
- **Directory Structure**: See `DIRECTORY_TREE.md`
- **React**: https://react.dev
- **Vite**: https://vitejs.dev
- **Tailwind CSS**: https://tailwindcss.com
- **shadcn/ui**: https://ui.shadcn.com
- **AWS CDK**: https://docs.aws.amazon.com/cdk

---

**Need help?** Open an issue or contact RS IT Department.
