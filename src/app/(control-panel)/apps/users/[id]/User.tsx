'use client'

import FuseLoading from '@fuse/core/FuseLoading'
import FusePageCarded from '@fuse/core/FusePageCarded'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { motion } from 'framer-motion'
import { SyntheticEvent, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from '@fuse/core/Link'
import _ from 'lodash'
import { FormProvider, useForm } from 'react-hook-form'
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery'
import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import FuseTabs from 'src/components/tabs/FuseTabs'
import FuseTab from 'src/components/tabs/FuseTab'
import UserHeader from './UserHeader'
import BasicInfoTab from './tabs/BasicInfoTab'
import UserModel from '../models/UserModel'
import tokenService from '@/utils/tokenService'

/**
 * Form Validation Schema
 */
const schema = z.object({
  name: z
    .string()
    .nonempty('You must enter a name')
    .min(3, 'The name must be at least 3 characters'),
})

/**
 * The user page.
 */
function User() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'))

  const routeParams = useParams()

  const { id } = routeParams

  const [user, setUser] = React.useState(null)
  const [isLoading, setIsLoading] = React.useState(false)

  const fetchUserDetails = async () => {
    setIsLoading(true)
    try {
      const response = await tokenService.makeAuthenticatedRequest(
        `${process.env.NEXT_PUBLIC_API_URL}/user/get-user/${id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      const data = await response.json()

      console.log('User API Response:', data)

      if (data.success && data.data) {
        setUser(data.data)
      } else {
        console.error('API Error:', data.message || 'Failed to fetch user')
        setUser(null)
      }
    } catch (error) {
      console.error('Fetch Error:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    if (id === 'new') return
    fetchUserDetails()
  }, [])

  const [tabValue, setTabValue] = useState('basic-info')

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {},
    resolver: zodResolver(schema),
  })

  const { reset, watch } = methods

  const form = watch()

  useEffect(() => {
    if (id === 'new') {
      reset(UserModel({}))
    }
  }, [id, reset])

  useEffect(() => {
    if (user) {
      reset({ ...user })
    }
  }, [user, reset])

  /**
   * Tab Change
   */
  function handleTabChange(event: SyntheticEvent, value: string) {
    setTabValue(value)
  }

  if (isLoading) {
    return <FuseLoading />
  }

  /**
   * Show Message if the requested users is not exists
   */
  // if (isError && id !== 'new') {
  //   return (
  //     <motion.div
  //       initial={{ opacity: 0 }}
  //       animate={{ opacity: 1, transition: { delay: 0.1 } }}
  //       className='flex flex-col flex-1 items-center justify-center h-full'
  //     >
  //       <Typography color='text.secondary' variant='h5'>
  //         There is no such user!
  //       </Typography>
  //       <Button
  //         className='mt-24'
  //         component={Link}
  //         variant='outlined'
  //         to='/apps/e-commerce/users'
  //         color='inherit'
  //       >
  //         Go to Users Page
  //       </Button>
  //     </motion.div>
  //   )
  // }

  /**
   * Wait while user data is loading and form is setted
   */
  // if (
  //   _.isEmpty(form) ||
  //   (user && routeParams.id !== user.id && routeParams.id !== 'new')
  // ) {
  //   return <FuseLoading />
  // }

  return (
    <FormProvider {...methods}>
      <FusePageCarded
        header={<UserHeader />}
        content={
          <div className='p-16 sm:p-24 space-y-24'>
            <FuseTabs value={tabValue} onChange={handleTabChange}>
              <FuseTab value='basic-info' label='Basic Info' />
              {/* <FuseTab value='user-images' label='User Images' />
              <FuseTab value='pricing' label='Pricing' />
              <FuseTab value='inventory' label='Inventory' />
              <FuseTab value='shipping' label='Shipping' /> */}
            </FuseTabs>
            <div className=''>
              <div className={tabValue !== 'basic-info' ? 'hidden' : ''}>
                <BasicInfoTab id={id} />
              </div>
            </div>
          </div>
        }
        scroll={isMobile ? 'normal' : 'content'}
      />
    </FormProvider>
  )
}

export default User
