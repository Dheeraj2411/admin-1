import FuseLoading from '@fuse/core/FuseLoading'
import { usePathname, useRouter } from 'next/navigation'
import { createContext, useState, useEffect } from 'react'
import tokenService from '@/utils/tokenService'

const UserContext = createContext()

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)

  const router = useRouter()
  const [loading, setLoading] = useState(true) // Add a loading state

  const pathName = usePathname()

  useEffect(() => {
    if (tokenService.isAuthenticated()) {
      authCheck()
    } else {
      setLoading(false) // No token, stop loading
    }
  }, [pathName, tokenService.isAuthenticated()])

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (token && user) {
      if (pathName === '/sign-in') {
        router.push('/dashboards/project')
      }
      // else {
      //   router.push(pathName);
      // }
    } else if (
      !token &&
      pathName !== '/sign-in' &&
      pathName !== '/verify' &&
      pathName !== '/sign-up' &&
      pathName !== '/forgot-password'
    ) {
      router.push('/sign-in')
      // window.location.href = '/dashboards/project'
    }
  }, [pathName, user])

  const authCheck = async () => {
    try {
      const token = tokenService.getAccessToken()

      if (token) {
        const response = await tokenService.makeAuthenticatedRequest(
          `${process.env.NEXT_PUBLIC_API_URL}/profile`
        )

        const { data } = await response.json()

        console.log(data)
        if (data?.user?.id) {
          setUser(data?.user)
          localStorage.setItem('user', JSON.stringify(data?.user))
        } else {
          tokenService.logout()
        }
      } else {
        router.push('/sign-in')
        setUser(null)
      }
    } catch (error) {
      console.log(error)
      tokenService.logout()
      setUser(null)
      console.error('Error setting up the client:', error)
    } finally {
      setLoading(false) // Stop loading after the check
    }
  }

  if (loading) {
    return <FuseLoading /> // Render nothing while loading
  }

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  )
}

export { UserProvider, UserContext }
