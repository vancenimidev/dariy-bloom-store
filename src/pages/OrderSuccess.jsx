import { Link, useLocation, useParams } from 'react-router-dom'
import { CheckIcon, InstagramIcon, MailIcon, TruckIcon } from '../components/Icons'
import ProductImage from '../components/ProductImage'
import { BANK_DETAILS, BRAND, PAYMENT_METHODS } from '../lib/config'
import { formatNaira } from '../lib/format'
import { getLocalOrder } from '../lib/ordersApi'
import NotFound from './NotFound'

const EMAIL_COPY = {
  sent: (email) => <>A confirmation email is on its way to <strong>{email}</strong>.</>,
  simulated: (email) => (
    <>
      Confirmation email to <strong>{email}</strong> simulated (see the browser console) — ready for Mailgun.
    </>
  ),
  failed: (email) => <>We couldn't email <strong>{email}</strong> just now, but your order is saved. We'll be in touch.</>,
}

export default function OrderSuccess() {
  const { reference } = useParams()
  const { state } = useLocation()
  const order = state?.order?.reference === reference ? state.order : getLocalOrder(reference)

  if (!order) return <NotFound />

  const firstName = order.customer.name.split(' ')[0]
  const isTransfer = order.paymentMethod === 'bank_transfer'
  const placedAt = new Date(order.createdAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-gradient-to-b from-cocoa-900 to-cocoa-800">
        <div className="ankara-pattern absolute inset-0 opacity-60" />
      </div>
      <Petals />

      <div className="container-page relative py-14 sm:py-20">
        <div className="mx-auto max-w-2xl animate-fade-up text-center text-cream-50">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gold-300 to-gold-600 shadow-[0_0_0_10px_rgb(201_161_74_/_0.15)]">
            <CheckIcon className="h-10 w-10 text-cocoa-950" strokeWidth={2.4} />
          </div>
          <p className="eyebrow mt-8 text-gold-300">Order confirmed</p>
          <h1 className="mt-3 text-4xl leading-tight font-semibold sm:text-6xl">
            Thank you, <span className="text-gold-300 italic">{firstName}</span> 🌸
          </h1>
          <p className="mx-auto mt-4 max-w-md text-cream-200/80">
            Your order <span className="font-medium text-gold-300">{order.reference}</span> has been received. You're about to
            bloom, queen. 👑
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-3xl animate-fade-up overflow-hidden rounded-[2rem] bg-white shadow-[0_40px_80px_-40px_rgb(43_26_15_/_0.6)] [animation-delay:150ms]">
          {/* Status strip */}
          <div className="grid gap-px bg-cream-200 sm:grid-cols-2">
            <div className="flex items-start gap-3 bg-cream-50 p-5">
              <MailIcon className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" />
              <p className="text-sm text-cocoa-700">{(EMAIL_COPY[order.emailStatus] ?? EMAIL_COPY.simulated)(order.customer.email)}</p>
            </div>
            <div className="flex items-start gap-3 bg-cream-50 p-5">
              <TruckIcon className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" />
              <p className="text-sm text-cocoa-700">
                We'll call <strong>{order.customer.phone}</strong> when your order ships. Delivery takes 2–5 working days.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            {isTransfer ? (
              <div className="mb-8 rounded-2xl border border-gold-300 bg-gold-100/50 p-5 text-sm text-cocoa-800">
                <p className="font-medium text-cocoa-900">Payment: Bank Transfer — awaiting confirmation</p>
                <p className="mt-1">
                  We'll verify your transfer of <strong>{formatNaira(order.total)}</strong> to {BANK_DETAILS.bankName} ·{' '}
                  {BANK_DETAILS.accountNumber} ({BANK_DETAILS.accountName}) with narration <strong>{order.reference}</strong>, then
                  dispatch your order.
                </p>
              </div>
            ) : (
              <div className="mb-8 rounded-2xl border border-cream-300 bg-cream-100 p-5 text-sm text-cocoa-800">
                <p className="font-medium text-cocoa-900">Payment: Pay on Delivery</p>
                <p className="mt-1">
                  Please have <strong>{formatNaira(order.total)}</strong> ready when your order arrives.
                </p>
              </div>
            )}

            <div className="flex items-baseline justify-between">
              <h2 className="text-2xl font-semibold text-cocoa-900">Order summary</h2>
              <span className="text-xs text-cocoa-400">{placedAt}</span>
            </div>
            <ul className="mt-5 divide-y divide-cream-200">
              {order.items.map((item) => (
                <li key={`${item.productId}-${item.size}`} className="flex items-center gap-4 py-4">
                  <ProductImage src={item.image} alt={item.name} className="h-20 w-16 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-lg leading-tight text-cocoa-900">{item.name}</p>
                    <p className="text-xs text-cocoa-500">
                      {item.size && <>Size {item.size} · </>}Qty {item.quantity} · {formatNaira(item.price)} each
                    </p>
                  </div>
                  <p className="text-sm font-medium text-cocoa-900">{formatNaira(item.price * item.quantity)}</p>
                </li>
              ))}
            </ul>

            <div className="mt-4 grid gap-8 border-t border-cream-200 pt-6 sm:grid-cols-2">
              <div className="text-sm text-cocoa-700">
                <h3 className="field-label">Delivering to</h3>
                <p className="font-medium text-cocoa-900">{order.customer.name}</p>
                <p>{order.customer.address}</p>
                <p>
                  {order.customer.city}, {order.customer.state}
                </p>
                {order.customer.notes && <p className="mt-1 text-cocoa-500 italic">“{order.customer.notes}”</p>}
              </div>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between text-cocoa-600">
                  <dt>Subtotal</dt>
                  <dd className="text-cocoa-900">{formatNaira(order.subtotal)}</dd>
                </div>
                <div className="flex justify-between text-cocoa-600">
                  <dt>Delivery</dt>
                  <dd className="text-cocoa-900">{order.deliveryFee ? formatNaira(order.deliveryFee) : 'Free'}</dd>
                </div>
                <div className="flex justify-between text-cocoa-600">
                  <dt>Payment</dt>
                  <dd className="text-cocoa-900">{PAYMENT_METHODS[order.paymentMethod]}</dd>
                </div>
                <div className="flex items-baseline justify-between border-t border-cream-200 pt-3">
                  <dt className="tracking-[0.15em] text-cocoa-700 uppercase">Total</dt>
                  <dd className="font-display text-3xl font-semibold text-cocoa-900">{formatNaira(order.total)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/shop" className="btn-primary w-full sm:w-auto">
            Continue shopping
          </Link>
          <a href={BRAND.instagramUrl} target="_blank" rel="noreferrer" className="btn-outline w-full sm:w-auto">
            <InstagramIcon className="h-4 w-4" /> Tag us {BRAND.instagramHandle}
          </a>
        </div>
      </div>
    </div>
  )
}

/** Gentle falling petals for a celebratory touch. Hidden for reduced-motion users. */
function Petals() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden" aria-hidden>
      {Array.from({ length: 14 }, (_, i) => (
        <span
          key={i}
          className="absolute -top-8 text-xl opacity-0"
          style={{
            left: `${(i * 37) % 100}%`,
            animation: `petal-fall ${7 + (i % 5)}s linear ${i * 0.6}s 2 forwards`,
          }}
        >
          {i % 3 === 0 ? '✦' : '🌸'}
        </span>
      ))}
    </div>
  )
}
