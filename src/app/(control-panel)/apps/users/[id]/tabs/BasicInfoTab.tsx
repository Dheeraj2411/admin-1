import {
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Switch,
  FormControlLabel,
} from '@mui/material'
import { Controller, useFormContext } from 'react-hook-form'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import moment from 'moment'

export const countryCodes = [
  { code: '+1', country: 'USA' },
  { code: '+44', country: 'UK' },
  { code: '+91', country: 'India' },
  { code: '+61', country: 'Australia' },
  { code: '+49', country: 'Germany' },
]

function BasicInfoTab({ id }: any) {
  const { control, formState } = useFormContext()
  const { errors } = formState

  return (
    <div className='flex flex-col w-full gap-[16px]'>
      <div className='flex gap-6'>
        <Controller
          name='name'
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label='Name'
              required
              autoFocus
              fullWidth
              error={!!errors.name}
              helperText={errors?.name?.message as string}
            />
          )}
        />

        <Controller
          name='role'
          control={control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                {...field}
                value={field.value || 'customer'}
                label='Role'
                defaultValue='customer'
              >
                {['customer', 'job_seeker', 'admin'].map((role) => (
                  <MenuItem key={role} value={role}>
                    {role === 'job_seeker' ? 'Job Seeker' : role?.toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
      </div>
      <Controller
        name='email'
        rules={{ required: true }}
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            required
            label='Email'
            fullWidth
            disabled={id !== 'new'}
          />
        )}
      />

      {id == 'new' && (
        <Controller
          name='password'
          rules={{ required: true }}
          control={control}
          render={({ field }) => (
            <TextField {...field} required label='Password' fullWidth />
          )}
        />
      )}

      <Controller
        name='phone'
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label='Phone Number'
            fullWidth
            placeholder='+1234567890'
            error={!!errors.phone}
            helperText={errors?.phone?.message as string}
          />
        )}
      />
      <Controller
        name='contact.address'
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label='Address'
            fullWidth
            error={!!errors.contact?.address}
            helperText={errors?.contact?.address?.message as string}
          />
        )}
      />
      <div className='flex gap-6'>
        <Controller
          name='gender'
          control={control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select {...field} value={field.value || ''} label='Gender'>
                <MenuItem value=''>Not specified</MenuItem>
                <MenuItem value='male'>Male</MenuItem>
                <MenuItem value='female'>Female</MenuItem>
                <MenuItem value='other'>Other</MenuItem>
              </Select>
            </FormControl>
          )}
        />

        <Controller
          name='isActive'
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Switch
                  {...field}
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              }
              label='Active'
            />
          )}
        />
      </div>
      <Controller
        name='dateOfBirth'
        control={control}
        render={({ field }) => (
          <DatePicker
            {...field}
            label='Date of Birth'
            onChange={(date) => field.onChange(moment(date).toDate())}
            value={field.value ? moment(field.value).toDate() : null}
          />
        )}
      />
      <Controller
        name='verified'
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={
              <Switch
                {...field}
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
              />
            }
            label='Email Verified'
          />
        )}
      />
    </div>
  )
}

export default BasicInfoTab
