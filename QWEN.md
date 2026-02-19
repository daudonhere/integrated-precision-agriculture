# Integrated Precision Agriculture

## Project Overview

A Next.js 16 application for precision agriculture solutions. Built with modern React patterns and TypeScript, this project uses the App Router architecture with server-side rendering capabilities.

### Technology Stack

- **Framework:** Next.js 16.1.6 (App Router)
- **Language:** TypeScript 5
- **UI Library:** React 19.2.3
- **Styling:** Tailwind CSS 4 with PostCSS
- **State Management:** Zustand 5.0.11
- **Fonts:** Geist Sans & Geist Mono (via `next/font`)
- **Linting:** ESLint 9 with Next.js configs

### Project Structure

```
src/
├── app/                 # Next.js App Router pages and layouts
│   ├── globals.css      # Global styles with Tailwind
│   ├── layout.tsx       # Root layout component
│   └── page.tsx         # Home page component
└── store/
    └── index.ts         # Zustand state management store
```

### Path Aliases

- `@/*` resolves to `./src/*` (configured in `tsconfig.json`)

## Building and Running

### Development

```bash
npm run dev
```

Starts the Next.js development server on `http://localhost:3000`.

### Production Build

```bash
npm run build    # Build for production
npm run start    # Start production server
```

### Linting

```bash
npm run lint
```

Runs ESLint with Next.js core web vitals and TypeScript configurations.

## Development Conventions

### TypeScript

- Strict mode enabled
- Module resolution: `bundler`
- JSX: `react-jsx`
- No emit (Next.js handles compilation)
- Incremental builds enabled

### Code Style

- ESLint 9 with flat config format
- Extends `eslint-config-next` for:
  - Core Web Vitals compliance
  - TypeScript rules
- Custom ignores in `eslint.config.mjs` (overrides default Next.js ignores)

### Styling

- Tailwind CSS 4 with new `@theme inline` directive
- CSS custom properties for theming
- Dark mode support via `prefers-color-scheme`
- Font variables: `--font-geist-sans`, `--font-geist-mono`

### State Management

- Zustand for client-side state
- Store located in `src/store/index.ts`
- TypeScript-first store definitions

### Component Patterns

- Server Components by default (App Router)
- Client Components when hooks/state needed
- Responsive design with Tailwind utility classes
- Dark mode support throughout

## Deployment

Deploy via Vercel (recommended) or any Node.js hosting platform:

```bash
vercel deploy
```

Or build and run the production server:

```bash
npm run build && npm run start
```

## Environment

- `.env*` files are git-ignored
- Use `.env.local` for local development variables
- See `.gitignore` for all ignored patterns
