import { callCloud } from '@/utils/request'

export const getOrder = (orderId) => callCloud('getOrder', { orderId })
export const getOrderList = () => callCloud('getOrderList')
export const getRiderLocation = (orderId) => callCloud('getRiderLocation', { orderId })
