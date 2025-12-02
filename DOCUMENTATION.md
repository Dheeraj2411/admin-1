# Club Billionaire Admin - Environment & API Documentation

## 📚 Documentation Index

This project now includes comprehensive documentation for environment setup and API integration:

### 🚀 Quick Start

- **File**: [`QUICK_START.md`](./QUICK_START.md)
- **Time**: 2 minutes
- **What**: Get up and running in 3 steps
- **Best for**: First-time setup

### ⚙️ Environment Setup

- **File**: [`ENVIRONMENT_SETUP.md`](./ENVIRONMENT_SETUP.md)
- **Time**: 10 minutes
- **What**: Detailed environment variables, base URL connection, mock API
- **Best for**: Understanding how API calls work

### 🔌 API Integration

- **File**: [`API_INTEGRATION.md`](./API_INTEGRATION.md)
- **Time**: 15 minutes
- **What**: Step-by-step backend integration with code examples
- **Best for**: Connecting to your own backend

### 🤖 AI Agent Guidelines

- **File**: [`.github/copilot-instructions.md`](./.github/copilot-instructions.md)
- **Time**: Reference
- **What**: Architecture, patterns, conventions for AI assistants
- **Best for**: When working with ChatGPT, Claude, Copilot

---

## 📁 Environment Files Created

```
✅ .env.local              (Local development config - git-ignored)
✅ .env.example            (Template for environment variables)
✅ .gitignore              (Already configured to ignore .env.local)
```

**Status**: ✅ Configured & ready to use. Backend: `http://168.119.228.109`

---

## ⚡ Quick Answers

### How is the environment set up?

✅ **Already configured!**

- Backend: `http://168.119.228.109` (running & deployed)
- `.env.local`: Points to backend automatically
- Just run: `npm run dev`

### How do I change the API base URL?

Edit `.env.local`:

```env
NEXT_PUBLIC_BASE_URL=http://168.119.228.109
```

(Or your new backend URL)
NEXT_PUBLIC_BASE_URL=https://your-api-url.com

````

### How do I connect to my backend?

See `API_INTEGRATION.md` for:

- Creating RTK Query endpoints
- Token management
- Error handling
- Pagination examples
- Authentication flow

### How does token refresh work?

Automatic! If a request returns 401:

1. System refreshes token from `/auth/refresh`
2. Retries original request
3. No manual code needed

### What if I'm using mock API?

Already configured! Works without backend:

- Demo login: `admin@fusetheme.com`
- Mock data: `src/@mock-utils/mockDb.json`
- Mock endpoints: `/api/mock/*`

---

## 🔐 Security Checklist

- ✅ `.env.local` in `.gitignore` (won't be committed)
- ✅ Secrets not exposed to browser (`NEXT_PUBLIC_*` are safe)
- ✅ `AUTH_SECRET` set for NextAuth.js
- ✅ Bearer token auto-injected in headers
- ✅ Token refresh on 401 errors

---

## 📖 What's Already Set Up

### Base URL Switching

```typescript
// src/utils/apiFetch.ts
Development:  http://localhost:3000 (or NEXT_PUBLIC_PORT)
Production:   NEXT_PUBLIC_BASE_URL environment variable
````

### RTK Query Integration

```typescript
// src/store/apiService.ts
- Bearer token auto-injected
- 401 errors trigger token refresh
- Automatic retry with new token
```

### Mock API for Development

```typescript
// No backend needed!
// Demo credentials: admin@fusetheme.com (any password)
// Mock endpoints: /api/mock/*
```

---

## 🚀 Next Steps

### Option 1: Use Mock API (Recommended for Development)

```bash
npm run dev
# Login: admin@fusetheme.com (any password)
# Uses mock data automatically
```

### Option 2: Connect to Your Backend

1. Set `NEXT_PUBLIC_BASE_URL` in `.env.local`
2. Create API endpoints (see `API_INTEGRATION.md`)
3. Run `npm run dev`

### Option 3: Use Next.js API Routes as Backend

1. Create `src/app/api/` routes
2. Keep `NEXT_PUBLIC_BASE_URL=http://localhost:3000`
3. Run `npm run dev`

---

## 📚 Key Files Reference

| File                              | Purpose                          |
| --------------------------------- | -------------------------------- |
| `.env.local`                      | Your local environment variables |
| `.env.example`                    | Template - copy to `.env.local`  |
| `src/utils/apiFetch.ts`           | Base URL configuration           |
| `src/store/apiService.ts`         | RTK Query + token injection      |
| `src/utils/tokenService.ts`       | Token storage & refresh          |
| `src/@auth/authApi.ts`            | Example API calls                |
| `QUICK_START.md`                  | 3-step quick start               |
| `ENVIRONMENT_SETUP.md`            | Detailed setup & troubleshooting |
| `API_INTEGRATION.md`              | Backend integration guide        |
| `.github/copilot-instructions.md` | AI agent guidelines              |

---

## ❓ FAQ

**Q: Do I need a backend to run this?**  
A: No! Mock API works offline. Great for frontend development.

**Q: How do I add API endpoints?**  
A: See `API_INTEGRATION.md` for RTK Query examples.

**Q: How are tokens managed?**  
A: Automatically! Check `src/utils/tokenService.ts` for details.

**Q: Can I use this with my existing backend?**  
A: Yes! Just update `NEXT_PUBLIC_BASE_URL` and create API slices.

**Q: What's the token refresh flow?**  
A: 401 → Refresh token → Retry request. All automatic.

**Q: Is .env.local secure?**  
A: Yes, it's in `.gitignore` and never committed to version control.

---

## 🆘 Troubleshooting

### Issue: "Cannot find module '@/store/hooks'"

- **Solution**: Ensure `tsconfig.json` path aliases are correct
- **Check**: See `.github/copilot-instructions.md` for path aliases

### Issue: "401 Unauthorized" errors

- **Solution**: Check `NEXT_PUBLIC_BASE_URL` points to correct backend
- **Check**: Verify token is being stored and sent

### Issue: CORS errors

- **Solution**: Backend must have correct CORS headers
- **Check**: Verify origin in `Access-Control-Allow-Origin`

### Issue: Mock API not working

- **Solution**: Already configured! Just login with demo credentials
- **Check**: Ensure you're using default `NEXT_PUBLIC_BASE_URL`

---

## 📞 Support

For detailed information, see:

- **Quick Start** → `QUICK_START.md`
- **Environment Setup** → `ENVIRONMENT_SETUP.md`
- **API Integration** → `API_INTEGRATION.md`
- **Architecture & Patterns** → `.github/copilot-instructions.md`

---

**Status**: ✅ Environment configured and ready to use.
