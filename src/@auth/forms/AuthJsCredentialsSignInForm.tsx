import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { z } from 'zod'
import _ from 'lodash'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Link from '@fuse/core/Link'
import Button from '@mui/material/Button'
import { signIn } from 'next-auth/react'
import { Alert } from '@mui/material'
import signinErrors from './signinErrors'

/**
 * Form Validation Schema
 */
const schema = z.object({
  identifier: z.string().nonempty('You must enter an email or phone number'),
  password: z
    .string()
    .min(4, 'Password is too short - must be at least 4 chars.')
    .nonempty('Please enter your password.'),
})

type FormType = {
  identifier: string
  password: string
  remember?: boolean
}

const defaultValues = {
  identifier: '',
  password: '',
  remember: true,
}

function AuthJsCredentialsSignInForm() {
  const { control, formState, handleSubmit, setValue, setError } =
    useForm<FormType>({
      mode: 'onChange',
      defaultValues,
      resolver: zodResolver(schema),
    })

  const { isValid, dirtyFields, errors } = formState

  // useEffect(() => {
  //   setValue('email', 'admin@yopmail.com', {
  //     shouldDirty: true,
  //     shouldValidate: true,
  //   })
  //   setValue('password', 'admin@123', {
  //     shouldDirty: true,
  //     shouldValidate: true,
  //   })
  // }, [setValue])

  async function onSubmit(formData: FormType) {
    const { identifier, password } = formData

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password }),
      }
    )

    if (!response.ok) {
      throw new Error('Failed to login')
    }

    const data = await response.json()

    // Check if verification is required
    if (data.data.verificationRequired) {
      // Store verification data for OTP screen
      localStorage.setItem('verificationMethod', data.data.verificationMethod)
      localStorage.setItem('verificationData', JSON.stringify(data.data))
      window.location.href = '/verify'
      return
    }

    // Store the tokens in local storage for verified users
    const token = data?.data.token
    const refreshToken = data?.data.refreshToken

    if (token) {
      localStorage.setItem('token', token)
    }
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken)
    }

    // Redirect to dashboard for verified users
    window.location.href = '/dashboards/project'

    // const result = await signIn('credentials', {
    // 	email,
    // 	password,
    // 	formType: 'signin',
    // 	redirect: false
    // });

    // if (result?.error) {
    // 	setError('root', { type: 'manual', message: signinErrors[result.error] });
    // 	return false;
    // }

    return true
  }

  return (
    <form
      name='loginForm'
      noValidate
      className='mt-32 flex w-full flex-col justify-center'
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
      <Controller
        name='password'
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            className='mb-24'
            label='Password'
            type='password'
            error={!!errors.password}
            helperText={errors?.password?.message}
            variant='outlined'
            required
            fullWidth
          />
        )}
      />
      <div className='flex flex-col items-center justify-center sm:flex-row sm:justify-between'>
        <Controller
          name='remember'
          control={control}
          render={({ field }) => (
            <FormControl>
              <FormControlLabel
                label='Remember me'
                control={<Checkbox size='small' {...field} />}
              />
            </FormControl>
          )}
        />

        <Link className='text-md font-medium' to='/forgot-password'>
          Forgot password?
        </Link>
      </div>
      <Button
        variant='contained'
        color='secondary'
        className='mt-16 w-full'
        aria-label='Sign in'
        disabled={_.isEmpty(dirtyFields) || !isValid}
        type='submit'
        size='large'
      >
        Sign in
      </Button>
    </form>
  )
}

export default AuthJsCredentialsSignInForm
