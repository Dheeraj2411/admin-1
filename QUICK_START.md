# Quick Reference - Environment & API Setup

## Files You Need to Know

📄 **`.env.local`** - Your local configuration (created)
📄 **`.env.example`** - Template for environment variables (created)
📄 **`ENVIRONMENT_SETUP.md`** - Detailed environment & API setup guide (created)
📄 **`API_INTEGRATION.md`** - How to integrate with your backend (created)
📄 **`.github/copilot-instructions.md`** - AI agent guidelines (updated)

---

## Quick Start (3 Steps)

### 1️⃣ Environment Already Configured

✅ Backend is already configured in `.env.local`:

```env
NEXT_PUBLIC_BASE_URL=http://168.119.228.109
NEXT_PUBLIC_PORT=3000
AUTH_SECRET=development-secret-change-in-production
```

### 2️⃣ Start Development

```bash
npm run dev
```

### 3️⃣ Login with Your Backend

- **API Server**: `http://168.119.228.109` (backend running)
- **Login**: Use your backend credentials
- **Automatic**: Token management & refresh handled automatically

---

## Connecting to Your Backend

### Change Base URL

Edit `.env.local`:

```env
NEXT_PUBLIC_BASE_URL=https://your-api.com
```

### Update API Endpoints

Create new API slices in `src/store/slices/`:

```typescript
import apiService from "@/store/apiService";

export const usersApi = apiService.injectEndpoints({
  endpoints: (build) => ({
    getUsers: build.query({
      query: () => "/users", // Your backend endpoint
    }),
  }),
});

export const { useGetUsersQuery } = usersApi;
```

### Token Handling

- Tokens auto-injected as `Authorization: Bearer <token>`
- 401 errors auto-trigger refresh
- No manual token management needed

---

## Architecture

```
Frontend (Next.js 14)
      ↓
RTK Query (src/store/apiService.ts)
      ↓
apiFetch (src/utils/apiFetch.ts)
      ↓
NEXT_PUBLIC_BASE_URL (http://168.119.228.109) ✅ LIVE
      ↓
Your Backend API (Running & Deployed)
```

---

## Key Files

| Path                        | Purpose                   |
| --------------------------- | ------------------------- |
| `src/utils/apiFetch.ts`     | Base URL logic            |
| `src/store/apiService.ts`   | RTK Query + auth headers  |
| `src/utils/tokenService.ts` | Token storage & refresh   |
| `src/@auth/authApi.ts`      | Example API calls         |
| `.env.local`                | Your environment settings |

---

## Environment Variables

| Variable               | Dev (Current)               | Prod                          | Required |
| ---------------------- | --------------------------- | ----------------------------- | -------- |
| `NEXT_PUBLIC_BASE_URL` | `http://168.119.228.109` ✅ | Your API URL                  | ✅       |
| `NEXT_PUBLIC_PORT`     | `3000`                      | N/A                           | ❌       |
| `AUTH_SECRET`          | Any value                   | Use `openssl rand -base64 33` | ✅       |
| `AUTH_GOOGLE_ID`       | Optional                    | Optional                      | ❌       |
| `AUTH_GOOGLE_SECRET`   | Optional                    | Optional                      | ❌       |

---

## What's Configured For You

✅ **Base URL Switching** - Auto uses localhost in dev, `NEXT_PUBLIC_BASE_URL` in prod
✅ **Token Auto-Injection** - All requests get `Authorization: Bearer <token>`
✅ **401 Auto-Refresh** - Token refresh on expiry, automatic retry
✅ **Error Handling** - `FetchApiError` class for structured errors
✅ **RTK Query Setup** - Ready to define endpoints
✅ **Mock API** - Works without backend for development

---

## Next Steps

1. ✅ Backend configured at `http://168.119.228.109`
2. ✅ Start `npm run dev`
3. ✅ API calls automatically routed to backend
4. 📖 Read `API_INTEGRATION.md` for creating endpoints
5. 🔧 Create API slices in `src/store/slices/` for your backend routes
6. 🎯 Use backend authentication & data endpoints

---

## Support Files

- **`.env.example`** - Copy this to `.env.local` and customize
- **`ENVIRONMENT_SETUP.md`** - Comprehensive setup & troubleshooting
- **`API_INTEGRATION.md`** - Complete integration guide with examples
- **`.github/copilot-instructions.md`** - For AI agents (ChatGPT, Claude, etc.)

---

## Common Commands

```bash
# Start development
npm run dev

# Build for production
npm run build

# Run production build locally
npm run start

# Check for lint errors
npm run lint

# Install dependencies
npm install
```

---

## Security Notes

⚠️ **DO NOT commit**:

- `.env.local` (use `.env.example` as template)
- `.env.production.local`
- API keys, secrets, tokens

✅ **DO commit**:

- `.env.example` (template only)
- `.github/copilot-instructions.md`
- `ENVIRONMENT_SETUP.md`
- `API_INTEGRATION.md`

---

For detailed help, see:

- `ENVIRONMENT_SETUP.md` - Environment & API basics
- `API_INTEGRATION.md` - Backend integration guide
- `.github/copilot-instructions.md` - Architecture & patterns
