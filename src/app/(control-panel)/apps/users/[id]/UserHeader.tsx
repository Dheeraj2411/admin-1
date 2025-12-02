import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { motion } from 'framer-motion'
import { useFormContext } from 'react-hook-form'
import { useParams } from 'next/navigation'
import _ from 'lodash'
import FuseSvgIcon from '@fuse/core/FuseSvgIcon'
import PageBreadcrumb from 'src/components/PageBreadcrumb'
import useNavigate from '@fuse/hooks/useNavigate'
import moment from 'moment'
import tokenService from '@/utils/tokenService'

/**
 * The product header.
 */
function UserHeader() {
  const routeParams = useParams<{ id: string }>()
  const { id } = routeParams

  const methods = useFormContext()
  const { formState, watch, getValues } = methods
  const { isValid, dirtyFields } = formState

  const navigate = useNavigate()

  async function handleSaveUser() {
    try {
      const payload = {
        name: getValues().name,
        email: getValues().email,
        phone: getValues().phone,
        role: getValues().role || 'customer',
        gender: getValues().gender,
        dateOfBirth: getValues().dateOfBirth
          ? moment(getValues().dateOfBirth, 'MM/DD/YYYY')
          : null,
        address: getValues('contact.address'),
        verified: getValues().isEmailVerified || false,
        isActive: getValues().isActive !== false,
      }

      const response = await tokenService.makeAuthenticatedRequest(
        `${process.env.NEXT_PUBLIC_API_URL}/user/update-user/${getValues().id}`,
        {
          method: 'PUT',
          body: JSON.stringify(payload),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      const data = await response.json()

      if (data.success) {
        console.log('User updated successfully:', data.message)
        // Optionally show success message or redirect
      } else {
        console.error('Update failed:', data.message)
      }
    } catch (error) {
      console.error('Update error:', error)
    }
  }

  async function handleCreateUser() {
    try {
      const payload = {
        name: getValues().name,
        email: getValues().email,
        phone: getValues().phone,
        password: getValues().password || 'TempPass123!', // Default password for admin-created users
        role: getValues().role || 'customer',
        gender: getValues().gender,
        dateOfBirth: getValues().dateOfBirth
          ? moment(getValues().dateOfBirth, 'MM/DD/YYYY')
          : null,
        address: getValues('contact.address'),
        verified: getValues().isEmailVerified || true, // Admin-created users are verified by default
        isActive: getValues().isActive !== false,
      }

      const response = await tokenService.makeAuthenticatedRequest(
        `${process.env.NEXT_PUBLIC_API_URL}/user/update-user/new`,
        {
          method: 'PUT',
          body: JSON.stringify(payload),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      const data = await response.json()

      if (data.success) {
        console.log('User created successfully:', data.message)
        // Navigate to the new user's page or back to users list
        navigate(`/apps/users/${data.data.id}`)
      } else {
        console.error('Creation failed:', data.message)
      }
    } catch (error) {
      console.error('Creation error:', error)
    }
  }

  // function handleRemoveUser() {
  //   removeUser(id)
  //   navigate('/apps/users')
  // }

  return (
    <div className='flex flex-col sm:flex-row flex-1 w-full items-center justify-between space-y-8 sm:space-y-0 py-24 sm:py-32'>
      <div className='flex flex-col items-start space-y-8 sm:space-y-0 w-full sm:max-w-full min-w-0'>
        <motion.div
          initial={{
            x: 20,
            opacity: 0,
          }}
          animate={{
            x: 0,
            opacity: 1,
            transition: { delay: 0.3 },
          }}
        >
          <PageBreadcrumb className='mb-8' />
        </motion.div>

        <div className='flex items-center max-w-full space-x-12'>
          {/* <motion.div
            className='hidden sm:flex'
            initial={{ scale: 0 }}
            animate={{ scale: 1, transition: { delay: 0.3 } }}
          >
            {images && images.length > 0 && featuredImageId ? (
              <img
                className='w-32 sm:w-48 rounded'
                src={_.find(images, { id: featuredImageId })?.url}
                alt={name}
              />
            ) : (
              <img
                className='w-32 sm:w-48 rounded'
                src='/assets/images/apps/ecommerce/product-image-placeholder.png'
                alt={name}
              />
            )}
          </motion.div> */}
          <motion.div
            className='flex flex-col min-w-0'
            initial={{ x: -20 }}
            animate={{ x: 0, transition: { delay: 0.3 } }}
          >
            <Typography className='text-15 sm:text-2xl truncate font-semibold'>
              {getValues().name || 'New User'}
            </Typography>
            <Typography variant='caption' className='font-medium'>
              User Detail
            </Typography>
          </motion.div>
        </div>
      </div>
      <motion.div
        className='flex flex-1 w-full'
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0, transition: { delay: 0.3 } }}
      >
        {id !== 'new' ? (
          <>
            {/* <Button
              className='whitespace-nowrap mx-4'
              variant='contained'
              color='secondary'
              onClick={handleRemoveUser}
              startIcon={
                <FuseSvgIcon className='hidden sm:flex'>
                  heroicons-outline:trash
                </FuseSvgIcon>
              }
            >
              Remove
            </Button> */}
            <Button
              className='whitespace-nowrap mx-4'
              variant='contained'
              color='secondary'
              disabled={_.isEmpty(dirtyFields) || !isValid}
              onClick={handleSaveUser}
            >
              Save
            </Button>
          </>
        ) : (
          <Button
            className='whitespace-nowrap mx-4'
            variant='contained'
            color='secondary'
            disabled={_.isEmpty(dirtyFields) || !isValid}
            onClick={handleCreateUser}
          >
            Add
          </Button>
        )}
      </motion.div>
    </div>
  )
}

export default UserHeader
