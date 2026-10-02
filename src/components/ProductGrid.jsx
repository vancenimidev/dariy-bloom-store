import ProductCard from './ProductCard'

export default function ProductGrid({ products }) {
  if (!products.length) {
    return <p className="py-16 text-center text-cocoa-500">No pieces match this filter yet — check back soon.</p>
  }
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-12 min-[480px]:grid-cols-2 lg:grid-cols-3">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} index={i} />
      ))}
    </div>
  )
}
