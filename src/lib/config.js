export const BRAND = {
  name: 'Dariy Bloom',
  instagramHandle: '@dariy_bloom',
  instagramUrl: 'https://www.instagram.com/dariy_bloom/',
  tagline: 'Comfortable. Trendy. Elegant.',
  bio: 'African print outfits for modern women. Occasional & casual sophistication. For confident queens 👑',
  email: 'hello@dariybloom.com',
  phone: '+234 800 000 0000',
}

/** Dummy bank details shown for the "Bank Transfer" payment option. */
export const BANK_DETAILS = {
  bankName: 'Bloom Trust Bank',
  accountName: 'Dariy Bloom Fashion Ltd',
  accountNumber: '0123456789',
}

/** Flat delivery fee in naira. Set to 0 for free delivery. */
export const DELIVERY_FEE = 3500
/** Orders at or above this subtotal ship free. */
export const FREE_DELIVERY_THRESHOLD = 60000

export const deliveryFeeFor = (subtotal) =>
  subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE

export const PAYMENT_METHODS = {
  bank_transfer: 'Bank Transfer',
  pay_on_delivery: 'Pay on Delivery',
}
