import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { FREE_DELIVERY_THRESHOLD } from '../lib/config'
import { formatNaira } from '../lib/format'
import { ArrowRightIcon, BagIcon, CloseIcon, TrashIcon } from './Icons'
import ProductImage from './ProductImage'
import QuantityStepper from './QuantityStepper'

export default function CartDrawer() {
  const { items, itemCount, subtotal, isOpen, closeCart, setQuantity, removeItem } = useCart()
  const navigate = useNavigate()
  const panelRef = useRef(null)

  // Lock page scroll + close on Escape while open.
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && closeCart()
    window.addEventListener('keydown', onKey)
    panelRef.current?.focus()
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [isOpen, closeCart])

  const remaining = Math.max(FREE_DELIVERY_THRESHOLD - subtotal, 0)
  const progress = Math.min((subtotal / FREE_DELIVERY_THRESHOLD) * 100, 100)

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? '' : 'pointer-events-none'}`} aria-hidden={!isOpen}>
      <div
        className={`absolute inset-0 bg-cocoa-950/50 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={closeCart}
      />
      <aside
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        inert={!isOpen}
        className={`absolute top-0 right-0 flex h-full w-full max-w-md flex-col bg-cream-50 shadow-2xl outline-none transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex items-center justify-between border-b border-cream-300 px-6 py-5">
          <div>
            <h2 className="text-2xl font-semibold text-cocoa-900">Your Bag</h2>
            <p className="text-xs tracking-[0.2em] text-cocoa-500 uppercase">
              {itemCount} item{itemCount === 1 ? '' : 's'}
            </p>
          </div>
          <button type="button" onClick={closeCart} className="rounded-full p-2 text-cocoa-700 hover:bg-cream-200" aria-label="Close cart">
            <CloseIcon className="h-6 w-6" />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-cream-200 text-gold-600">
              <BagIcon className="h-9 w-9" />
            </div>
            <h3 className="text-2xl text-cocoa-900">Your bag is empty</h3>
            <p className="mt-2 text-sm text-cocoa-500">Every queen deserves something beautiful. Start blooming.</p>
            <Link to="/shop" onClick={closeCart} className="btn-primary mt-8">
              Shop the collection
            </Link>
          </div>
        ) : (
          <>
            <div className="border-b border-cream-300 bg-cream-100 px-6 py-4">
              <p className="text-xs text-cocoa-600">
                {remaining > 0 ? (
                  <>
                    You're <span className="font-semibold text-cocoa-900">{formatNaira(remaining)}</span> away from free delivery
                  </>
                ) : (
                  <span className="font-medium text-cocoa-900">✨ You've unlocked free delivery!</span>
                )}
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-cream-300">
                <div className="h-full rounded-full bg-gradient-to-r from-gold-600 to-gold-400 transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <ul className="flex-1 divide-y divide-cream-300 overflow-y-auto px-6">
              {items.map((item) => (
                <li key={item.key} className="flex gap-4 py-5">
                  <Link to={`/product/${item.slug}`} onClick={closeCart} className="shrink-0">
                    <ProductImage src={item.image} alt={item.name} className="h-28 w-22 rounded-xl" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          to={`/product/${item.slug}`}
                          onClick={closeCart}
                          className="font-display text-lg leading-tight text-cocoa-900 hover:text-gold-700"
                        >
                          {item.name}
                        </Link>
                        {item.size && <p className="mt-0.5 text-xs text-cocoa-500">Size: {item.size}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        className="rounded-full p-1.5 text-cocoa-400 transition hover:bg-cream-200 hover:text-red-700"
                        aria-label={`Remove ${item.name}`}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-end justify-between pt-3">
                      <QuantityStepper size="sm" value={item.quantity} min={0} onChange={(q) => setQuantity(item.key, q)} />
                      <span className="font-medium text-cocoa-900">{formatNaira(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="border-t border-cream-300 bg-white px-6 pt-5 pb-6">
              <div className="flex items-baseline justify-between">
                <span className="text-sm tracking-[0.15em] text-cocoa-600 uppercase">Subtotal</span>
                <span className="font-display text-3xl font-semibold text-cocoa-900">{formatNaira(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-cocoa-500">Delivery calculated at checkout.</p>
              <button
                type="button"
                className="btn-gold mt-5 w-full"
                onClick={() => {
                  closeCart()
                  navigate('/checkout')
                }}
              >
                Checkout <ArrowRightIcon className="h-4 w-4" />
              </button>
              <button type="button" onClick={closeCart} className="mt-3 w-full text-center text-xs tracking-[0.2em] text-cocoa-600 uppercase hover:text-cocoa-900">
                Continue shopping
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  )
}
