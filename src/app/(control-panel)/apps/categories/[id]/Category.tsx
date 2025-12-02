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
import CategoryHeader from './CategoryHeader'
import BasicInfoTab from './tabs/BasicInfoTab'
import CategoryModel from '../models/CategoryModel'

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
function Category() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'))

  const routeParams = useParams()

  const { id } = routeParams

  const [user, setCategory] = React.useState(null)
  const [isLoading, setIsLoading] = React.useState(false)

  const fetchCategoryDetails = async () => {
    setIsLoading(true)
    const token = localStorage.getItem('token')
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    )
    const data = await response.json()
    setCategory(data.data)
    setIsLoading(false)
  }

  React.useEffect(() => {
    if (id === 'new') return
    fetchCategoryDetails()
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
      reset(CategoryModel({}))
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
   * Show Message if the requested categories is not exists
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
  //         to='/apps/e-commerce/categories'
  //         color='inherit'
  //       >
  //         Go to categories Page
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
        header={<CategoryHeader />}
        content={
          <div className='p-16 sm:p-24 space-y-24'>
            <FuseTabs value={tabValue} onChange={handleTabChange}>
              <FuseTab value='basic-info' label='Basic Info' />
              {/* <FuseTab value='user-images' label='Category Images' />
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

export default Category
