import { Link } from 'react-router-dom'
import { BRAND } from '../lib/config'
import { InstagramIcon, MailIcon, PhoneIcon } from './Icons'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden bg-cocoa-950 text-cream-200">
      <div className="ankara-pattern pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative">
        <div className="h-1 bg-gradient-to-r from-gold-700 via-gold-400 to-gold-700" />
        <div className="container-page grid gap-12 py-16 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo light />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-cream-200/70">
              🌸 Comfortable. 🌸 Trendy. 🌸 Elegant. <br />
              {BRAND.bio}
            </p>
            <a
              href={BRAND.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-gold-500/40 px-5 py-2.5 text-sm text-gold-300 transition hover:border-gold-400 hover:bg-gold-500/10"
            >
              <InstagramIcon className="h-4 w-4" /> Follow {BRAND.instagramHandle}
            </a>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-xs font-sans font-medium tracking-[0.3em] text-gold-400 uppercase">Shop</h3>
            <ul className="mt-5 space-y-3 text-sm">
              <li><Link to="/shop" className="text-cream-200/70 hover:text-gold-300">All pieces</Link></li>
              <li><Link to="/shop?category=Occasion" className="text-cream-200/70 hover:text-gold-300">Occasion</Link></li>
              <li><Link to="/shop?category=Casual" className="text-cream-200/70 hover:text-gold-300">Casual</Link></li>
              <li><Link to="/checkout" className="text-cream-200/70 hover:text-gold-300">Checkout</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-xs font-sans font-medium tracking-[0.3em] text-gold-400 uppercase">Help</h3>
            <ul className="mt-5 space-y-3 text-sm text-cream-200/70">
              <li>Delivery: 2–5 working days</li>
              <li>Free delivery over ₦60k</li>
              <li>Bank transfer & pay on delivery</li>
              <li>Exchanges within 7 days</li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-xs font-sans font-medium tracking-[0.3em] text-gold-400 uppercase">Contact</h3>
            <ul className="mt-5 space-y-3 text-sm text-cream-200/70">
              <li>
                <a href={`mailto:${BRAND.email}`} className="inline-flex items-center gap-2 hover:text-gold-300">
                  <MailIcon className="h-4 w-4" /> {BRAND.email}
                </a>
              </li>
              <li>
                <a href={`tel:${BRAND.phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-2 hover:text-gold-300">
                  <PhoneIcon className="h-4 w-4" /> {BRAND.phone}
                </a>
              </li>
              <li>
                <a href={BRAND.instagramUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-gold-300">
                  <InstagramIcon className="h-4 w-4" /> DM us on Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-cream-50/10">
          <div className="container-page flex flex-col items-center justify-between gap-3 py-6 text-xs text-cream-200/50 sm:flex-row">
            <p>© {new Date().getFullYear()} Dariy Bloom. Made with love for confident queens 👑</p>
            <p className="tracking-[0.2em] uppercase">Comfortable · Trendy · Elegant</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
