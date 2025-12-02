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
import toast from 'react-hot-toast'

function CategoriesTable() {
  const [categories, setCategories] = React.useState([])
  const [isLoading, setIsLoading] = React.useState(true)

  const fetchCategories = async () => {
    setIsLoading(true)
    const token = localStorage.getItem('token')
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/categories`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    )
    const data = await response.json()
    setCategories(data.data)
    setIsLoading(false)
  }

  const deleteUser = async (ids) => {
    const token = localStorage.getItem('token')
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/categories/delete-category`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ids: typeof ids === 'string' ? [ids] : ids,
        }),
      }
    )

    const data = await response.json()
    if (data?.success) {
      fetchCategories()
      toast.success(data.message)
    } else {
      toast.error(data.message)
    }
  }

  React.useEffect(() => {
    fetchCategories()
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
            to={`/apps/categories/${row.original.id}`}
            role='button'
          >
            <u>{row.original.name}</u>
          </Typography>
        ),
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
        data={categories}
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

export default CategoriesTable
