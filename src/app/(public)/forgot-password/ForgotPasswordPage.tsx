'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import _ from 'lodash'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { Alert } from '@mui/material'
import FusePageCarded from '@fuse/core/FusePageCarded'
import FuseSvgIcon from '@fuse/core/FuseSvgIcon'

/**
 * Form Validation Schema
 */
const schema = z.object({
  identifier: z.string().nonempty('You must enter an email or phone number'),
})

type FormType = {
  identifier: string
}

const defaultValues = {
  identifier: '',
}

function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [resetMethod, setResetMethod] = useState<string>('')

  const { control, formState, handleSubmit, setError } = useForm<FormType>({
    mode: 'onChange',
    defaultValues,
    resolver: zodResolver(schema),
  })

  const { isValid, dirtyFields, errors } = formState

  async function onSubmit(formData: FormType) {
    setIsLoading(true)

    try {
      const { identifier } = formData

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ identifier }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        setError('root', {
          type: 'manual',
          message: errorData.message || 'Failed to send reset request',
        })
        return
      }

      const data = await response.json()
      setResetMethod(data.resetMethod || 'email')
      setIsSuccess(true)
    } catch (error) {
      setError('root', {
        type: 'manual',
        message: 'Failed to send reset request. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getSuccessMessage = () => {
    if (resetMethod === 'email') {
      return "We've sent a password reset link to your email address. Please check your inbox and follow the instructions."
    } else {
      return "We've sent a password reset code to your phone number. Please check your messages."
    }
  }

  if (isSuccess) {
    return (
      <FusePageCarded
        header={
          <div className='flex flex-col sm:flex-row space-y-16 sm:space-y-0 sm:space-x-16 w-full sm:items-center sm:justify-between'>
            <Typography className='text-24 font-semibold'>
              Reset Password
            </Typography>
          </div>
        }
        content={
          <div className='flex flex-col items-center justify-center min-h-screen p-24'>
            <div className='w-full max-w-md'>
              <div className='text-center mb-32'>
                <FuseSvgIcon size={64} className='text-green-500 mb-16'>
                  heroicons-outline:check-circle
                </FuseSvgIcon>
                <Typography variant='h4' className='mb-8'>
                  Check Your {resetMethod === 'email' ? 'Email' : 'Phone'}
                </Typography>
                <Typography variant='body1' className='text-gray-600'>
                  {getSuccessMessage()}
                </Typography>
              </div>

              <div className='text-center'>
                <Button
                  variant='contained'
                  color='primary'
                  onClick={() => (window.location.href = '/sign-in')}
                  className='mb-16'
                >
                  Back to Sign In
                </Button>
                <br />
                <Button
                  variant='text'
                  color='secondary'
                  onClick={() => {
                    setIsSuccess(false)
                    setResetMethod('')
                  }}
                >
                  Try Again
                </Button>
              </div>
            </div>
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
            Reset Password
          </Typography>
        </div>
      }
      content={
        <div className='flex flex-col items-center justify-center min-h-screen p-24'>
          <div className='w-full max-w-md'>
            <div className='text-center mb-32'>
              <FuseSvgIcon size={64} className='text-primary mb-16'>
                heroicons-outline:key
              </FuseSvgIcon>
              <Typography variant='h4' className='mb-8'>
                Forgot Your Password?
              </Typography>
              <Typography variant='body1' className='text-gray-600'>
                Enter your email or phone number and we'll send you a reset link
                or code.
              </Typography>
            </div>

            <form
              name='forgotPasswordForm'
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

              <Controller
                name='identifier'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    className='mb-24'
                    label='Email or Phone Number'
                    autoFocus
                    type='text'
                    error={!!errors.identifier}
                    helperText={errors?.identifier?.message}
                    variant='outlined'
                    required
                    fullWidth
                    placeholder='Enter your email or phone number'
                  />
                )}
              />

              <Button
                variant='contained'
                color='secondary'
                className='mt-16 w-full'
                aria-label='Send Reset Request'
                disabled={_.isEmpty(dirtyFields) || !isValid}
                type='submit'
                size='large'
                loading={isLoading}
              >
                Send Reset Request
              </Button>

              <div className='mt-24 text-center'>
                <Button
                  variant='text'
                  color='primary'
                  onClick={() => (window.location.href = '/sign-in')}
                >
                  Back to Sign In
                </Button>
              </div>
            </form>
          </div>
        </div>
      }
    />
  )
}

export default ForgotPasswordPage
