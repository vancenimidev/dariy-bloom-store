/**
 * Hardcoded starter catalogue.
 *
 * Images live in `public/images/` and are served from `/images/...`.
 * Drop your photos in using the exact filenames below and they will show up
 * automatically; until then a branded placeholder is rendered instead.
 */
export const products = [
  {
    id: 'nimi-bubble-pants',
    slug: 'nimi-bubble-pants',
    name: 'Nimi Bubble Pants',
    price: 20000,
    category: 'Casual',
    tagline: 'Playful volume, effortless ease.',
    description:
      'Our signature bubble pants cut from vibrant African print cotton. A high, comfortable waist and a softly gathered ankle create that statement silhouette — dress them up with heels or keep it easy with flats.',
    details: [
      '100% African print cotton',
      'High waist with concealed elastic back',
      'Side seam pockets',
      'Gathered bubble hem at the ankle',
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: [
      '/images/nimi-bubble-pants-1.jpg',
      '/images/nimi-bubble-pants-2.jpg',
      '/images/nimi-bubble-pants-3.jpg',
    ],
    badge: 'Bestseller',
  },
  {
    id: 'nonye-two-piece-corporate-set',
    slug: 'nonye-two-piece-corporate-set',
    name: 'Nonye Two-Piece Corporate Set',
    price: 30000,
    category: 'Occasion',
    tagline: 'Boardroom-ready, culture-proud.',
    description:
      'A tailored two-piece that brings African print into the office with confidence. A structured top and polished trousers that move from Monday meetings to Friday dinners.',
    details: [
      'Structured top with clean neckline',
      'Tailored straight-leg trousers',
      'Fully lined for comfort',
      'Sold as a complete set',
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: [
      '/images/nonye-corporate-set-1.jpg',
      '/images/nonye-corporate-set-2.jpg',
      '/images/nonye-corporate-set-3.jpg',
    ],
    badge: 'New',
  },
  {
    id: 'dinma-two-piece',
    slug: 'dinma-two-piece',
    name: 'Dinma Two-Piece',
    price: 26000,
    category: 'Occasion',
    tagline: 'Soft structure, bold print.',
    description:
      'The Dinma set pairs a flattering top with a matching bottom in rich, colour-saturated Ankara. Wear it together for impact or style the pieces separately all week.',
    details: [
      'Premium Ankara wax print',
      'Matching top and bottom',
      'Easy-wear, breathable fabric',
      'Pieces can be styled separately',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      '/images/dinma-two-piece-1.jpg',
      '/images/dinma-two-piece-2.jpg',
      '/images/dinma-two-piece-3.jpg',
    ],
  },
  {
    id: 'ara-set',
    slug: 'ara-set',
    name: 'Ara Set',
    price: 15000,
    category: 'Casual',
    tagline: 'Everyday elegance, made simple.',
    description:
      'Light, breezy and endlessly wearable. The Ara set is your go-to for brunches, errands and weekend getaways — comfort that still turns heads.',
    details: [
      'Lightweight African print cotton',
      'Relaxed, comfortable fit',
      'Pull-on design',
      'Perfect for warm days',
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: ['/images/ara-set-1.jpg', '/images/ara-set-2.jpg', '/images/ara-set-3.jpg'],
    badge: 'Great value',
  },
  {
    id: 'signature-ankara-midi-dress',
    slug: 'signature-ankara-midi-dress',
    name: 'Signature Ankara Midi Dress',
    price: 28000,
    category: 'Occasion',
    tagline: 'The dress that walks in before you do.',
    description:
      'Our signature midi — a cinched waist, graceful flare and a hem that hits just right. Designed for weddings, celebrations and every occasion that calls for a queen.',
    details: [
      'Premium Ankara wax print',
      'Fitted bodice with flared midi skirt',
      'Concealed back zip',
      'Partially lined',
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: [
      '/images/ankara-midi-dress-1.jpg',
      '/images/ankara-midi-dress-2.jpg',
      '/images/ankara-midi-dress-3.jpg',
    ],
    badge: 'Signature',
  },
]

export const getProductBySlug = (slug) => products.find((p) => p.slug === slug)
