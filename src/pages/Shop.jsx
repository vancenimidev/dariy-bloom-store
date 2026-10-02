import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductGrid from '../components/ProductGrid'
import { useProducts } from '../context/ProductsContext'

const SORTS = {
  featured: { label: 'Featured', fn: () => 0 },
  'price-asc': { label: 'Price: low to high', fn: (a, b) => a.price - b.price },
  'price-desc': { label: 'Price: high to low', fn: (a, b) => b.price - a.price },
}

export default function Shop() {
  const { products } = useProducts()
  const [params, setParams] = useSearchParams()
  const category = params.get('category') ?? 'All'
  const sort = SORTS[params.get('sort')] ? params.get('sort') : 'featured'

  const categories = useMemo(() => ['All', ...new Set(products.map((p) => p.category).filter(Boolean))], [products])

  const visible = useMemo(
    () => products.filter((p) => category === 'All' || p.category === category).toSorted(SORTS[sort].fn),
    [products, category, sort],
  )

  const update = (key, value, fallback) => {
    const next = new URLSearchParams(params)
    if (value === fallback) next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  return (
    <div>
      <section className="relative overflow-hidden bg-cocoa-900 py-16 text-center text-cream-50 sm:py-20">
        <div className="ankara-pattern pointer-events-none absolute inset-0 opacity-50" />
        <div className="container-page relative">
          <p className="eyebrow text-gold-400">Shop</p>
          <h1 className="mt-3 text-5xl font-semibold sm:text-6xl">The Collection</h1>
          <p className="mx-auto mt-4 max-w-md text-cream-200/75">Comfortable, trendy and elegant African print — for every occasion.</p>
        </div>
      </section>

      <div className="container-page py-12">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0" role="tablist" aria-label="Filter by category">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                role="tab"
                aria-selected={category === c}
                onClick={() => update('category', c, 'All')}
                className={`shrink-0 rounded-full border px-5 py-2 text-xs tracking-[0.18em] uppercase transition ${
                  category === c
                    ? 'border-cocoa-800 bg-cocoa-800 text-cream-50'
                    : 'border-cream-300 bg-white text-cocoa-700 hover:border-cocoa-400'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-3 text-sm text-cocoa-600">
            <span className="shrink-0 text-xs tracking-[0.18em] uppercase">Sort</span>
            <select
              value={sort}
              onChange={(e) => update('sort', e.target.value, 'featured')}
              className="field-input w-full py-2 sm:w-56"
            >
              {Object.entries(SORTS).map(([value, { label }]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="mb-6 text-sm text-cocoa-500">
          {visible.length} piece{visible.length === 1 ? '' : 's'}
        </p>
        <ProductGrid products={visible} />
      </div>
    </div>
  )
}
