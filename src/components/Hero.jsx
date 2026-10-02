import { Link } from 'react-router-dom'
import { BRAND } from '../lib/config'
import { ArrowRightIcon, InstagramIcon, SparkleIcon } from './Icons'
import ProductImage from './ProductImage'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-cream-100 via-cream-50 to-cream-50">
      <div className="ankara-pattern pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 opacity-60 lg:block" />
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-gold-300/30 blur-3xl" />

      <div className="container-page relative grid items-center gap-12 pt-10 pb-16 sm:pt-16 lg:grid-cols-2 lg:gap-8 lg:pt-20 lg:pb-24">
        <div className="animate-fade-up text-center lg:text-left">
          <p className="eyebrow inline-flex items-center gap-2">
            <SparkleIcon className="h-3.5 w-3.5" /> New season · African print
          </p>
          <h1 className="mt-5 text-5xl leading-[0.95] font-semibold text-cocoa-900 sm:text-6xl lg:text-7xl xl:text-8xl">
            Bloom in <br className="hidden sm:block" />
            <span className="gold-text italic">bold print.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-cocoa-600 lg:mx-0">
            🌸 Comfortable. 🌸 Trendy. 🌸 Elegant. <br />
            {BRAND.bio}
          </p>
          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Link to="/shop" className="btn-primary w-full sm:w-auto">
              Shop the collection <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <a href={BRAND.instagramUrl} target="_blank" rel="noreferrer" className="btn-outline w-full sm:w-auto">
              <InstagramIcon className="h-4 w-4" /> {BRAND.instagramHandle}
            </a>
          </div>
          <dl className="mx-auto mt-12 grid max-w-md grid-cols-3 divide-x divide-cream-300 border-y border-cream-300 py-5 lg:mx-0">
            {[
              ['100%', 'African print'],
              ['2–5 days', 'Delivery'],
              ['👑', 'Made for queens'],
            ].map(([stat, label]) => (
              <div key={label} className="px-2 text-center">
                <dt className="sr-only">{label}</dt>
                <dd className="font-display text-2xl font-semibold text-cocoa-900">{stat}</dd>
                <dd className="mt-0.5 text-[0.65rem] tracking-[0.18em] text-cocoa-500 uppercase">{label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-lg animate-fade-up [animation-delay:150ms] lg:max-w-none">
          <div className="relative grid grid-cols-5 gap-4">
            <div className="col-span-3 row-span-2">
              <div className="rounded-t-[999px] rounded-b-3xl bg-gradient-to-b from-gold-400 to-gold-700 p-1.5 shadow-2xl shadow-cocoa-900/25">
                <ProductImage
                  src="/images/ankara-midi-dress-1.jpg"
                  alt="Signature Ankara Midi Dress"
                  loading="eager"
                  className="aspect-[3/4.4] rounded-t-[999px] rounded-b-[1.3rem]"
                />
              </div>
            </div>
            <div className="col-span-2 mt-10">
              <ProductImage
                src="/images/nimi-bubble-pants-1.jpg"
                alt="Nimi Bubble Pants"
                loading="eager"
                className="aspect-[3/4] rounded-3xl shadow-xl shadow-cocoa-900/20"
              />
            </div>
            <div className="col-span-2">
              <ProductImage
                src="/images/nonye-corporate-set-1.jpg"
                alt="Nonye Two-Piece Corporate Set"
                loading="eager"
                className="aspect-[3/4] rounded-3xl shadow-xl shadow-cocoa-900/20"
              />
            </div>
          </div>
          <div className="absolute -bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full border border-gold-300/60 bg-cream-50/95 px-5 py-3 whitespace-nowrap shadow-xl backdrop-blur sm:left-6 sm:translate-x-0">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cocoa-800 text-gold-300">👑</span>
            <span className="text-left">
              <span className="block font-display text-lg leading-none font-semibold text-cocoa-900">For confident queens</span>
              <span className="text-[0.65rem] tracking-[0.2em] text-cocoa-500 uppercase">Occasion & casual</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
