'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import _ from 'lodash'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { Alert } from '@mui/material'
import FusePageCarded from '@fuse/core/FusePageCarded'
import FuseSvgIcon from '@fuse/core/FuseSvgIcon'

/**
 * Form Validation Schema
 */
const schema = z.object({
  otp: z
    .string()
    .min(6, 'OTP must be 6 digits')
    .max(6, 'OTP must be 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only numbers'),
})

type FormType = {
  otp: string
}

const defaultValues = {
  otp: '',
}

function VerifyPage() {
  const [verificationMethod, setVerificationMethod] = useState<string>('')
  const [verificationData, setVerificationData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const { control, formState, handleSubmit, setError, setValue } =
    useForm<FormType>({
      mode: 'onChange',
      defaultValues,
      resolver: zodResolver(schema),
    })

  const { isValid, dirtyFields, errors } = formState

  useEffect(() => {
    // Check if there's a token in the URL (from email verification link)
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')

    if (token) {
      // Handle email verification from URL token
      handleEmailVerificationFromToken(token)
      return
    }

    // Get verification data from localStorage
    const method = localStorage.getItem('verificationMethod')
    const data = localStorage.getItem('verificationData')

    if (method && data) {
      try {
        const parsedData = JSON.parse(data)
        setVerificationMethod(method)
        setVerificationData(parsedData)
      } catch (error) {
        console.error('Error parsing verification data:', error)
        // Clear invalid data and redirect
        localStorage.removeItem('verificationMethod')
        localStorage.removeItem('verificationData')
        window.location.href = '/sign-in'
      }
    } else {
      // Redirect to sign-in if no verification data
      window.location.href = '/sign-in'
    }
  }, [])

  useEffect(() => {
    // Start resend cooldown timer
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const startResendCooldown = () => {
    setResendCooldown(60) // 60 seconds cooldown
  }

  const handleEmailVerificationFromToken = async (token) => {
    setIsLoading(true)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/verify`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: token,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        setError('root', {
          type: 'manual',
          message: errorData.message || 'Email verification failed',
        })
        return
      }

      // Email verification successful
      const data = await response.json()

      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname)

      // Redirect to sign-in to get tokens
      window.location.href = '/sign-in'
    } catch (error) {
      setError('root', {
        type: 'manual',
        message: 'Email verification failed. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function onSubmit(formData: FormType) {
    setIsLoading(true)

    try {
      const { otp } = formData

      // Safety check
      if (!verificationData) {
        setError('root', {
          type: 'manual',
          message: 'Verification data not found. Please try again.',
        })
        setIsLoading(false)
        return
      }

      let response

      if (verificationMethod === 'email') {
        // Email verification
        response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/verify`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              token: verificationData?.verificationToken,
            }),
          }
        )
      } else {
        // SMS verification
        response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-otp`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              phone: verificationData?.phone || verificationData?.user?.phone,
              otp: otp,
            }),
          }
        )
      }

      if (!response.ok) {
        const errorData = await response.json()
        setError('root', {
          type: 'manual',
          message: errorData.message || 'Verification failed',
        })
        return
      }

      // Check if this was a login-based verification before clearing data
      const isLoginVerification =
        verificationData?.user && !verificationData?.token

      // Clear verification data
      localStorage.removeItem('verificationMethod')
      localStorage.removeItem('verificationData')

      if (isLoginVerification) {
        // This was a login-based verification, redirect to login to get tokens
        window.location.href = '/sign-in'
      } else {
        // This was a registration-based verification, redirect to dashboard
        window.location.href = '/dashboards/project'
      }
    } catch (error) {
      setError('root', {
        type: 'manual',
        message: 'Verification failed. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (resendCooldown > 0) return

    setIsLoading(true)
    startResendCooldown()

    try {
      // Safety check
      if (!verificationData) {
        console.error('No verification data available for resend')
        setIsLoading(false)
        return
      }

      if (verificationMethod === 'email') {
        // Resend email verification
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/resend-email-verification`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: verificationData?.user?.email || verificationData?.email,
            }),
          }
        )

        if (response.ok) {
          const data = await response.json()
          if (data.verificationToken) {
            // Update verification data with new token
            setVerificationData({
              ...verificationData,
              verificationToken: data.verificationToken,
            })
          }
        }
      } else {
        // Resend SMS OTP
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/send-otp`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              phone: verificationData?.phone || verificationData?.user?.phone,
            }),
          }
        )

        if (response.ok) {
          const data = await response.json()
          if (data.otp) {
            // Update verification data with new OTP
            setVerificationData({ ...verificationData, otp: data.otp })
          }
        }
      }
    } catch (error) {
      console.error('Resend failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getVerificationMessage = () => {
    if (verificationMethod === 'email') {
      return `We've sent a verification link to your email address. Please check your inbox and click the link to verify your account. If you don't see the email, please check your spam folder or request a new verification email.`
    } else {
      return `We've sent a 6-digit verification code to your phone number. Please enter the code below to verify your account.`
    }
  }

  const getDevelopmentOTP = () => {
    if (process.env.NODE_ENV === 'development' && verificationData?.otp) {
      return verificationData.otp
    }
    return null
  }

  // Show loading state while verification data is being loaded
  if (!verificationMethod || !verificationData) {
    return (
      <FusePageCarded
        header={
          <div className='flex flex-col sm:flex-row space-y-16 sm:space-y-0 sm:space-x-16 w-full sm:items-center sm:justify-between'>
            <Typography className='text-24 font-semibold'>
              Loading...
            </Typography>
          </div>
        }
        content={
          <div className='flex items-center justify-center min-h-[400px]'>
            <Typography>Loading verification data...</Typography>
          </div>
        }
      />
    )
  }

  return (
    <FusePageCarded
      header={
        <div className='flex flex-col sm:flex-row space-y-16 sm:space-y-0 sm:space-x-16 w-full sm:items-center sm:justify-between'>
          <Typography className='text-24 font-semibold'>
            Verify Your Account
          </Typography>
        </div>
      }
      content={
        <div className='flex flex-col items-center justify-center min-h-screen p-24'>
          <div className='w-full max-w-md'>
            <div className='text-center mb-32'>
              <FuseSvgIcon size={64} className='text-primary mb-16'>
                {verificationMethod === 'email'
                  ? 'heroicons-outline:mail'
                  : 'heroicons-outline:device-phone-mobile'}
              </FuseSvgIcon>
              <Typography variant='h4' className='mb-8'>
                {verificationMethod === 'email'
                  ? 'Check Your Email'
                  : 'Enter Verification Code'}
              </Typography>
              <Typography variant='body1' className='text-gray-600'>
                {getVerificationMessage()}
              </Typography>
            </div>

            {getDevelopmentOTP() && (
              <Alert severity='info' className='mb-24'>
                <Typography variant='body2'>
                  <strong>Development Mode:</strong> Your verification code is:{' '}
                  <strong>{getDevelopmentOTP()}</strong>
                </Typography>
              </Alert>
            )}

            <form
              name='verifyForm'
              noValidate
              className='flex w-full flex-col justify-center'
              onSubmit={handleSubmit(onSubmit)}
            >
              {errors?.root?.message && (
                <Alert
                  className='mb-32'
                  severity='error'
                  sx={(theme) => ({
                    backgroundColor: theme.palette.error.light,
                    color: theme.palette.error.dark,
                  })}
                >
                  {errors?.root?.message}
                </Alert>
              )}

              {verificationMethod === 'sms' && (
                <Controller
                  name='otp'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      className='mb-24'
                      label='Verification Code'
                      autoFocus
                      type='text'
                      inputProps={{ maxLength: 6 }}
                      error={!!errors.otp}
                      helperText={errors?.otp?.message}
                      variant='outlined'
                      required
                      fullWidth
                      placeholder='Enter 6-digit code'
                    />
                  )}
                />
              )}

              {verificationMethod === 'sms' && (
                <Button
                  variant='contained'
                  color='secondary'
                  className='mt-16 w-full'
                  aria-label='Verify Account'
                  disabled={isLoading || _.isEmpty(dirtyFields) || !isValid}
                  type='submit'
                  size='large'
                >
                  Verify Code
                </Button>
              )}

              {verificationMethod === 'email' && (
                <div className='mt-16 text-center'>
                  <Typography variant='body2' className='text-gray-600 mb-16'>
                    Please check your email and click the verification link to
                    complete your account setup. Once verified, you can sign in
                    to access your account.
                  </Typography>
                  <Button
                    variant='outlined'
                    color='primary'
                    className='w-full'
                    onClick={() => (window.location.href = '/sign-in')}
                    size='large'
                  >
                    Back to Sign In
                  </Button>
                </div>
              )}

              <div className='mt-24 text-center'>
                <Typography variant='body2' className='text-gray-600 mb-8'>
                  {verificationMethod === 'email'
                    ? "Didn't receive the verification email?"
                    : "Didn't receive the verification code?"}
                </Typography>
                <Button
                  variant='text'
                  color='primary'
                  onClick={handleResendCode}
                  disabled={resendCooldown > 0 || isLoading}
                >
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : verificationMethod === 'email'
                      ? 'Resend Email'
                      : 'Resend Code'}
                </Button>
              </div>

              {verificationMethod === 'sms' && (
                <div className='mt-16 text-center'>
                  <Button
                    variant='text'
                    color='secondary'
                    onClick={() => {
                      // Check if this is login-based verification
                      const isLoginVerification =
                        verificationData.user && !verificationData.token
                      window.location.href = isLoginVerification
                        ? '/sign-in'
                        : '/sign-up'
                    }}
                  >
                    Back to{' '}
                    {verificationData.user && !verificationData.token
                      ? 'Sign In'
                      : 'Sign Up'}
                  </Button>
                </div>
              )}
            </form>
          </div>
        </div>
      }
    />
  )
}

export default VerifyPage
