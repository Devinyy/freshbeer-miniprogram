/**
 * Mock 数据层 —— 在未配置 uniCloud 环境时驱动整个小程序独立运行。
 * 真实部署时由 request.js 的 callCloud 切换到云函数。
 */
// ===== 分类 =====
export const categories = [
  { id: 'fresh', name: '精酿生啤', icon: 'beer' },
  { id: 'gin', name: '金汤力', icon: 'card' },
  { id: 'whisky', name: '威士忌', icon: 'beer' },
  { id: 'domestic', name: '国内罐瓶', icon: 'package' },
  { id: 'import', name: '国外罐瓶', icon: 'package' },
  { id: 'snack', name: '小吃', icon: 'ticket' },
  { id: 'soft', name: '无酒精', icon: 'card' },
  { id: 'comp', name: '打碎赔付', icon: 'warning' }
]

// ===== 商品 =====
// tags: cold=冷链 hot=热销 new=新品 flash=秒杀
export const products = [
  {
    id: 'p1',
    categoryId: 'fresh',
    name: '鹅岛 IPA 印度淡色艾尔',
    origin: '美国',
    abv: 5.9,
    ibu: 55,
    volume: '330ml',
    price: 38,
    storagePrice: 35.5,
    tags: ['cold', 'hot'],
    sku: [
      { id: 's1', spec: '330ml', price: 38, storagePrice: 35.5, stock: 50 },
      { id: 's2', spec: '500ml', price: 56, storagePrice: 52.0, stock: 30 }
    ],
    stock: 80,
    flashSale: false,
    desc: '经典美式 IPA，柑橘与松针香气突出，苦度均衡。'
  },
  {
    id: 'p2',
    categoryId: 'fresh',
    name: '福佳白 比利时小麦',
    origin: '比利时',
    abv: 4.9,
    ibu: 12,
    volume: '330ml',
    price: 14,
    storagePrice: 12.0,
    tags: ['cold', 'new'],
    sku: [],
    stock: 120,
    flashSale: false,
    desc: '橙皮与芫荽风味，云雾金黄，清爽易饮。'
  },
  {
    id: 'p3',
    categoryId: 'fresh',
    name: '酿酒狗 朋克 IPA',
    origin: '英国',
    abv: 5.6,
    ibu: 45,
    volume: '330ml',
    price: 42,
    storagePrice: 39.0,
    tags: ['cold'],
    sku: [],
    stock: 0,
    flashSale: false,
    desc: '热带水果与花香，酒花爆炸感十足。'
  },
  {
    id: 'p4',
    categoryId: 'fresh',
    name: '京A 工人淡色艾尔',
    origin: '中国·北京',
    abv: 4.5,
    ibu: 30,
    volume: '330ml',
    price: 28,
    storagePrice: 25.5,
    tags: ['cold', 'hot'],
    sku: [],
    stock: 90,
    flashSale: false,
    desc: '本土精酿代表，麦芽甜香配轻盈酒花。'
  },
  {
    id: 'p5',
    categoryId: 'gin',
    name: '经典金汤力 Gin Tonic',
    origin: '英国',
    abv: 8.0,
    volume: '330ml',
    price: 45,
    storagePrice: 42.0,
    tags: ['cold'],
    sku: [
      { id: 's1', spec: '标准', price: 45, storagePrice: 42.0, stock: 40 },
      { id: 's2', spec: '加量', price: 68, storagePrice: 63.0, stock: 20 }
    ],
    stock: 60,
    flashSale: false,
    desc: '伦敦干金酒配汤力水与青柠，气泡清爽。'
  },
  {
    id: 'p6',
    categoryId: 'whisky',
    name: '杰克丹尼 田纳西威士忌',
    origin: '美国',
    abv: 40.0,
    volume: '700ml',
    price: 198,
    storagePrice: 188.0,
    tags: ['hot'],
    sku: [],
    stock: 30,
    flashSale: false,
    desc: '焦糖与香草，顺滑醇厚，威士忌入门首选。'
  },
  {
    id: 'p7',
    categoryId: 'whisky',
    name: '山崎 12 年单一麦芽',
    origin: '日本',
    abv: 43.0,
    volume: '700ml',
    price: 880,
    storagePrice: 850.0,
    tags: ['new'],
    sku: [],
    stock: 8,
    flashSale: false,
    desc: '果香与木桶交织，日威典范之作。'
  },
  {
    id: 'p8',
    categoryId: 'domestic',
    name: '青岛白啤 小麦啤酒',
    origin: '中国·青岛',
    abv: 4.1,
    volume: '500ml',
    price: 12,
    storagePrice: 10.5,
    tags: ['cold'],
    sku: [],
    stock: 200,
    flashSale: false,
    desc: '国内经典白啤，麦芽香柔和，泡沫细腻。'
  },
  {
    id: 'p9',
    categoryId: 'domestic',
    name: '泰山 原浆 7 天鲜啤',
    origin: '中国·泰安',
    abv: 3.8,
    volume: '1L',
    price: 22,
    storagePrice: 19.9,
    tags: ['cold', 'hot'],
    sku: [],
    stock: 70,
    flashSale: false,
    desc: '未杀菌原浆，7 天保质期，极致新鲜。'
  },
  {
    id: 'p10',
    categoryId: 'import',
    name: '罗斯福 10 号 修道院四料',
    origin: '比利时',
    abv: 11.3,
    volume: '330ml',
    price: 58,
    storagePrice: 54.0,
    tags: ['hot'],
    sku: [],
    stock: 40,
    flashSale: false,
    desc: '深色四料，葡萄干与焦糖，层次磅礴。'
  },
  {
    id: 'p11',
    categoryId: 'import',
    name: '角鲨头 90 分钟 IPA',
    origin: '美国',
    abv: 9.0,
    volume: '355ml',
    price: 78,
    storagePrice: 72.0,
    tags: ['new'],
    sku: [],
    stock: 25,
    flashSale: false,
    desc: '连续熬煮 90 分钟，酒花炸弹，烈性 IPA。'
  },
  {
    id: 'p12',
    categoryId: 'snack',
    name: '孜然风味牛肉干',
    origin: '中国',
    abv: 0,
    volume: '100g',
    price: 26,
    storagePrice: 24.0,
    tags: [],
    sku: [],
    stock: 150,
    flashSale: false,
    desc: '下酒必备，嚼劲十足，越嚼越香。'
  },
  {
    id: 'p13',
    categoryId: 'snack',
    name: '麻辣花生毛豆拼盘',
    origin: '中国',
    abv: 0,
    volume: '200g',
    price: 18,
    storagePrice: 16.0,
    tags: ['new'],
    sku: [],
    stock: 120,
    flashSale: false,
    desc: '经典佐酒小食，麻辣鲜香。'
  },
  {
    id: 'p14',
    categoryId: 'soft',
    name: '鲜榨橙汁（无酒精）',
    origin: '中国',
    abv: 0,
    volume: '300ml',
    price: 16,
    storagePrice: 14.5,
    tags: ['cold'],
    sku: [],
    stock: 100,
    flashSale: false,
    desc: '100% 鲜榨，代驾与不胜酒力者的友好选择。'
  },
  {
    id: 'p15',
    categoryId: 'comp',
    name: '精美啤酒杯（破损赔付）',
    origin: '官方',
    abv: 0,
    volume: '500ml',
    price: 39,
    storagePrice: 36.0,
    tags: ['new'],
    sku: [],
    stock: 999,
    flashSale: false,
    desc: '配送途中如破损，拍照即赔，安心享受。'
  },
  {
    id: 'p16',
    categoryId: 'fresh',
    name: '限时秒杀 林德曼 桃子',
    origin: '比利时',
    abv: 2.5,
    volume: '250ml',
    price: 49,
    storagePrice: 45.0,
    tags: ['flash'],
    sku: [],
    stock: 20,
    flashSale: true,
    flashPrice: 29,
    flashEndAt: Date.now() + 3600 * 1000,
    desc: '果味兰比克，粉红泡沫，秒杀价限时抢。'
  }
]

// ===== 多规格（容量 / 包装 / 温度）=====
// delta 为在基础价上的加价，最终价 = 基础价 + Σ 选中项 delta；储值价同步加价。
const beerSpecGroups = [
  {
    key: 'volume',
    title: '容量',
    options: [
      { label: '330ml', delta: 0 },
      { label: '500ml', delta: 18 },
      { label: '1L 桶', delta: 52 }
    ]
  },
  {
    key: 'pack',
    title: '包装',
    options: [
      { label: '单瓶', delta: 0 },
      { label: '精装礼盒', delta: 12 }
    ]
  },
  {
    key: 'temp',
    title: '温度',
    options: [
      { label: '冰镇 4℃', delta: 0 },
      { label: '常温', delta: 0 }
    ]
  }
]
const ginSpecGroups = [
  {
    key: 'size',
    title: '规格',
    options: [
      { label: '标准', delta: 0 },
      { label: '加量', delta: 23 }
    ]
  },
  {
    key: 'temp',
    title: '温度',
    options: [
      { label: '冰镇 4℃', delta: 0 },
      { label: '常温', delta: 0 }
    ]
  }
]

// 挂载多规格到指定商品，并移除旧的一维 sku
;['p1', 'p2', 'p4', 'p9'].forEach((id) => {
  const p = products.find((x) => x.id === id)
  if (p) {
    p.specGroups = beerSpecGroups
    p.sku = []
  }
})
{
  const p = products.find((x) => x.id === 'p5')
  if (p) {
    p.specGroups = ginSpecGroups
    p.sku = []
  }
}

// ===== 8 项参数字段补全 =====
const styleMap = {
  fresh: '精酿生啤',
  gin: '预调鸡尾酒',
  whisky: '威士忌',
  domestic: '工业拉格',
  import: '进口精酿',
  snack: '佐酒小食',
  soft: '无酒精饮品',
  comp: '周边商品'
}
products.forEach((p) => {
  p.brand = p.brand || p.name.split(' ')[0]
  p.style = p.style || styleMap[p.categoryId] || '精酿'
  p.shelfLife = p.shelfLife || (p.tags && p.tags.includes('cold') ? '7 天（冷藏）' : '12 个月')
  p.serveTemp = p.serveTemp || (p.categoryId === 'whisky' ? '常温' : '4-8℃')
})

// ===== 默认评价 =====
const defaultReviews = [
  { user: '酒**客', avatar: '酒', rating: 5, date: '2026-07-18', text: '冰镇后口感一流，泡沫细腻绵密，骑手还带了冰袋，全程冷链没得说！', imgs: true },
  { user: '微**醺', avatar: '微', rating: 5, date: '2026-07-15', text: '新鲜度拉满，喝惯了这家真回不去了，下单半小时就到。', imgs: false },
  { user: '麦**芽', avatar: '麦', rating: 4, date: '2026-07-10', text: '味道不错，就是原价略贵，开了储值卡用专享价划算多了。', imgs: false }
]
function buildReviews() {
  return { avg: 4.8, count: 128, goodRate: 98, list: defaultReviews }
}
function buildRecommend(product) {
  if (!product) return []
  return products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4)
    .concat(products.filter((p) => p.categoryId !== product.categoryId).slice(0, 2))
    .slice(0, 4)
}

// ===== 地址 Mock =====
export const mockAddresses = [
  {
    id: 'a1',
    name: '张先生',
    phone: '138****8888',
    tag: '家',
    detail: '上海市徐汇区漕溪北路 100 号 阳光公寓 8 楼 802',
    lng: 121.443,
    lat: 31.186,
    isDefault: true
  }
]

// ===== 订单 Mock（运行时生成）=====
const orders = []

export function resetMockState() {
  orders.length = 0
}

function findProduct(id) {
  return products.find((p) => p.id === id) || null
}

const ADMIN_PHONE = '15024568821'

function assertAdmin(data) {
  if (data.phone !== ADMIN_PHONE) throw new Error('无管理权限')
}

function normalizeProduct(product) {
  if (!product || !String(product.name || '').trim()) throw new Error('请填写商品名称')
  if (!product.categoryId) throw new Error('请选择商品分类')
  if (!Number.isFinite(Number(product.price)) || Number(product.price) < 0) throw new Error('商品价格不正确')
  if (!Number.isFinite(Number(product.stock)) || Number(product.stock) < 0) throw new Error('库存不正确')
  return {
    ...product,
    name: String(product.name).trim(),
    price: Number(product.price),
    stock: Number(product.stock),
    storagePrice: Number(product.storagePrice || product.price),
    tags: Array.isArray(product.tags) ? product.tags : [],
    onSale: product.onSale !== false,
    flashSale: !!product.flashSale
  }
}

function createProductMock(data) {
  assertAdmin(data)
  const product = normalizeProduct(data.product)
  product.id = 'p_admin_' + Date.now()
  products.unshift(product)
  return { product }
}

function updateProductMock(data) {
  assertAdmin(data)
  const product = findProduct(data.id)
  if (!product) throw new Error('商品不存在')
  Object.assign(product, normalizeProduct({ ...product, ...(data.patch || {}) }))
  return { product }
}

function setProductOnSaleMock(data) {
  assertAdmin(data)
  const product = findProduct(data.id)
  if (!product) throw new Error('商品不存在')
  product.onSale = !!data.onSale
  return { product }
}

function deleteProductMock(data) {
  assertAdmin(data)
  const product = findProduct(data.id)
  if (!product) throw new Error('商品不存在')
  product.onSale = false
  product.deletedAt = Date.now()
  return { product }
}

function calcDeliveryFee(address) {
  // 阶梯计费：基础 5 元，距离 > 3km 加 2 元
  return 5
}

function createOrderMock(data) {
  const now = Date.now()
  const items = data.items.map((it) => {
    const p = findProduct(it.productId)
    return {
      productId: it.productId,
      name: p.name,
      price: it.price,
      qty: it.qty,
      spec: it.spec || ''
    }
  })
  const goodsAmount = items.reduce((a, b) => a + b.price * b.qty, 0)
  const deliveryFee = calcDeliveryFee(data.address)
  const discount = data.discount || 0
  const payable = goodsAmount + deliveryFee - discount
  const order = {
    orderId: 'FB' + now.toString().slice(-10),
    status: 'pending_pay', // pending_pay / preparing / delivering / done / cancelled
    items,
    address: data.address,
    deliveryType: data.deliveryType || 'immediate',
    deliveryTime: data.deliveryTime || '',
    remark: data.remark || '',
    couponId: data.couponId || '',
    goodsAmount,
    deliveryFee,
    discount,
    payable,
    createdAt: now,
    rider: null,
    refundStatus: ''
  }
  orders.push(order)
  return { order }
}

function payOrderMock(data) {
  const order = orders.find((o) => o.orderId === data.orderId)
  if (!order) throw new Error('订单不存在')
  if (order.status !== 'pending_pay') {
    return { order, payParams: null }
  }
  order.status = 'preparing'
  order.paidAt = Date.now()
  order.payMethod = data.method || 'wechat'
  // 模拟骑手接单
  order.rider = {
    name: '王师傅',
    phone: '139****6666',
    lng: 121.43,
    lat: 31.18,
    plate: '沪A·鲜啤01'
  }
  // 返回微信支付 prepay 参数（真实场景由云函数向微信统一下单获取）
  return {
    order,
    payParams: {
      timeStamp: String(Math.floor(Date.now() / 1000)),
      nonceStr: 'mockNonce' + Math.random().toString(36).slice(2, 10),
      package: 'prepay_id=mock_prepay_' + order.orderId,
      signType: 'RSA',
      paySign: 'mockSign'
    }
  }
}

function refundOrderMock(data) {
  const order = orders.find((o) => o.orderId === data.orderId)
  if (!order) throw new Error('订单不存在')
  if (order.refundStatus === 'pending') throw new Error('退款申请处理中')
  if (order.refundStatus === 'approved' || order.status === 'refunded') {
    throw new Error('订单已退款')
  }
  if (!['preparing', 'delivering', 'done'].includes(order.status)) {
    throw new Error('当前订单状态不可退款')
  }
  order.status = 'refund_pending'
  order.refundStatus = 'pending'
  order.refundReason = data.reason || '用户申请退款'
  order.refundAmount = Number(data.amount || order.payable)
  order.refundRequestedAt = Date.now()
  return { order }
}

function getRiderLocationMock(orderId) {
  const order = orders.find((o) => o.orderId === orderId)
  if (!order || !order.rider) return { rider: null, eta: 0 }
  // 模拟骑手向用户移动
  const base = order.rider
  const lat = base.lat + (Math.random() - 0.5) * 0.002
  const lng = base.lng + (Math.random() - 0.5) * 0.002
  const eta = Math.floor(8 + Math.random() * 6) // 8-14 分钟
  return {
    rider: {
      ...base,
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6))
    },
    eta
  }
}

// ===== Mock 路由（对应云函数名）=====
export function mockRouter(name, data = {}) {
  switch (name) {
    case 'login':
      {
        const phone = data.phone || ''
        const role = phone === ADMIN_PHONE ? 'admin' : 'user'
      return {
        token: 'mock-token-' + Date.now(),
        user: { id: 'u1', openid: data.openid || 'mock-openid', phone, role, nickname: role === 'admin' ? '管理员' : '鲜啤用户', avatar: '' }
      }
      }
    case 'decryptPhone':
      // 仅开发 Mock：模拟已通过 getPhoneNumber 的管理员手机号；生产环境由云函数换取真实号码。
      return {
        token: 'mock-token-' + Date.now(),
        user: { id: 'u1', openid: data.openid || 'mock-openid', phone: ADMIN_PHONE, role: 'admin', nickname: '管理员', avatar: '' }
      }
    case 'getProducts':
      return {
        categories,
        products: data.categoryId ? products.filter((p) => p.categoryId === data.categoryId) : products
      }
    case 'getProduct': {
      const product = findProduct(data.id)
      return {
        product,
        reviews: buildReviews(),
        recommend: buildRecommend(product)
      }
    }
    case 'getAddresses':
      return { addresses: mockAddresses }
    case 'createOrder':
      return createOrderMock(data)
    case 'payOrder':
      return payOrderMock(data)
    case 'refundOrder':
      return refundOrderMock(data)
    case 'getOrder':
      return { order: orders.find((o) => o.orderId === data.orderId) || null }
    case 'getOrderList':
      return { orders: orders.slice().reverse() }
    case 'getRiderLocation':
      return getRiderLocationMock(data.orderId)
    case 'listAdminProducts':
      assertAdmin(data)
      return { products: products.filter((product) => !product.deletedAt) }
    case 'createProduct':
      return createProductMock(data)
    case 'updateProduct':
      return updateProductMock(data)
    case 'setProductOnSale':
      return setProductOnSaleMock(data)
    case 'deleteProduct':
      return deleteProductMock(data)
    default:
      return { code: 0, msg: 'ok' }
  }
}
