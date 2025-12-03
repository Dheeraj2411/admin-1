/* eslint-disable react/no-unstable-nested-components */
import { useMemo } from 'react'
import { type MRT_ColumnDef } from 'material-react-table'
import DataTable from 'src/components/data-table/DataTable'
import FuseLoading from '@fuse/core/FuseLoading'
import { Chip, ListItemIcon, MenuItem, Paper } from '@mui/material'
import * as React from 'react'
import _ from 'lodash'
import FuseSvgIcon from '@fuse/core/FuseSvgIcon'
import Link from '@fuse/core/Link'
import Typography from '@mui/material/Typography'
import clsx from 'clsx'
import Button from '@mui/material/Button'
import tokenService from '@/utils/tokenService'

function UsersTable() {
  const [users, setUsers] = React.useState([])
  const [isLoading, setIsLoading] = React.useState(true)

  console.log(users, 'users')
  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const response = await tokenService.makeAuthenticatedRequest(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users?limit=1000`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      const data = await response.json()

      console.log('API Response:', data)

      if (data.success && data.data) {
        setUsers(data.data)
      } else {
        console.error('API Error:', data.message || 'Failed to fetch users')
        setUsers([])
      }
    } catch (error) {
      console.error('Fetch Error:', error)
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  const deleteUser = async (ids) => {
    try {
      const response = await tokenService.makeAuthenticatedRequest(
        `${process.env.NEXT_PUBLIC_API_URL}/user/delete-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ids: typeof ids === 'string' ? [ids] : ids,
          }),
        }
      )

      const data = await response.json()

      if (data.success) {
        console.log('Delete successful:', data.message)
        fetchUsers() // Refresh the list
      } else {
        console.error('Delete failed:', data.message)
      }
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  React.useEffect(() => {
    fetchUsers()
  }, [])

  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      // {
      //   accessorFn: (row) => row.profileImage,
      //   id: 'profileImage',
      //   header: '',
      //   enableColumnFilter: false,
      //   enableColumnDragging: false,
      //   size: 64,
      //   enableSorting: false,
      //   Cell: ({ row }) => (
      //     <div className='flex items-center justify-center'>
      //       {row.original?.profileImage?.length > 0 ? (
      //         <img
      //           className='w-full max-h-36 max-w-36 block rounded'
      //           src={
      //             _.find(row.original.profileImage, {
      //               id: row.original.id,
      //             })?.url
      //           }
      //           alt={row.original.name}
      //         />
      //       ) : (
      //         <img
      //           className='w-full max-h-36 max-w-36 block rounded'
      //           src='/assets/images/apps/ecommerce/product-image-placeholder.png'
      //           alt={row.original.name}
      //         />
      //       )}
      //     </div>
      //   ),
      // },
      {
        accessorKey: 'name',
        header: 'Name',
        Cell: ({ row }) => (
          <Typography
            component={Link}
            to={`/apps/users/${row.original.id}`}
            role='button'
          >
            <u>{row.original.name}</u>
          </Typography>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        accessorFn: (row) => `${row.email}`,
      },
      {
        accessorKey: 'role',
        header: 'Role',
        accessorFn: (row) => (
          <div className='flex flex-wrap space-x-2'>
            <Chip
              key={row.role}
              className='text-sm'
              size='small'
              color={row.role === 'admin' ? 'info' : 'default'}
              label={row.role?.toUpperCase()}
            />
          </div>
        ),
      },
      {
        accessorKey: 'phone',
        header: 'Phone',
        accessorFn: (row) => row.phone || '-',
      },
      {
        accessorKey: 'gender',
        header: 'Gender',
        accessorFn: (row) => `${row.gender || '-'}`,
      },
      // {
      //   accessorKey: 'address',
      //   header: 'Address',
      //   accessorFn: (row) => `${row.address}`,
      // },
      // {
      //   accessorKey: 'location',
      //   header: 'Location',
      //   accessorFn: (row) => `${row.location}`,
      // },
      // {
      //   accessorKey: 'postCode',
      //   header: 'Postal Code',
      //   accessorFn: (row) => `${row.postCode}`,
      // },
      // {
      //   accessorKey: 'dateOfBirth',
      //   header: 'Date of Birth',
      //   accessorFn: (row) => `${row.dateOfBirth}`,
      // },
      // {
      //   accessorKey: 'quantity',
      //   header: 'Quantity',
      //   accessorFn: (row) => (
      //     <div className='flex items-center space-x-8'>
      //       <span>{row.quantity}</span>
      //       <i
      //         className={clsx(
      //           'inline-block w-8 h-8 rounded',
      //           row.quantity <= 5 && 'bg-red',
      //           row.quantity > 5 && row.quantity <= 25 && 'bg-orange',
      //           row.quantity > 25 && 'bg-green'
      //         )}
      //       />
      //     </div>
      //   ),
      // },
      {
        accessorKey: 'verified',
        header: 'Verified',
        accessorFn: (row) => (
          <div className='flex items-center'>
            {row.verified ? (
              <FuseSvgIcon className='text-green' size={20}>
                heroicons-outline:check-circle
              </FuseSvgIcon>
            ) : (
              <FuseSvgIcon className='text-red' size={20}>
                heroicons-outline:minus-circle
              </FuseSvgIcon>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'isActive',
        header: 'Active',
        accessorFn: (row) => (
          <div className='flex items-center'>
            {row.isActive ? (
              <FuseSvgIcon className='text-green' size={20}>
                heroicons-outline:check-circle
              </FuseSvgIcon>
            ) : (
              <FuseSvgIcon className='text-red' size={20}>
                heroicons-outline:minus-circle
              </FuseSvgIcon>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        accessorFn: (row) =>
          row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-',
      },
      {
        accessorKey: 'lastLogin',
        header: 'Last Login',
        accessorFn: (row) =>
          row.lastLogin
            ? new Date(row.lastLogin).toLocaleDateString()
            : 'Never',
      },
    ],
    []
  )

  if (isLoading) {
    return <FuseLoading />
  }

  return (
    <Paper
      className='flex flex-col flex-auto shadow-1 rounded-t-lg overflow-hidden rounded-b-0 w-full h-full'
      elevation={0}
    >
      <DataTable
        data={users}
        columns={columns}
        selectAllMode={'all'}
        // enableRowSelection={false}
        // enableRowActions={false}
        renderRowActionMenuItems={({ closeMenu, row, table }) => [
          <MenuItem
            key={0}
            onClick={async () => {
              await deleteUser([row.original.id])
              closeMenu()
              table.resetRowSelection()
            }}
          >
            <ListItemIcon>
              <FuseSvgIcon>heroicons-outline:trash</FuseSvgIcon>
            </ListItemIcon>
            Delete
          </MenuItem>,
        ]}
        renderTopToolbarCustomActions={({ table }) => {
          const { rowSelection } = table.getState()

          if (Object.keys(rowSelection).length === 0) {
            return null
          }

          return (
            <Button
              variant='contained'
              size='small'
              onClick={async () => {
                const selectedRows = table.getSelectedRowModel().rows
                await deleteUser(selectedRows?.map((row) => row.original.id))
                table.resetRowSelection()
              }}
              className='flex shrink min-w-36 ltr:mr-8 rtl:ml-8'
              color='secondary'
            >
              <FuseSvgIcon size={16}>heroicons-outline:trash</FuseSvgIcon>
              <span className='hidden sm:flex mx-8'>Delete selected items</span>
            </Button>
          )
        }}
      />
    </Paper>
  )
}

export default UsersTable
