import _ from 'lodash'
import { PartialDeep } from 'type-fest'

/**
 * The product model.
 */
const CategoryModel = (data: PartialDeep<any>) =>
  _.defaults(data || {}, {
    name: '',
    email: '',
  })

export default CategoryModel
