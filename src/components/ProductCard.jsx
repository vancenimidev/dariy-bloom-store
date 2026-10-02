import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatNaira } from '../lib/format'
import { PlusIcon } from './Icons'
import ProductImage from './ProductImage'

export default function ProductCard({ product, index = 0 }) {
  const { addItem } = useCart()
  const defaultSize = product.sizes?.includes('M') ? 'M' : product.sizes?.[0]

  return (
    <article className="group animate-fade-up" style={{ animationDelay: `${index * 80}ms` }}>
      <div className="relative">
        <Link to={`/product/${product.slug}`} className="block" aria-label={`View ${product.name}`}>
          <div className="relative overflow-hidden rounded-3xl">
            <ProductImage
              src={product.images[0]}
              alt={product.name}
              className="aspect-[3/4]"
              imgClassName="transition-transform duration-[1.2s] ease-out group-hover:scale-105"
            />
            {product.images[1] && (
              <ProductImage
                src={product.images[1]}
                alt=""
                label={product.name}
                className="absolute! inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
              />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-cocoa-950/30 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          </div>
        </Link>
        {product.badge && (
          <span className="pointer-events-none absolute top-4 left-4 rounded-full bg-cream-50/95 px-3 py-1 text-[0.65rem] font-medium tracking-[0.18em] text-cocoa-800 uppercase shadow-sm backdrop-blur">
            {product.badge}
          </span>
        )}
        <button
          type="button"
          onClick={() => addItem(product, { size: defaultSize })}
          className="absolute right-4 bottom-4 flex h-12 w-12 items-center justify-center rounded-full bg-cream-50 text-cocoa-900 shadow-lg transition-all duration-300 hover:bg-gold-500 sm:translate-y-3 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:focus-visible:translate-y-0 sm:focus-visible:opacity-100"
          aria-label={`Quick add ${product.name}${defaultSize ? `, size ${defaultSize}` : ''} to bag`}
          title={`Quick add${defaultSize ? ` (size ${defaultSize})` : ''}`}
        >
          <PlusIcon className="h-5 w-5" />
        </button>
      </div>
      <div className="mt-4 flex items-start justify-between gap-3 px-1">
        <div className="min-w-0">
          <p className="text-[0.65rem] tracking-[0.25em] text-gold-600 uppercase">{product.category}</p>
          <h3 className="mt-1 text-xl leading-snug font-semibold text-cocoa-900">
            <Link to={`/product/${product.slug}`} className="hover:text-gold-700">
              {product.name}
            </Link>
          </h3>
          <p className="mt-0.5 truncate text-sm text-cocoa-500">{product.tagline}</p>
        </div>
        <p className="shrink-0 pt-4 font-medium text-cocoa-900">{formatNaira(product.price)}</p>
      </div>
    </article>
  )
}
