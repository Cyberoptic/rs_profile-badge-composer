# Project Directory Tree

```
peering-badge-processor/
│
├── .github/
│   └── workflows/
│       ├── ci.yml                      # CI workflow (build & test)
│       └── deploy.yml                  # Deploy workflow (AWS S3 + CloudFront)
│
├── cdk/                                # AWS CDK Infrastructure as Code
│   ├── bin/
│   │   └── app.ts                      # CDK app entry point
│   ├── lib/
│   │   └── static-site-stack.ts        # S3 + CloudFront stack definition
│   ├── cdk.json                        # CDK configuration
│   ├── package.json                    # CDK dependencies
│   └── tsconfig.json                   # CDK TypeScript config
│
├── public/                             # Static assets
│   └── vite.svg                        # Favicon
│
├── src/                                # Application source code
│   ├── components/                     # React components
│   │   ├── batch/
│   │   │   └── BatchProcessor.tsx      # Main batch processing UI
│   │   ├── logs/
│   │   │   └── LogViewer.tsx           # Batch run history viewer
│   │   ├── settings/
│   │   │   └── SettingsPanel.tsx       # Settings configuration UI
│   │   ├── templates/
│   │   │   └── TemplateManager.tsx     # Template upload & management
│   │   └── ui/
│   │       └── button.tsx              # shadcn/ui Button component
│   │
│   ├── config/
│   │   └── appConfig.ts                # Application configuration & defaults
│   │
│   ├── lib/
│   │   └── utils.ts                    # Utility helpers (cn, etc.)
│   │
│   ├── stores/
│   │   └── useAppStore.ts              # Zustand global state management
│   │
│   ├── types/
│   │   └── index.ts                    # TypeScript type definitions
│   │
│   ├── utils/
│   │   ├── csvParser.ts                # CSV parsing & export utilities
│   │   ├── imageProcessing.ts          # Canvas-based image processing
│   │   ├── storage.ts                  # localStorage persistence
│   │   └── zipExport.ts                # JSZip export utilities
│   │
│   ├── App.tsx                         # Root application component
│   ├── index.css                       # Global styles (Tailwind + theme)
│   └── main.tsx                        # Application entry point
│
├── .eslintrc.cjs                       # ESLint configuration
├── .gitignore                          # Git ignore patterns
├── DIRECTORY_TREE.md                   # This file
├── index.html                          # HTML entry point
├── package.json                        # Project dependencies
├── postcss.config.js                   # PostCSS configuration
├── README.md                           # Project documentation
├── tailwind.config.js                  # Tailwind CSS configuration
├── tsconfig.json                       # TypeScript configuration (app)
├── tsconfig.node.json                  # TypeScript configuration (Vite)
└── vite.config.ts                      # Vite build configuration
```

## Key Files Explanation

### Root Configuration
- **package.json**: Frontend dependencies (React, Vite, Tailwind, shadcn/ui, etc.)
- **vite.config.ts**: Build tool configuration with path aliases
- **tailwind.config.js**: Brand colors (navy, light-blue, white) + shadcn/ui theme
- **tsconfig.json**: TypeScript strict mode settings

### Source Code (`src/`)
- **main.tsx**: ReactDOM entry point
- **App.tsx**: Main layout with navigation (Batch/Templates/Logs/Settings)
- **index.css**: Tailwind imports + CSS variables for light/dark theme

### Components (`src/components/`)
- **batch/**: Drag-drop zone, template selector, image list, processing UI
- **templates/**: Template upload, preview cards, delete functionality
- **logs/**: Batch run history table with CSV export
- **settings/**: Configuration panel (format, size, theme, etc.)
- **ui/**: shadcn/ui components (Button, etc.)

### Utilities (`src/utils/`)
- **imageProcessing.ts**: Canvas API image processing with circular clipping
- **storage.ts**: localStorage helpers for templates/settings/batch runs
- **zipExport.ts**: JSZip integration for batch ZIP downloads
- **csvParser.ts**: CSV import/export for batch metadata

### State Management (`src/stores/`)
- **useAppStore.ts**: Zustand store for global state (templates, images, settings, UI)

### Infrastructure (`cdk/`)
- **bin/app.ts**: CDK app initialization
- **lib/static-site-stack.ts**: S3 bucket + CloudFront distribution with OAC + security headers

### CI/CD (`.github/workflows/`)
- **ci.yml**: Build validation on pull requests
- **deploy.yml**: OIDC-based deployment to AWS on main branch push

## File Count Summary

- **TypeScript/TSX**: 15 files
- **Configuration**: 10 files
- **Workflows**: 2 files
- **Documentation**: 2 files (README, this file)

**Total**: ~29 files (excluding node_modules, dist, cdk.out)
