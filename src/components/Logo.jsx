import { Link } from 'react-router-dom'
import BrandMark from './BrandMark'

export default function Logo({ light = false, className = '' }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-3 ${className}`} aria-label="Dariy Bloom home">
      <BrandMark className={`h-12 w-auto shrink-0 ${light ? 'text-cream-300' : 'text-cocoa-800'}`} />
      <span className="leading-none">
        <span
          className={`block font-display text-xl font-medium tracking-[0.16em] uppercase sm:text-2xl ${
            light ? 'text-cream-300' : 'text-cocoa-900'
          }`}
        >
          Dariy Bloom
        </span>
        <span className="mt-1 block text-[0.55rem] whitespace-nowrap tracking-[0.3em] text-gold-600 uppercase sm:text-[0.6rem] sm:tracking-[0.35em]">
          African Print Fashion
        </span>
      </span>
    </Link>
  )
}
