import { callCloud } from '@/utils/request'

export const listAdminProducts = (data) => callCloud('listAdminProducts', data)
export const createProduct = (data) => callCloud('createProduct', data)
export const updateProduct = (data) => callCloud('updateProduct', data)
export const setProductOnSale = (data) => callCloud('setProductOnSale', data)
export const deleteProduct = (data) => callCloud('deleteProduct', data)
