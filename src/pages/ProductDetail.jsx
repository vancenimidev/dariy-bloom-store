import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeftIcon, BagIcon, CheckIcon, ShieldIcon, TruckIcon } from '../components/Icons'
import ProductCard from '../components/ProductCard'
import ProductImage from '../components/ProductImage'
import QuantityStepper from '../components/QuantityStepper'
import { useCart } from '../context/CartContext'
import { useProducts } from '../context/ProductsContext'
import { formatNaira } from '../lib/format'
import NotFound from './NotFound'

export default function ProductDetail() {
  const { slug } = useParams()
  const { products } = useProducts()
  const product = products.find((p) => p.slug === slug)

  if (!product) return <NotFound />
  // Keying by slug resets gallery/size/quantity state when navigating between products.
  return <ProductView key={product.slug} product={product} related={products.filter((p) => p.id !== product.id).slice(0, 3)} />
}

function ProductView({ product, related }) {
  const { addItem } = useCart()
  const [activeImage, setActiveImage] = useState(0)
  const [size, setSize] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [sizeError, setSizeError] = useState(false)

  const needsSize = product.sizes?.length > 0

  const handleAdd = () => {
    if (needsSize && !size) {
      setSizeError(true)
      return
    }
    addItem(product, { size, quantity })
  }

  return (
    <div className="container-page py-8 sm:py-12">
      <nav className="mb-8 flex items-center gap-2 text-xs tracking-[0.15em] text-cocoa-500 uppercase" aria-label="Breadcrumb">
        <Link to="/shop" className="inline-flex items-center gap-1.5 hover:text-cocoa-900">
          <ArrowLeftIcon className="h-3.5 w-3.5" /> Shop
        </Link>
        <span>/</span>
        <span className="truncate text-cocoa-800">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Gallery */}
        <div className="flex flex-col-reverse gap-4 sm:flex-row lg:sticky lg:top-32 lg:self-start">
          <div className="flex gap-3 sm:flex-col" role="tablist" aria-label="Product images">
            {product.images.map((src, i) => (
              <button
                key={src}
                type="button"
                role="tab"
                aria-selected={activeImage === i}
                aria-label={`Show image ${i + 1}`}
                onClick={() => setActiveImage(i)}
                className={`overflow-hidden rounded-xl ring-2 ring-offset-2 ring-offset-cream-50 transition ${
                  activeImage === i ? 'ring-gold-500' : 'ring-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <ProductImage src={src} alt="" label={`${i + 1}`} className="h-24 w-18 sm:h-28 sm:w-21" />
              </button>
            ))}
          </div>
          <div className="flex-1">
            <ProductImage
              key={activeImage}
              src={product.images[activeImage]}
              alt={`${product.name} — image ${activeImage + 1}`}
              label={product.name}
              loading="eager"
              className="aspect-[3/4] animate-fade-in rounded-3xl shadow-xl shadow-cocoa-900/10"
            />
          </div>
        </div>

        {/* Info */}
        <div className="animate-fade-up">
          {product.badge && (
            <span className="inline-block rounded-full bg-gold-100 px-3 py-1 text-[0.65rem] font-medium tracking-[0.2em] text-gold-700 uppercase">
              {product.badge}
            </span>
          )}
          <p className="eyebrow mt-4">{product.category}</p>
          <h1 className="mt-2 text-4xl leading-tight font-semibold text-cocoa-900 sm:text-5xl">{product.name}</h1>
          <p className="mt-2 font-display text-xl text-cocoa-500 italic">{product.tagline}</p>
          <p className="mt-6 font-display text-4xl font-semibold text-cocoa-900">{formatNaira(product.price)}</p>

          <div className="my-8 h-px bg-gradient-to-r from-gold-400/60 via-cream-300 to-transparent" />

          <p className="leading-relaxed text-cocoa-700">{product.description}</p>

          {needsSize && (
            <fieldset className="mt-8">
              <div className="flex items-center justify-between">
                <legend className="field-label mb-0">Select size</legend>
                {size && <span className="text-xs text-cocoa-500">Selected: {size}</span>}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={size === s}
                    onClick={() => {
                      setSize(s)
                      setSizeError(false)
                    }}
                    className={`h-12 min-w-12 rounded-full border px-4 text-sm font-medium transition ${
                      size === s
                        ? 'border-cocoa-800 bg-cocoa-800 text-cream-50'
                        : 'border-cream-300 bg-white text-cocoa-800 hover:border-cocoa-500'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {sizeError && <p className="field-error">Please choose a size to continue.</p>}
            </fieldset>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <QuantityStepper value={quantity} onChange={setQuantity} />
            <button type="button" onClick={handleAdd} className="btn-primary flex-1">
              <BagIcon className="h-4 w-4" /> Add to bag · {formatNaira(product.price * quantity)}
            </button>
          </div>

          <ul className="mt-10 space-y-3 rounded-3xl border border-cream-300 bg-cream-100 p-6">
            {product.details.map((d) => (
              <li key={d} className="flex items-start gap-3 text-sm text-cocoa-700">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" /> {d}
              </li>
            ))}
          </ul>

          <div className="mt-6 grid gap-4 text-sm text-cocoa-600 sm:grid-cols-2">
            <p className="flex items-center gap-3">
              <TruckIcon className="h-5 w-5 text-gold-600" /> Delivery in 2–5 working days
            </p>
            <p className="flex items-center gap-3">
              <ShieldIcon className="h-5 w-5 text-gold-600" /> Bank transfer or pay on delivery
            </p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="mb-10 text-center text-3xl font-semibold text-cocoa-900 sm:text-4xl">
            Complete the <span className="text-gold-600 italic">look</span>
          </h2>
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 min-[480px]:grid-cols-2 lg:grid-cols-3">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
