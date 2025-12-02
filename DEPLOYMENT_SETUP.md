# Backend Deployment Configuration - Active

## 🚀 Status: LIVE

**Backend URL**: `http://168.119.228.109`  
**Status**: Running & Deployed ✅  
**Configuration Date**: December 3, 2025

---

## Current Setup

### `.env.local` Configuration

```env
# Point to your live backend
NEXT_PUBLIC_BASE_URL=http://168.119.228.109
NEXT_PUBLIC_PORT=3000

# Authentication
AUTH_SECRET=development-secret-change-in-production
```

### Application Flow

```
1. Frontend (Next.js 14) starts on http://localhost:3000
           ↓
2. User makes API request
           ↓
3. RTK Query intercepts (src/store/apiService.ts)
           ↓
4. Bearer token auto-injected (from tokenService)
           ↓
5. Request sent to http://168.119.228.109 ✅ LIVE
           ↓
6. Response returned to frontend
           ↓
7. If 401: Token auto-refreshed, request retried
```

---

## What's Configured

✅ **Base URL**: Points to your backend  
✅ **Token Injection**: Auto-added to all requests  
✅ **Token Refresh**: Auto-triggered on 401  
✅ **Error Handling**: Custom `FetchApiError` class  
✅ **API Service**: RTK Query ready to use  
✅ **Authentication**: NextAuth.js configured

---

## How to Start

### 1. Development

```bash
npm run dev
```

**Opens**: `http://localhost:3000`  
**API Calls Go To**: `http://168.119.228.109`  
**Token**: Auto-managed by the system

### 2. Test API Connectivity

Open browser console and try:

```javascript
// This should work with your backend
fetch("http://168.119.228.109/api/users", {
  headers: {
    Authorization: "Bearer YOUR_TOKEN",
  },
})
  .then((r) => r.json())
  .then((d) => console.log(d));
```

### 3. Create API Endpoints

Example: Create user API slice in `src/store/slices/usersSlice.ts`

```typescript
import apiService from "@/store/apiService";

export const usersApi = apiService.injectEndpoints({
  endpoints: (build) => ({
    getUsers: build.query({
      query: () => "/users", // Becomes: http://168.119.228.109/users
    }),
    createUser: build.mutation({
      query: (userData) => ({
        url: "/users",
        method: "POST",
        body: userData,
      }),
    }),
  }),
});

export const { useGetUsersQuery, useCreateUserMutation } = usersApi;
```

### 4. Use in Components

```tsx
"use client";

import { useGetUsersQuery } from "@/store/slices/usersSlice";

export function UsersList() {
  const { data: users, isLoading, error } = useGetUsersQuery();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <ul>{users?.map((user) => <li key={user.id}>{user.name}</li>)}</ul>;
}
```

---

## Backend Requirements

Your backend (`http://168.119.228.109`) should:

### 1. Accept Bearer Tokens

```
GET /api/users
Authorization: Bearer <token>
```

### 2. Return CORS Headers (if different domain)

```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH
```

### 3. Implement Token Refresh

```
POST /auth/refresh
Body: { refresh_token: "..." }
Response: { access_token: "...", refresh_token: "..." }
```

### 4. Return 401 on Expired Tokens

```
Status: 401
Body: { error: "Token expired" }
```

---

## API Endpoint Examples

### Create Endpoints for Your Backend

Replace `/api/mock/*` with your actual endpoints:

| Feature | Old Endpoint           | New Endpoint  | Location                           |
| ------- | ---------------------- | ------------- | ---------------------------------- |
| Users   | `/api/mock/users`      | `/users`      | `src/store/slices/usersSlice.ts`   |
| Auth    | `/api/mock/auth/login` | `/auth/login` | `src/@auth/authApi.ts`             |
| Profile | `/api/mock/profile`    | `/profile`    | `src/store/slices/profileSlice.ts` |

---

## Testing Your Setup

### Test 1: Check Backend Connection

```bash
# From terminal
curl http://168.119.228.109/health
```

Expected: `200 OK` or similar success response

### Test 2: Check API Authentication

```bash
# Get a token from your login endpoint
curl -X POST http://168.119.228.109/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass"}'

# Use token for API call
curl http://168.119.228.109/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 3: Test in Frontend

1. Run `npm run dev`
2. Open DevTools → Network tab
3. Make an API request in the app
4. Verify request goes to `http://168.119.228.109`
5. Check token is in `Authorization` header

---

## Troubleshooting

### Issue: CORS Errors

**Solution**: Backend must return correct CORS headers

```
Access-Control-Allow-Origin: http://localhost:3000
```

### Issue: 401 Errors

**Check**:

- Is token being sent? Check Network tab
- Is token valid on backend?
- Has token expired?

Auto-refresh should handle this, but verify backend refresh endpoint works.

### Issue: Requests Still Going to localhost:3000

**Check**:

- `.env.local` has `NEXT_PUBLIC_BASE_URL=http://168.119.228.109`
- Restart `npm run dev`
- Clear browser cache
- Check `src/utils/apiFetch.ts` loads correct base URL

### Issue: Backend Not Responding

**Check**:

- Is backend running? `curl http://168.119.228.109/health`
- Is port correct? (Currently: port 80, assumed)
- Firewall blocking requests?
- CORS configured on backend?

---

## Files Reference

| File                        | Purpose             | Status                              |
| --------------------------- | ------------------- | ----------------------------------- |
| `.env.local`                | Your backend config | ✅ Set to `http://168.119.228.109`  |
| `src/utils/apiFetch.ts`     | Base URL logic      | ✅ Auto-uses `NEXT_PUBLIC_BASE_URL` |
| `src/store/apiService.ts`   | RTK Query + auth    | ✅ Auto-injects token               |
| `src/utils/tokenService.ts` | Token management    | ✅ Auto-refresh on 401              |
| `src/@auth/authApi.ts`      | Example API calls   | 📝 Update with your endpoints       |
| `src/store/slices/`         | Your API endpoints  | 📝 Create new slices                |

---

## Next Steps

1. ✅ Backend is at `http://168.119.228.109`
2. ✅ `.env.local` is configured
3. ✅ Run `npm run dev`
4. 📝 Update API endpoints to match backend
5. 📝 Create API slices for each feature
6. 📝 Test authentication & token refresh
7. 🎯 Deploy frontend when ready

---

## Quick Commands

```bash
# Start development
npm run dev

# Build for production
npm run build

# Production build (local)
npm run start

# Lint
npm run lint

# Check env configuration
cat .env.local
```

---

## Support

For detailed API integration examples, see: `API_INTEGRATION.md`  
For environment setup details, see: `ENVIRONMENT_SETUP.md`  
For quick reference, see: `QUICK_START.md`

---

**Status**: ✅ All systems ready. Backend `http://168.119.228.109` active.
