import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
} from '@reduxjs/toolkit/query'
import { API_BASE_URL, globalHeaders } from '@/utils/apiFetch'
import tokenService from '@/utils/tokenService'

const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  object,
  FetchBaseQueryMeta
> = async (args, api, extraOptions) => {
  const result = await fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      Object.entries(globalHeaders).forEach(([key, value]) => {
        headers.set(key, value)
      })

      // Add authorization header if token exists
      const token = tokenService.getAccessToken()
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }

      return headers
    },
  })(args, api, extraOptions)

  // Handle 401 errors with automatic token refresh
  if (result.error && result.error.status === 401) {
    try {
      // Try to refresh the token
      const newToken = await tokenService.refreshAccessToken()

      // Retry the original request with new token
      const retryResult = await fetchBaseQuery({
        baseUrl: API_BASE_URL,
        prepareHeaders: (headers, { getState }) => {
          Object.entries(globalHeaders).forEach(([key, value]) => {
            headers.set(key, value)
          })
          headers.set('Authorization', `Bearer ${newToken}`)
          return headers
        },
      })(args, api, extraOptions)

      return retryResult
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError)
      // If refresh fails, the tokenService will handle logout
      return result
    }
  }

  return result
}

export const apiService = createApi({
  baseQuery,
  endpoints: () => ({}),
  reducerPath: 'apiService',
})

export default apiService
