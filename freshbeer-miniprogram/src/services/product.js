import { callCloud } from '@/utils/request'

export const getProducts = (categoryId) => callCloud('getProducts', { categoryId })
export const getProduct = (id) => callCloud('getProduct', { id })
export const getAddresses = () => callCloud('getAddresses')
