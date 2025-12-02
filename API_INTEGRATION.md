# API Integration Guide - Connecting to Your Backend

## Overview

This admin dashboard is ready to connect to any backend API. It uses **RTK Query** for API calls with automatic token management and error handling.

## Current Setup

### Mock API (Development)

- **Uses**: `src/@mock-utils/mockDb.json` (fake data)
- **Endpoints**: `/api/mock/*`
- **No Backend Required**: Works offline with demo login

### Real API (Production)

- **Base URL**: Configured via `NEXT_PUBLIC_BASE_URL`
- **Auth**: Bearer token auto-injected
- **Token Refresh**: Automatic on 401 errors

---

## Step-by-Step Integration

### 1. Environment Configuration

**`.env.local` (Development)**

```env
NEXT_PUBLIC_BASE_URL=http://localhost:5000
NEXT_PUBLIC_PORT=3000
AUTH_SECRET=dev-secret
```

**`.env.production` (Production)**

```env
NEXT_PUBLIC_BASE_URL=https://api.yourapp.com
AUTH_SECRET=production-secret
```

### 2. Create API Service Slice

Create a new file: `src/store/slices/usersSlice.ts`

```typescript
import apiService from "@/store/apiService";
import { createSlice } from "@reduxjs/toolkit";

export const usersApi = apiService.injectEndpoints({
  endpoints: (build) => ({
    getUsers: build.query({
      query: (params) => ({
        url: "/users", // Will use NEXT_PUBLIC_BASE_URL + /users
        method: "GET",
        params, // Query parameters
      }),
      providesTags: ["Users"], // For cache invalidation
    }),

    getUserById: build.query({
      query: (userId) => `/users/${userId}`,
      providesTags: (result, error, userId) => [{ type: "Users", id: userId }],
    }),

    createUser: build.mutation({
      query: (userData) => ({
        url: "/users",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["Users"], // Refresh list after create
    }),

    updateUser: build.mutation({
      query: ({ id, ...patch }) => ({
        url: `/users/${id}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Users", id }],
    }),

    deleteUser: build.mutation({
      query: (userId) => ({
        url: `/users/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, userId) => [
        { type: "Users", id: userId },
      ],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApi;
```

### 3. Use in Components

```tsx
"use client";

import {
  useGetUsersQuery,
  useCreateUserMutation,
} from "@/store/slices/usersSlice";

export function UsersList() {
  const {
    data: users,
    isLoading,
    error,
  } = useGetUsersQuery(undefined, {
    // Optional: refetch every 5 minutes
    pollingInterval: 5 * 60 * 1000,
  });

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();

  const handleCreate = async (userData) => {
    try {
      await createUser(userData).unwrap();
      // Success - cache automatically updates via invalidatesTags
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading users</div>;

  return (
    <div>
      {users?.map((user) => <div key={user.id}>{user.name}</div>)}
      <button onClick={() => handleCreate({ name: "New User" })}>
        Create User
      </button>
    </div>
  );
}
```

---

## API Request/Response Format

### Standard Request Headers (Auto-Added)

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Expected Response Format

**Success (2xx)**

```json
{
  "data": {
    /* Your data */
  },
  "status": "success"
}
```

**Error (4xx/5xx)**

```json
{
  "error": "Error message",
  "status": "error",
  "code": "ERROR_CODE"
}
```

The app will wrap this in a `FetchApiError`:

```typescript
catch (error) {
  if (error instanceof FetchApiError) {
    console.log(error.status) // HTTP status code
    console.log(error.data)   // Response body
  }
}
```

---

## Authentication Integration

### How Token Management Works

1. **Login**: Backend returns token

   ```json
   { "access_token": "jwt...", "refresh_token": "jwt..." }
   ```

2. **Store Token**:

   ```typescript
   // src/utils/tokenService.ts handles this
   tokenService.setAccessToken(response.access_token);
   tokenService.setRefreshToken(response.refresh_token);
   ```

3. **Auto-Inject Token**:

   ```typescript
   // In apiService.ts - automatically happens
   headers.set("Authorization", `Bearer ${token}`);
   ```

4. **Auto-Refresh**:
   ```typescript
   // On 401 error
   const newToken = await tokenService.refreshAccessToken();
   // Retry request with new token
   ```

### Backend Requirements

Your backend must:

1. **Accept Bearer tokens**:

   ```
   Authorization: Bearer <token>
   ```

2. **Implement refresh endpoint**:

   ```
   POST /auth/refresh
   Body: { refresh_token: "..." }
   Response: { access_token: "...", refresh_token: "..." }
   ```

3. **Return 401 on token expiry**:
   ```
   Status: 401
   Body: { error: "Token expired" }
   ```

### Setting Tokens After Login

In your login endpoint handler:

```typescript
const response = await yourLoginApi({ email, password });

// Store tokens
tokenService.setAccessToken(response.access_token);
tokenService.setRefreshToken(response.refresh_token);

// Tokens now auto-injected in all RTK Query requests
```

---

## Error Handling

### Catching API Errors

```typescript
import { FetchApiError } from "@/utils/apiFetch";

try {
  const result = await usersApi.getUsers().unwrap();
} catch (error) {
  if (error instanceof FetchApiError) {
    switch (error.status) {
      case 400:
        console.error("Bad request:", error.data);
        break;
      case 401:
        console.error("Unauthorized - token invalid");
        break;
      case 404:
        console.error("Not found:", error.data);
        break;
      case 500:
        console.error("Server error:", error.data);
        break;
    }
  }
}
```

### Using Notistack for User Feedback

```typescript
import { useSnackbar } from 'notistack'

function MyComponent() {
  const { enqueueSnackbar } = useSnackbar()
  const [createUser] = useCreateUserMutation()

  const handleCreate = async (userData) => {
    try {
      await createUser(userData).unwrap()
      enqueueSnackbar('User created successfully', { variant: 'success' })
    } catch (error) {
      enqueueSnackbar('Failed to create user', { variant: 'error' })
    }
  }

  return <button onClick={() => handleCreate({})}>Create</button>
}
```

---

## Pagination Example

```typescript
// API Slice
export const usersApi = apiService.injectEndpoints({
  endpoints: (build) => ({
    getUsersPaginated: build.query({
      query: ({ page = 1, limit = 10, search = '' }) => ({
        url: '/users',
        params: { page, limit, search },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Users', id })),
              { type: 'Users', id: 'LIST' },
            ]
          : [{ type: 'Users', id: 'LIST' }],
    }),
  }),
})

// Component
'use client'
import { useState } from 'react'
import { useGetUsersPaginatedQuery } from '@/store/slices/usersSlice'
import { DataGrid } from '@mui/x-data-grid'

export function UsersTable() {
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  })

  const { data, isLoading } = useGetUsersPaginatedQuery({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
  })

  return (
    <DataGrid
      rows={data?.data || []}
      columns={[
        { field: 'id', headerName: 'ID' },
        { field: 'name', headerName: 'Name', flex: 1 },
      ]}
      rowCount={data?.total || 0}
      loading={isLoading}
      paginationModel={paginationModel}
      onPaginationModelChange={setPaginationModel}
      pageSizeOptions={[10, 25, 50]}
    />
  )
}
```

---

## Testing API Integration

### Using API Route Handlers

Create `src/app/api/users/route.ts` to test with mock data:

```typescript
export async function GET(request: Request) {
  return Response.json({
    data: [
      { id: 1, name: "User 1" },
      { id: 2, name: "User 2" },
    ],
  });
}
```

Then in `.env.local`:

```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

This routes API calls to your Next.js server instead of external backend.

---

## Common Issues & Solutions

| Issue                   | Solution                                                        |
| ----------------------- | --------------------------------------------------------------- |
| **CORS Errors**         | Backend must have correct CORS headers set                      |
| **401 Errors**          | Check token is stored correctly in tokenService                 |
| **Token Refresh Fails** | Backend must return new token from refresh endpoint             |
| **404 Errors**          | Verify endpoint path matches backend routes                     |
| **Network Timeouts**    | Check if backend is running and NEXT_PUBLIC_BASE_URL is correct |
| **Auth redirect loop**  | Verify refresh endpoint works and returns valid token           |

---

## Key Files Reference

- `src/store/apiService.ts` - RTK Query setup
- `src/utils/tokenService.ts` - Token storage & refresh
- `src/utils/apiFetch.ts` - Base URL configuration
- `src/@auth/authApi.ts` - Example API calls (uses apiFetch)
- `.env.local` - Environment variables
