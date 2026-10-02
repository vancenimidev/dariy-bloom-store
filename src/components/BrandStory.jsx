import { BRAND } from '../lib/config'
import { InstagramIcon } from './Icons'
import ProductImage from './ProductImage'

export default function BrandStory() {
  return (
    <section id="about" className="container-page scroll-mt-28 py-24">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-cocoa-900 text-cream-100">
        <div className="ankara-pattern pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative grid items-center gap-10 p-8 sm:p-12 lg:grid-cols-2 lg:p-16">
          <div>
            <p className="eyebrow text-gold-400">Our story</p>
            <h2 className="mt-4 text-4xl leading-tight font-semibold sm:text-5xl">
              Heritage, worn with <span className="text-gold-400 italic">modern grace.</span>
            </h2>
            <p className="mt-6 leading-relaxed text-cream-200/80">
              Dariy Bloom was born from a love of African print and the women who wear it boldly. Every piece balances the
              comfort you need for everyday life with the elegance you deserve for every occasion — from the boardroom to
              the owambe.
            </p>
            <p className="mt-4 leading-relaxed text-cream-200/80">
              Occasional & casual sophistication, designed for the confident queen in you. 👑
            </p>
            <a
              href={BRAND.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-gold mt-8"
            >
              <InstagramIcon className="h-4 w-4" /> See the looks on Instagram
            </a>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <ProductImage src="/images/dinma-two-piece-1.jpg" alt="Dinma Two-Piece" className="aspect-[3/4] rounded-3xl" />
            <ProductImage src="/images/ara-set-1.jpg" alt="Ara Set" className="mt-12 aspect-[3/4] rounded-3xl" />
          </div>
        </div>
      </div>
    </section>
  )
}
