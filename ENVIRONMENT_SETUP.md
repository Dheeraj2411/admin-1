# Environment & API Setup Guide

## Quick Start

### 1. Backend Configuration (Already Set)

Your backend is deployed at `http://168.119.228.109` ✅

Your `.env.local` is configured to use it:

```env
NEXT_PUBLIC_BASE_URL=http://168.119.228.109
NEXT_PUBLIC_PORT=3000
AUTH_SECRET=development-secret-change-in-production
```

### 2. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`  
API calls will be sent to `http://168.119.228.109`

---

## Base URL Connection Explained

### How API Calls Work

**Location**: `src/utils/apiFetch.ts`

```typescript
export const API_BASE_URL =
  process.env.NODE_ENV === "development"
    ? `http://localhost:${process.env.NEXT_PUBLIC_PORT || 3000}`
    : process.env.NEXT_PUBLIC_BASE_URL || "/";
```

**Flow**:

1. **Development** → Uses `http://168.119.228.109` (from `NEXT_PUBLIC_BASE_URL`)
2. **Production** → Uses your production backend URL in environment variables

### Making API Calls

#### Using RTK Query (Recommended)

```typescript
import apiService from "@/store/apiService";

// Create endpoints in your slice
export const usersApi = apiService.injectEndpoints({
  endpoints: (build) => ({
    getUsers: build.query({
      query: () => "/api/users", // Base URL is auto-prepended
    }),
    createUser: build.mutation({
      query: (userData) => ({
        url: "/api/users",
        method: "POST",
        body: userData,
      }),
    }),
  }),
});

// Use in components
export const { useGetUsersQuery, useCreateUserMutation } = usersApi;
```

#### Using Direct apiFetch

```typescript
import apiFetch from "@/utils/apiFetch";

try {
  const response = await apiFetch("/api/users");
  const data = await response.json();
} catch (error) {
  if (error instanceof FetchApiError) {
    console.error("API Error:", error.status, error.data);
  }
}
```

---

## Authentication with API

### Token Management

Tokens are **automatically injected** into all requests:

**Location**: `src/store/apiService.ts`

```typescript
prepareHeaders: (headers) => {
  const token = tokenService.getAccessToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return headers;
};
```

### Automatic Token Refresh

If a request returns **401 Unauthorized**:

1. RTK Query automatically calls `tokenService.refreshAccessToken()`
2. Retries the original request with new token
3. If refresh fails, logout is triggered

---

## Mock API (Development)

No backend required! Use mock endpoints during development.

**Location**: `src/@auth/authApi.ts` (example)

```typescript
export function authGetDbUserByEmail(email: string) {
  return apiFetch(`/api/mock/auth/user-by-email/${email}`);
}
```

**Mock endpoints** automatically route to `src/@mock-utils/mockDb.json`

**Demo credentials**:

- Email: `admin@fusetheme.com`
- Password: _any value_

---

## Environment Variables Reference

### Development (.env.local)

```env
# API
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_PORT=3000

# Auth
AUTH_SECRET=dev-secret

# Optional OAuth
# AUTH_GOOGLE_ID=xxx
# AUTH_GOOGLE_SECRET=xxx
```

### Production (.env.production)

```env
# Must be set to your backend URL
NEXT_PUBLIC_BASE_URL=https://api.yourapp.com

# Required for security
AUTH_SECRET=your-production-secret

# Vercel KV (if using NextAuth with KV)
AUTH_KV_REST_API_URL=https://xxxxx.vercel.sh
AUTH_KV_REST_API_TOKEN=xxxxx
```

### Git & Security

- ✅ Commit: `.env.example` (template with defaults)
- ❌ Don't commit: `.env.local`, `.env.production.local`
- Add to `.gitignore`: `.env.local`, `.env.*.local`

---

## Connecting to a Real Backend

### Step 1: Update Base URL

In `.env.local`:

```env
NEXT_PUBLIC_BASE_URL=https://your-backend-api.com
```

### Step 2: Update API Endpoints

Update RTK Query endpoints to match your backend routes:

```typescript
// Before: /api/mock/users
// After: /api/v1/users (or whatever your backend uses)

const usersApi = apiService.injectEndpoints({
  endpoints: (build) => ({
    getUsers: build.query({
      query: () => "/api/v1/users", // Your backend endpoint
    }),
  }),
});
```

### Step 3: Ensure Token Format

Verify your backend sends tokens in the format the app expects:

```typescript
// App expects tokens from:
// - localStorage.getItem('auth_token')
// - sessionStorage.getItem('auth_token')
// - NextAuth.js session

// Token format: "Bearer <token>"
```

### Step 4: Test with CORS Headers

If backend is on different domain:

```bash
# Backend must return CORS headers:
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Credentials: true
```

---

## Troubleshooting

### Issue: 404 errors on API calls

**Check**:

1. Is `NEXT_PUBLIC_BASE_URL` pointing to correct backend?
2. Are endpoints using correct path (e.g., `/api/v1/...` vs `/api/...`)?
3. Is backend actually running?

### Issue: CORS errors

**Solution**:

- Backend must have correct CORS headers configured
- For same-origin requests (e.g., Next.js server → backend), CORS may not apply

### Issue: 401 Token Expired

**Auto-handled by**:

- `src/store/apiService.ts` detects 401
- Calls `tokenService.refreshAccessToken()`
- Retries request automatically

### Issue: getAccessToken() returns null

**Check**:

- Are you calling it in a client component? (use `'use client'`)
- Is user authenticated? (check `useSession()`)
- Check `src/utils/tokenService.ts` for storage mechanism

---

## Key Files

| File                        | Purpose                                           |
| --------------------------- | ------------------------------------------------- |
| `src/utils/apiFetch.ts`     | Base URL & fetch configuration                    |
| `src/store/apiService.ts`   | RTK Query setup with auth headers & token refresh |
| `src/utils/tokenService.ts` | Token storage & refresh logic                     |
| `src/@auth/authApi.ts`      | Example API calls                                 |
| `.env.local`                | Local environment variables (git-ignored)         |
| `.env.example`              | Template for environment variables                |
