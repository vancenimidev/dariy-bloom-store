import { Link } from 'react-router-dom'
import BrandStory from '../components/BrandStory'
import Hero from '../components/Hero'
import { ArrowRightIcon } from '../components/Icons'
import ProductGrid from '../components/ProductGrid'
import ValueProps from '../components/ValueProps'
import { useProducts } from '../context/ProductsContext'

export default function Home() {
  const { products } = useProducts()

  return (
    <>
      <Hero />
      <ValueProps />

      <section className="container-page pt-24" aria-labelledby="collection-heading">
        <div className="mb-12 flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:items-end sm:text-left">
          <div>
            <p className="eyebrow">The collection</p>
            <h2 id="collection-heading" className="mt-3 text-4xl font-semibold text-cocoa-900 sm:text-5xl">
              Pieces made to <span className="text-gold-600 italic">bloom</span> in
            </h2>
          </div>
          <Link to="/shop" className="group inline-flex items-center gap-2 text-sm tracking-[0.18em] text-cocoa-800 uppercase">
            View all
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <ProductGrid products={products} />
      </section>

      <BrandStory />
    </>
  )
}
