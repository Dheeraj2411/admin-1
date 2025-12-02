/**
 * Token Service - Handles token refresh and management
 */

interface RefreshTokenResponse {
  success: boolean
  data: {
    token: string
    refreshToken: string
  }
  message?: string
}

class TokenService {
  private isRefreshing = false
  private refreshPromise: Promise<string> | null = null

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem('token')
  }

  /**
   * Get stored refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken')
  }

  /**
   * Set access token
   */
  setAccessToken(token: string): void {
    localStorage.setItem('token', token)
  }

  /**
   * Set refresh token
   */
  setRefreshToken(refreshToken: string): void {
    localStorage.setItem('refreshToken', refreshToken)
  }

  /**
   * Clear all tokens
   */
  clearTokens(): void {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken()
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<string> {
    // If already refreshing, return the existing promise
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise
    }

    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    this.isRefreshing = true
    this.refreshPromise = this.performTokenRefresh(refreshToken)

    try {
      const newAccessToken = await this.refreshPromise
      return newAccessToken
    } finally {
      this.isRefreshing = false
      this.refreshPromise = null
    }
  }

  /**
   * Perform the actual token refresh API call
   */
  private async performTokenRefresh(refreshToken: string): Promise<string> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        }
      )

      if (!response.ok) {
        throw new Error(`Refresh failed: ${response.status}`)
      }

      const data: RefreshTokenResponse = await response.json()

      if (!data.success || !data.data) {
        throw new Error(data.message || 'Token refresh failed')
      }

      // Update stored tokens
      this.setAccessToken(data.data.token)
      this.setRefreshToken(data.data.refreshToken)

      return data.data.token
    } catch (error) {
      console.error('Token refresh error:', error)
      // Clear tokens on refresh failure
      this.clearTokens()
      throw error
    }
  }

  /**
   * Handle API request with automatic token refresh
   */
  async makeAuthenticatedRequest(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const token = this.getAccessToken()

    if (!token) {
      throw new Error('No access token available')
    }

    // Add authorization header
    const headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    }

    let response = await fetch(url, {
      ...options,
      headers,
    })

    // If 401 Unauthorized, or 403 Forbidden, try to refresh token
    if (response.status === 401 || response.status === 403) {
      try {
        const newToken = await this.refreshAccessToken()

        // Retry the request with new token
        response = await fetch(url, {
          ...options,
          headers: {
            ...headers,
            Authorization: `Bearer ${newToken}`,
          },
        })
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
        // Redirect to login on refresh failure
        this.redirectToLogin()
        throw refreshError
      }
    }

    return response
  }

  /**
   * Redirect to login page
   */
  private redirectToLogin(): void {
    this.clearTokens()
    window.location.href = '/sign-in'
  }

  /**
   * Logout user
   */
  logout(): void {
    this.clearTokens()
    window.location.href = '/sign-in'
  }
}

// Export singleton instance
export const tokenService = new TokenService()
export default tokenService
