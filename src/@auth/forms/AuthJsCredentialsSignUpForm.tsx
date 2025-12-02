import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import _ from 'lodash'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import { signIn } from 'next-auth/react'
import FormHelperText from '@mui/material/FormHelperText'
import { Alert } from '@mui/material'
import signinErrors from './signinErrors'

/**
 * Form Validation Schema
 */
const schema = z
  .object({
    name: z.string().nonempty('You must enter your name'),
    identifier: z.string().nonempty('You must enter an email or phone number'),
    password: z
      .string()
      .nonempty('Please enter your password.')
      .min(8, 'Password is too short - should be 8 chars minimum.'),
    passwordConfirm: z.string().nonempty('Password confirmation is required'),
    role: z.string().optional(),
    acceptTermsConditions: z
      .boolean()
      .refine(
        (val) => val === true,
        'The terms and conditions must be accepted.'
      ),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Passwords must match',
    path: ['passwordConfirm'],
  })

const defaultValues = {
  name: '',
  identifier: '',
  password: '',
  passwordConfirm: '',
  role: 'customer',
  acceptTermsConditions: false,
}

export type FormType = {
  name: string
  identifier: string
  password: string
  role?: string
}

function AuthJsCredentialsSignUpForm() {
  const { control, formState, handleSubmit, setError } = useForm({
    mode: 'onChange',
    defaultValues,
    resolver: zodResolver(schema),
  })

  const { isValid, dirtyFields, errors } = formState

  async function onSubmit(formData: FormType) {
    const { name, identifier, password, role } = formData

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, identifier, password, role }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        setError('root', {
          type: 'manual',
          message: errorData.message || 'Registration failed',
        })
        return false
      }

      const data = await response.json()

      // Store tokens
      if (data.data.token) {
        localStorage.setItem('token', data.data.token)
      }
      if (data.data.refreshToken) {
        localStorage.setItem('refreshToken', data.data.refreshToken)
      }

      // Redirect to verification page if needed
      if (data.data.verificationMethod) {
        // Store verification data for OTP screen
        localStorage.setItem('verificationMethod', data.data.verificationMethod)
        localStorage.setItem('verificationData', JSON.stringify(data.data))
        window.location.href = '/verify'
      } else {
        window.location.href = '/dashboards/project'
      }

      return true
    } catch (error) {
      setError('root', {
        type: 'manual',
        message: 'Registration failed. Please try again.',
      })
      return false
    }
  }

  return (
    <form
      name='registerForm'
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
        name='name'
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            className='mb-24'
            label='Full Name'
            autoFocus
            type='text'
            error={!!errors.name}
            helperText={errors?.name?.message}
            variant='outlined'
            required
            fullWidth
          />
        )}
      />
      <Controller
        name='identifier'
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            className='mb-24'
            label='Email or Phone Number'
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
      <Controller
        name='passwordConfirm'
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            className='mb-24'
            label='Password (Confirm)'
            type='password'
            error={!!errors.passwordConfirm}
            helperText={errors?.passwordConfirm?.message}
            variant='outlined'
            required
            fullWidth
          />
        )}
      />
      <Controller
        name='acceptTermsConditions'
        control={control}
        render={({ field }) => (
          <FormControl error={!!errors.acceptTermsConditions}>
            <FormControlLabel
              label='I agree with Terms and Privacy Policy'
              control={<Checkbox size='small' {...field} />}
            />
            <FormHelperText>
              {errors?.acceptTermsConditions?.message}
            </FormHelperText>
          </FormControl>
        )}
      />
      <Button
        variant='contained'
        color='secondary'
        className='mt-24 w-full'
        aria-label='Register'
        disabled={_.isEmpty(dirtyFields) || !isValid}
        type='submit'
        size='large'
      >
        Create your free account
      </Button>
    </form>
  )
}

export default AuthJsCredentialsSignUpForm
