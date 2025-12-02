# Backend Deployment Verification Checklist

**Backend URL**: `http://168.119.228.109`  
**Status**: ✅ Configured  
**Date**: December 3, 2025

---

## ✅ Configuration Checklist

- [x] `.env.local` created with backend URL
- [x] `NEXT_PUBLIC_BASE_URL=http://168.119.228.109` set
- [x] `AUTH_SECRET` configured
- [x] Documentation updated
- [x] RTK Query ready to use
- [x] Token injection configured
- [x] Token refresh ready

---

## 🚀 Pre-Launch Checklist

### Backend Readiness

- [ ] Backend server running at `http://168.119.228.109`
- [ ] Backend health check endpoint working (`/health` or similar)
- [ ] Database connected and accessible
- [ ] CORS headers configured on backend
- [ ] Auth/login endpoint available

### Frontend Setup

- [ ] Run `npm install` (if not done)
- [ ] Verify `.env.local` has correct backend URL
- [ ] Run `npm run dev` successfully
- [ ] Check console for errors

### API Integration

- [ ] Created API slices for your endpoints in `src/store/slices/`
- [ ] Updated `/api/mock/*` endpoints to `/api/*` (your backend paths)
- [ ] Tested at least one API call (GET)
- [ ] Tested mutation (POST/PUT/DELETE)
- [ ] Verified token is sent in headers

### Authentication

- [ ] Backend login endpoint returns token
- [ ] Token is stored (checked in DevTools → Application → Storage)
- [ ] Token is sent in `Authorization: Bearer` header
- [ ] Token refresh endpoint works
- [ ] 401 triggers auto-refresh

### Testing

- [ ] Open `http://localhost:3000` in browser
- [ ] Check DevTools → Network tab shows requests to `http://168.119.228.109`
- [ ] Login works
- [ ] API calls succeed
- [ ] Error handling works (try invalid request)

---

## 🔍 Quick Verification Steps

### Step 1: Check Backend Connection

```bash
# In terminal
curl http://168.119.228.109/health
```

**Expected**: Response from backend (200 or similar)

### Step 2: Check Frontend Configuration

```bash
# In project root
cat .env.local
```

**Expected**:

```
NEXT_PUBLIC_BASE_URL=http://168.119.228.109
```

### Step 3: Start App

```bash
npm run dev
```

**Expected**: App opens at `http://localhost:3000` without errors

### Step 4: Check Network Tab

1. Open DevTools → Network tab
2. Make an API request
3. Look for requests going to `http://168.119.228.109`
4. Verify `Authorization` header has `Bearer <token>`

### Step 5: Test Authentication

1. Login with backend credentials
2. Check token in DevTools → Application → Cookies/Storage
3. Make authenticated API call
4. Should succeed with 200 status

---

## 📋 Common Issues & Quick Fixes

| Issue                          | Check               | Solution                                              |
| ------------------------------ | ------------------- | ----------------------------------------------------- |
| **404 errors on API calls**    | Endpoint path       | Verify endpoint matches backend routes                |
| **CORS errors**                | Backend CORS config | Add `Access-Control-Allow-Origin` header              |
| **401 errors persist**         | Token refresh       | Ensure refresh endpoint returns new token             |
| **Requests to localhost:3000** | `.env.local`        | Verify `NEXT_PUBLIC_BASE_URL` is correct, restart app |
| **Backend not responding**     | Backend running     | Check if `http://168.119.228.109` is accessible       |
| **Token not sent**             | Auth setup          | Check `tokenService.getAccessToken()` returns token   |

---

## 📁 Key Files to Review

| File                      | Action                | Why                                   |
| ------------------------- | --------------------- | ------------------------------------- |
| `.env.local`              | Verify backend URL    | Ensure API calls go to correct server |
| `src/store/apiService.ts` | Check token injection | Verify auth header is added           |
| `src/store/slices/`       | Create new slices     | Add your API endpoints                |
| `src/@auth/authApi.ts`    | Update endpoints      | Point to your backend routes          |
| `API_INTEGRATION.md`      | Read examples         | Learn how to create endpoints         |

---

## 🎯 Next Actions

1. **Verify Backend is Running**

   ```bash
   curl http://168.119.228.109/health
   ```

2. **Start Frontend**

   ```bash
   npm run dev
   ```

3. **Create API Slices**

   - Copy example from `API_INTEGRATION.md`
   - Create `src/store/slices/` for each feature
   - Replace `/api/mock/*` with your endpoints

4. **Test API Calls**

   - Use DevTools Network tab
   - Verify requests go to `168.119.228.109`
   - Check response status codes

5. **Test Authentication**

   - Login with backend credentials
   - Verify token is sent
   - Try protected endpoints

6. **Deploy When Ready**
   ```bash
   npm run build
   npm run start
   ```

---

## 📞 Debugging Commands

```bash
# Check Node/npm versions
node --version
npm --version

# Check if port 3000 is available
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Verify backend URL
ping 168.119.228.109

# Check env file
cat .env.local | grep NEXT_PUBLIC_BASE_URL

# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
npm install

# Fresh start
npm run dev
```

---

## 📊 Configuration Summary

| Setting         | Value                  | Status                   |
| --------------- | ---------------------- | ------------------------ |
| Frontend Port   | 3000                   | ✅                       |
| Frontend URL    | http://localhost:3000  | ✅                       |
| Backend URL     | http://168.119.228.109 | ✅                       |
| Auth Secret     | Set                    | ✅                       |
| Token Injection | Auto                   | ✅                       |
| Token Refresh   | Auto                   | ✅                       |
| CORS Support    | Ready                  | ⏳ Backend config needed |

---

## ✅ Sign-Off

- [x] Backend URL configured: `http://168.119.228.109`
- [x] Environment variables set
- [x] Documentation updated
- [x] Ready for development

**Status**: ✅ All systems ready. Proceed with development.

---

For more details, see:

- `DEPLOYMENT_SETUP.md` - Detailed setup guide
- `API_INTEGRATION.md` - API integration examples
- `ENVIRONMENT_SETUP.md` - Environment configuration
- `QUICK_START.md` - Quick reference
