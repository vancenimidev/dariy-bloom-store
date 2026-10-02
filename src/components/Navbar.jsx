import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { BRAND } from '../lib/config'
import { BagIcon, CloseIcon, InstagramIcon, MenuIcon } from './Icons'
import Logo from './Logo'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/shop', label: 'Shop' },
  { to: '/#about', label: 'Our Story' },
]

export default function Navbar() {
  const { itemCount, openCart } = useCart()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [bump, setBump] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMenuOpen(false), [location])

  // Animate the counter whenever the count changes.
  useEffect(() => {
    if (!itemCount) return
    setBump(true)
    const t = setTimeout(() => setBump(false), 400)
    return () => clearTimeout(t)
  }, [itemCount])

  const linkClass = ({ isActive }) =>
    `relative py-1 text-sm tracking-[0.18em] uppercase transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:bg-gold-500 after:transition-transform after:duration-300 hover:text-cocoa-900 hover:after:scale-x-100 ${
      isActive ? 'text-cocoa-900 after:scale-x-100' : 'text-cocoa-600 after:scale-x-0'
    }`

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-cocoa-900 py-2 text-center text-[0.68rem] tracking-[0.25em] text-gold-300 uppercase">
        Free delivery over ₦60,000<span className="hidden sm:inline"> · Nationwide shipping</span>
      </div>
      <nav
        className={`border-b transition-all duration-300 ${
          scrolled
            ? 'border-cream-300/80 bg-cream-50/85 shadow-[0_8px_30px_-12px_rgb(59_36_20_/_0.25)] backdrop-blur-xl'
            : 'border-transparent bg-cream-50'
        }`}
      >
        <div className="container-page flex h-[72px] items-center justify-between gap-4">
          <button
            type="button"
            className="-ml-2 rounded-full p-2 text-cocoa-800 md:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>

          <Logo className="md:mr-auto" />

          <div className="hidden items-center gap-10 md:flex">
            {links.map((l) =>
              l.to.includes('#') ? (
                <Link key={l.to} to={l.to} className={linkClass({ isActive: false })}>
                  {l.label}
                </Link>
              ) : (
                <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
                  {l.label}
                </NavLink>
              ),
            )}
          </div>

          <div className="flex items-center gap-1 md:ml-8">
            <a
              href={BRAND.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-full p-2.5 text-cocoa-700 transition hover:bg-cream-200 hover:text-cocoa-900 sm:inline-flex"
              aria-label="Dariy Bloom on Instagram"
            >
              <InstagramIcon />
            </a>
            <button
              type="button"
              onClick={openCart}
              className="relative -mr-2 rounded-full p-2.5 text-cocoa-800 transition hover:bg-cream-200"
              aria-label={`Open cart, ${itemCount} item${itemCount === 1 ? '' : 's'}`}
            >
              <BagIcon className="h-6 w-6" />
              {itemCount > 0 && (
                <span
                  className={`absolute top-0.5 right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-500 px-1 text-[0.65rem] font-semibold text-cocoa-950 ring-2 ring-cream-50 ${
                    bump ? 'animate-pop' : ''
                  }`}
                >
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`grid overflow-hidden transition-all duration-300 md:hidden ${
            menuOpen ? 'grid-rows-[1fr] border-t border-cream-300' : 'grid-rows-[0fr]'
          }`}
        >
          <div className="min-h-0">
            <div className="container-page flex flex-col py-4">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  tabIndex={menuOpen ? 0 : -1}
                  className="border-b border-cream-200 py-3.5 font-display text-2xl text-cocoa-800"
                >
                  {l.label}
                </Link>
              ))}
              <a
                href={BRAND.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm text-cocoa-600"
              >
                <InstagramIcon className="h-4 w-4" /> {BRAND.instagramHandle}
              </a>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
