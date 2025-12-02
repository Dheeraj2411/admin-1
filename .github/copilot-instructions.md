# Copilot Instructions for Club Billionaire Admin

## Architecture Overview

This is a **Next.js 14 admin dashboard** using the Fuse React theme with Redux Toolkit for state management. The app structure follows Next.js App Router conventions with layout-based routing.

### Key Stack

- **Framework**: Next.js 14 (App Router, Server/Client Components)
- **UI Library**: Material-UI (MUI v6) with Emotion CSS-in-JS
- **State Management**: Redux Toolkit + RTK Query
- **Authentication**: NextAuth.js v5 (Credentials, Google, Facebook providers)
- **Forms**: React Hook Form + Zod validation
- **Styling**: Tailwind CSS + MUI theming with RTL support
- **i18n**: react-i18next (English, Arabic, Turkish support)

## Critical Architecture Patterns

### 1. Redux Store Structure

- **Location**: `src/store/`
- **Pattern**: Redux Toolkit with `combineSlices` + lazy loading
- **API Integration**: RTK Query for async operations (`src/store/apiService.ts`)
- **Token Management**: Automatic 401 handling with token refresh in `apiService.ts`
- **Key Files**:
  - `src/store/store.ts` - Store configuration with middleware
  - `src/store/rootReducer.ts` - Combines static and lazy-loaded slices
  - `src/store/hooks.ts` - Typed `useAppDispatch`, `useAppSelector` (always use these, not plain hooks)
  - `src/store/withReducer.tsx` - HOC for injecting reducers lazily into routes

**Important**: Use `useAppDispatch` and `useAppSelector` from `src/store/hooks.ts`, never plain Redux hooks.

### 2. API Communication

- **Base URL**: Configured in `src/utils/apiFetch.ts`
  - Development: `http://localhost:3000` (or `NEXT_PUBLIC_PORT`)
  - Production: `process.env.NEXT_PUBLIC_BASE_URL`
- **Authorization**: Bearer token auto-injected from `tokenService.getAccessToken()`
- **Global Headers**: Managed via `setGlobalHeaders()` and `removeGlobalHeaders()` in `apiFetch.ts`
- **Error Handling**: Custom `FetchApiError` class for structured error responses
- **Token Refresh**: 401 responses automatically trigger token refresh via `tokenService.refreshAccessToken()`

### 3. Authentication (NextAuth.js)

- **Config**: `src/@auth/authJs.ts`
- **Providers**: Credentials (demo), Google, Facebook
- **Storage**: Vercel KV in production, memory driver in development
- **Session Provider**: Wrapped in root layout (`src/app/layout.tsx`) with `basePath='/auth'`
- **User Context**: `src/@auth/userContext.tsx` for accessing user data
- **Demo Credentials**: Email `admin@fusetheme.com`, any password (for development)

### 4. Form Patterns

- **Validation**: Zod schemas + React Hook Form's `zodResolver`
- **Controller Pattern**: Use `Controller` from react-hook-form for MUI inputs
- **Example**: `src/@auth/forms/AuthJsCredentialsSignInForm.tsx`
- **Typical Structure**:
  ```tsx
  const schema = z.object({
    /* validation rules */
  });
  const { control, handleSubmit, formState } = useForm({
    mode: "onChange",
    resolver: zodResolver(schema),
  });
  ```

### 5. Theme & Styling

- **Theme Provider**: `src/contexts/MainThemeProvider.tsx` with Emotion cache (RTL support via stylis-plugin-rtl)
- **Theme Hook**: `useMainTheme()` from `@fuse/core/FuseSettings` for active theme/direction
- **Tailwind**: Configured with MUI theme colors; includes safelist for dynamic padding classes (`pl-24`, `pl-40`, etc.)
- **Dark Mode**: Controlled via `darkMode: 'class'` in `tailwind.config.js`
- **Global Styles**: Imported in root layout:
  - `src/styles/app-base.css`
  - `src/styles/app-components.css`
  - `src/styles/app-utilities.css`

### 6. Layout System (Fuse)

- **MainLayout**: `src/components/MainLayout.tsx` wraps `FuseLayout` (from `@fuse/core`)
- **Theme Layouts**: Configured in `src/components/theme-layouts/themeLayouts.ts`
- **Navigation**: Defined in `src/configs/navigationConfig.ts` (FuseNavItemType array)
- **Settings**: `src/configs/settingsConfig.ts` for default layout settings
- **Route Structure**:
  - `(control-panel)` - Main admin dashboard routes
  - `(public)` - Public pages (login, documentation)
  - `api/` - API route handlers
  - `auth/` - NextAuth.js routes

## Path Aliases

Always use these aliases (configured in `tsconfig.json`):

- `@auth/*` → `src/@auth/*` (authentication)
- `@fuse/*` → `src/@fuse/*` (Fuse theme components & utils)
- `@i18n/*` → `src/@i18n/*` (i18n config)
- `@mock-utils/*` → `src/@mock-utils/*` (mock API data)
- `@/*` → `src/*` (generic app files)

## Environment Configuration

### Setup `.env.local` for Development

Create `.env.local` in the project root:

```env
# API Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_PORT=3000

# NextAuth.js (generate with: openssl rand -base64 33)
AUTH_SECRET=development-secret-change-in-production

# OAuth Providers (optional)
# AUTH_GOOGLE_ID=your-google-client-id
# AUTH_GOOGLE_SECRET=your-google-client-secret
```

### API Base URL Logic

- **Development**: Uses `http://localhost:NEXT_PUBLIC_PORT` (defaults to 3000)
- **Production**: Uses `NEXT_PUBLIC_BASE_URL` environment variable, falls back to `/`
- **Configuration**: `src/utils/apiFetch.ts` handles this automatically

### Key Variables

| Variable                 | Purpose                  | Default                |
| ------------------------ | ------------------------ | ---------------------- |
| `NEXT_PUBLIC_BASE_URL`   | Production API endpoint  | `/`                    |
| `NEXT_PUBLIC_PORT`       | Dev server port          | `3000`                 |
| `AUTH_SECRET`            | NextAuth.js signing key  | Required in production |
| `AUTH_KV_REST_API_URL`   | Vercel KV storage (prod) | Optional               |
| `AUTH_KV_REST_API_TOKEN` | Vercel KV token (prod)   | Optional               |

**Note**: `NEXT_PUBLIC_*` variables are exposed to the browser; never store secrets in them.

## Developer Workflows

### Local Development

```bash
npm install
npm run dev  # Starts Next.js dev server on :3000
# Uses mock API at /api/mock/* with demo credentials
# Email: admin@fusetheme.com, Password: any value
```

### Building & Production

```bash
npm run build
npm run start  # Serve production build
npm run lint   # ESLint check
```

### TypeScript & Config

- **tsconfig.json**: Strict mode OFF (`strict: false`), TypeScript errors ignored during build
- **next.config.mjs**: SWC minification enabled, type errors ignored in production
- **Build Artifact**: Webpack supports raw-loader for inline file imports (`resourceQuery: /raw/`)

## Component & Coding Conventions

### Client vs Server Components

- Use `'use client'` at top for client-side interactive components
- Server components (no directive) handle async operations, data fetching
- Root layout is server component; App.tsx is client component

### Lazy Loading with Redux

When adding a new feature with its own Redux slice:

```tsx
// Wrap your route component with withReducer HOC
export default withReducer(
  "featureSlice",
  featureSlice.reducer
)(FeatureComponent);
```

The slice auto-injects when the route loads, avoiding bundle bloat.

### Data Table Patterns

- Use `@mui/x-data-grid` (DataGrid/DataGridPro) for tables
- Alternative: `material-react-table` for React-centric approach
- Paginated queries via RTK Query endpoints

### Error Handling

- Catch `FetchApiError` from `src/utils/apiFetch.ts` for API errors
- Use `notistack` (SnackbarProvider in App.tsx) for toast notifications
- `src/@fuse/utils/ErrorBoundary` wraps entire app for fallback error UI

### i18n Usage

- Translations in `src/configs/navigation-i18n/` (en, ar, tr)
- Access via `useTranslation('navigation')` hook
- Theme colors also translatable (see navigationConfig.ts)

## Special Considerations

### Build Warnings/Errors Handling

- **reactStrictMode**: OFF in next.config.mjs (intentional for stability)
- **Type Errors**: Allowed in production build; development linting is strict
- **Post-install Hook**: Runs `src/utils/node-scripts/fuse-react-message.js` after npm install

### Authentication Flow

1. User signs in via form → NextAuth.js
2. Credentials provider validates → creates session (stored in KV/memory)
3. Session passed to SessionProvider in layout
4. Use `useSession()` hook to access user data in client components
5. 401 responses in RTK Query trigger token refresh automatically

### Date Handling

- Date picker library: `@mui/x-date-pickers`
- Adapter: `AdapterDateFns` with `enUS` locale
- Set in LocalizationProvider wrapper (App.tsx)

### Common Imports

```tsx
// Redux hooks
import { useAppDispatch, useAppSelector } from "@/store/hooks";

// Navigation/routing
import { useRouter } from "next/navigation"; // App Router

// Form handling
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Auth
import { useSession } from "next-auth/react";
import { useUser } from "@auth/useUser"; // Custom hook

// Theme
import { useMainTheme } from "@fuse/core/FuseSettings/hooks/fuseThemeHooks";
import { useFuseTheme } from "@fuse/core/hooks"; // Alternative
```

## Key Files to Review

- `src/app/App.tsx` - Provider setup & app root
- `src/store/apiService.ts` - RTK Query config with token refresh
- `src/@auth/authJs.ts` - NextAuth providers & config
- `src/components/MainLayout.tsx` - Layout wrapper
- `src/configs/navigationConfig.ts` - Navigation tree
- `tailwind.config.js` - Tailwind customizations (extensive)
- `next.config.mjs` - Next.js configuration
