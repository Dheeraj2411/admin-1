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
    </div>
  )
}

export default BasicInfoTab
