import { Link } from 'react-router-dom'

export default function Logo({ light = false, className = '' }) {
  return (
    <Link to="/" className={`group inline-flex items-center gap-2.5 ${className}`} aria-label="Dariy Bloom home">
      <svg viewBox="0 0 40 40" className="h-9 w-9 shrink-0 transition-transform duration-700 group-hover:rotate-45" aria-hidden>
        <circle cx="20" cy="20" r="19" className={light ? 'fill-cream-50/10' : 'fill-cocoa-800'} />
        <g fill="none" stroke="#c9a14a" strokeWidth="1.8">
          <circle cx="20" cy="20" r="3.6" />
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <ellipse key={deg} cx="20" cy="11.5" rx="3.6" ry="6" transform={`rotate(${deg} 20 20)`} />
          ))}
        </g>
      </svg>
      <span className="leading-none">
        <span className={`block font-display text-2xl font-semibold tracking-wide ${light ? 'text-cream-50' : 'text-cocoa-900'}`}>
          Dariy Bloom
        </span>
        <span className="block text-[0.55rem] whitespace-nowrap tracking-[0.3em] text-gold-600 uppercase sm:text-[0.6rem] sm:tracking-[0.35em]">African Print Fashion</span>
      </span>
    </Link>
  )
}
