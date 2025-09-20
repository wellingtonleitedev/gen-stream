# Frontend - Image Generation Client

React TypeScript frontend for the batch image generation system with real-time progress updates via polling fallback.

## Features

- **Real-time progress**: Live updates during image generation
- **Metrics display**: TTFI and total generation time
- **Modern UI**: Built with shadcn/ui components and TailwindCSS

## Getting Started

### Prerequisites
- Node.js 18+ (install from [nodejs.org](https://nodejs.org) or use `nvm install node`)
- pnpm (install with `npm install -g pnpm` or see [pnpm.io](https://pnpm.io/installation))
- Backend server running (see `/backend/README.md`)

### Setup

1. Install dependencies:
```bash
pnpm install
```

2. Copy environment file:
```bash
cp .env.example .env.local
```

3. Start development server:
```bash
pnpm dev
```

1. Open http://localhost:5173 in your browser

## Build for Production

```bash
pnpm build
pnpm preview
```