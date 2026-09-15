import { callCloud } from '@/utils/request'

export const refundOrder = (data) => callCloud('refundOrder', data)
