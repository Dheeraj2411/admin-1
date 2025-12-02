import _ from 'lodash'
import { PartialDeep } from 'type-fest'
import { EcommerceProduct } from '../../e-commerce/ECommerceApi'

/**
 * The product model.
 */
const UserModel = (data: PartialDeep<EcommerceProduct>) =>
  _.defaults(data || {}, {
    name: '',
    email: '',
  })

export default UserModel
