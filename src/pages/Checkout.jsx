import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeftIcon, BagIcon, BankIcon, CashIcon, CheckIcon, CopyIcon, ShieldIcon } from '../components/Icons'
import ProductImage from '../components/ProductImage'
import { useCart } from '../context/CartContext'
import { BANK_DETAILS, deliveryFeeFor } from '../lib/config'
import { sendOrderConfirmation } from '../lib/email'
import { formatNaira, generateOrderRef } from '../lib/format'
import { saveOrder, saveOrderLocally } from '../lib/ordersApi'
import { NIGERIAN_STATES } from '../data/states'

const EMPTY_FORM = { name: '', email: '', phone: '', address: '', city: '', state: 'Lagos', notes: '' }

function validate(form) {
  const errors = {}
  if (form.name.trim().length < 2) errors.name = 'Please enter your full name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) errors.email = 'Please enter a valid email address.'
  const phone = form.phone.replace(/[\s-]/g, '')
  if (!/^(\+?234|0)[789][01]\d{8}$/.test(phone)) errors.phone = 'Enter a valid Nigerian number, e.g. 0803 123 4567.'
  if (form.address.trim().length < 6) errors.address = 'Please enter your street address.'
  if (form.city.trim().length < 2) errors.city = 'Please enter your city or area.'
  if (!form.state) errors.state = 'Please choose a state.'
  return errors
}

export default function Checkout() {
  const { items, subtotal, clearCart, setQuantity, removeItem } = useCart()
  const navigate = useNavigate()
  const [orderRef] = useState(generateOrderRef)
  const [form, setForm] = useState(EMPTY_FORM)
  const [touched, setTouched] = useState({})
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer')
  const [transferConfirmed, setTransferConfirmed] = useState(false)
  const [status, setStatus] = useState('idle') // idle | saving | emailing
  const [submitError, setSubmitError] = useState('')

  const deliveryFee = deliveryFeeFor(subtotal)
  const total = subtotal + deliveryFee
  const errors = validate(form)
  const showError = (field) => touched[field] && errors[field]
  const busy = status !== 'idle'
  const canPlace = paymentMethod !== 'bank_transfer' || transferConfirmed

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  const onBlur = (e) => setTouched((t) => ({ ...t, [e.target.name]: true }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched(Object.fromEntries(Object.keys(EMPTY_FORM).map((k) => [k, true])))
    if (Object.keys(errors).length) {
      document.querySelector('[aria-invalid="true"]')?.focus()
      return
    }
    if (!canPlace) {
      setSubmitError('Please confirm your bank transfer before placing your order.')
      return
    }
    setSubmitError('')

    const order = {
      reference: orderRef,
      createdAt: new Date().toISOString(),
      customer: Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()])),
      paymentMethod,
      paymentStatus: paymentMethod === 'bank_transfer' ? 'awaiting_confirmation' : 'pay_on_delivery',
      items: items.map(({ productId, name, price, size, quantity, image, slug }) => ({
        productId,
        slug,
        name,
        price,
        size,
        quantity,
        image,
      })),
      subtotal,
      deliveryFee,
      total,
    }

    try {
      setStatus('saving')
      const { synced } = await saveOrder(order)
      setStatus('emailing')
      const email = await sendOrderConfirmation(order)
      const completed = { ...order, synced, emailStatus: email.status }
      saveOrderLocally(completed)
      navigate(`/order/${order.reference}`, { replace: true, state: { order: completed } })
      clearCart()
    } catch (err) {
      console.error(err)
      setSubmitError('Something went wrong placing your order. Please try again.')
      setStatus('idle')
    }
  }

  if (items.length === 0 && !busy) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-cream-200 text-gold-600">
          <BagIcon className="h-9 w-9" />
        </div>
        <h1 className="text-4xl font-semibold text-cocoa-900">Your bag is empty</h1>
        <p className="mt-3 text-cocoa-500">Add a piece or two before heading to checkout.</p>
        <Link to="/shop" className="btn-primary mt-8">
          Shop the collection
        </Link>
      </div>
    )
  }

  return (
    <div className="container-page py-10 sm:py-14">
      <Link to="/shop" className="inline-flex items-center gap-1.5 text-xs tracking-[0.15em] text-cocoa-500 uppercase hover:text-cocoa-900">
        <ArrowLeftIcon className="h-3.5 w-3.5" /> Continue shopping
      </Link>
      <h1 className="mt-4 text-4xl font-semibold text-cocoa-900 sm:text-5xl">Checkout</h1>
      <Steps paymentMethod={paymentMethod} />

      <form onSubmit={handleSubmit} noValidate className="mt-10 grid gap-10 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-7">
          <Card step="1" title="Contact details">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full name" name="name" autoComplete="name" placeholder="Adaeze Okafor" className="sm:col-span-2" {...{ form, onChange, onBlur, showError }} />
              <Field label="Email" name="email" type="email" autoComplete="email" placeholder="you@example.com" {...{ form, onChange, onBlur, showError }} />
              <Field label="Phone number" name="phone" type="tel" autoComplete="tel" placeholder="0803 123 4567" {...{ form, onChange, onBlur, showError }} />
            </div>
          </Card>

          <Card step="2" title="Delivery address">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Street address" name="address" autoComplete="street-address" placeholder="12 Admiralty Way, Lekki Phase 1" className="sm:col-span-2" {...{ form, onChange, onBlur, showError }} />
              <Field label="City / Area" name="city" autoComplete="address-level2" placeholder="Lekki" {...{ form, onChange, onBlur, showError }} />
              <div>
                <label htmlFor="state" className="field-label">State</label>
                <select id="state" name="state" value={form.state} onChange={onChange} onBlur={onBlur} className="field-input" autoComplete="address-level1">
                  {NIGERIAN_STATES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="notes" className="field-label">
                  Delivery notes <span className="tracking-normal text-cocoa-400 normal-case">(optional)</span>
                </label>
                <textarea id="notes" name="notes" rows={2} value={form.notes} onChange={onChange} className="field-input resize-none" placeholder="Landmark, gate code, best time to call…" />
              </div>
            </div>
          </Card>

          <Card step="3" title="Payment">
            <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Payment method">
              <PaymentOption
                id="bank_transfer"
                icon={BankIcon}
                title="Bank Transfer"
                text="Transfer to our account"
                selected={paymentMethod === 'bank_transfer'}
                onSelect={setPaymentMethod}
              />
              <PaymentOption
                id="pay_on_delivery"
                icon={CashIcon}
                title="Pay on Delivery"
                text="Cash or transfer on arrival"
                selected={paymentMethod === 'pay_on_delivery'}
                onSelect={setPaymentMethod}
              />
            </div>

            {paymentMethod === 'bank_transfer' ? (
              <BankTransferPanel
                total={total}
                orderRef={orderRef}
                confirmed={transferConfirmed}
                onConfirm={() => {
                  setTransferConfirmed((c) => !c)
                  setSubmitError('')
                }}
              />
            ) : (
              <div className="mt-5 animate-fade-in rounded-2xl border border-cream-300 bg-cream-100 p-5 text-sm leading-relaxed text-cocoa-700">
                <p className="font-medium text-cocoa-900">Pay when your order arrives 🚚</p>
                <p className="mt-1.5">
                  Please have <strong>{formatNaira(total)}</strong> ready in cash, or transfer to our rider on delivery. We'll call
                  you on your phone number to confirm before dispatch.
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Summary */}
        <aside className="lg:col-span-5">
          <div className="rounded-3xl border border-cream-300 bg-white p-6 shadow-[0_20px_60px_-30px_rgb(59_36_20_/_0.35)] sm:p-8 lg:sticky lg:top-32">
            <div className="flex items-baseline justify-between">
              <h2 className="text-2xl font-semibold text-cocoa-900">Order summary</h2>
              <span className="text-xs tracking-[0.15em] text-cocoa-400 uppercase">{orderRef}</span>
            </div>
            <ul className="mt-6 max-h-80 divide-y divide-cream-200 overflow-y-auto pr-1">
              {items.map((item) => (
                <li key={item.key} className="flex gap-4 py-4 first:pt-0">
                  <div className="relative shrink-0">
                    <ProductImage src={item.image} alt={item.name} className="h-20 w-16 rounded-lg" />
                    <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-cocoa-800 px-1 text-[0.65rem] font-medium text-cream-50">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-lg leading-tight text-cocoa-900">{item.name}</p>
                    {item.size && <p className="text-xs text-cocoa-500">Size {item.size}</p>}
                    <div className="mt-1.5 flex gap-3 text-xs">
                      <button type="button" disabled={busy} onClick={() => setQuantity(item.key, item.quantity - 1)} className="text-cocoa-500 hover:text-cocoa-900">−1</button>
                      <button type="button" disabled={busy} onClick={() => setQuantity(item.key, item.quantity + 1)} className="text-cocoa-500 hover:text-cocoa-900">+1</button>
                      <button type="button" disabled={busy} onClick={() => removeItem(item.key)} className="text-cocoa-500 hover:text-red-700">Remove</button>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-cocoa-900">{formatNaira(item.price * item.quantity)}</p>
                </li>
              ))}
            </ul>

            <dl className="mt-6 space-y-3 border-t border-cream-200 pt-6 text-sm">
              <div className="flex justify-between text-cocoa-600">
                <dt>Subtotal</dt>
                <dd className="text-cocoa-900">{formatNaira(subtotal)}</dd>
              </div>
              <div className="flex justify-between text-cocoa-600">
                <dt>Delivery</dt>
                <dd className="text-cocoa-900">{deliveryFee ? formatNaira(deliveryFee) : <span className="text-gold-700">Free</span>}</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-cream-200 pt-4">
                <dt className="text-sm tracking-[0.15em] text-cocoa-700 uppercase">Total</dt>
                <dd className="font-display text-3xl font-semibold text-cocoa-900">{formatNaira(total)}</dd>
              </div>
            </dl>

            {submitError && (
              <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
                {submitError}
              </p>
            )}

            <button type="submit" disabled={busy} className="btn-gold mt-6 w-full">
              {busy ? (
                <>
                  <Spinner /> {status === 'saving' ? 'Placing order…' : 'Sending confirmation…'}
                </>
              ) : (
                <>Place order · {formatNaira(total)}</>
              )}
            </button>
            {!canPlace && !busy && (
              <p className="mt-3 text-center text-xs text-cocoa-500">Confirm your bank transfer above to place your order.</p>
            )}
            <p className="mt-4 flex items-center justify-center gap-2 text-xs text-cocoa-400">
              <ShieldIcon className="h-4 w-4" /> Your details are only used to deliver your order.
            </p>
          </div>
        </aside>
      </form>
    </div>
  )
}

function Steps({ paymentMethod }) {
  const steps = ['Details', 'Delivery', paymentMethod === 'bank_transfer' ? 'Transfer' : 'Pay on delivery']
  return (
    <ol className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs tracking-[0.15em] text-cocoa-500 uppercase">
      {steps.map((s, i) => (
        <li key={s} className="flex items-center gap-3">
          <span className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cocoa-800 text-[0.65rem] text-gold-300">{i + 1}</span>
            {s}
          </span>
          {i < steps.length - 1 && <span className="h-px w-6 bg-cream-300 sm:w-10" />}
        </li>
      ))}
    </ol>
  )
}

function Card({ step, title, children }) {
  return (
    <section className="rounded-3xl border border-cream-300 bg-white p-6 sm:p-8">
      <h2 className="mb-6 flex items-center gap-3 text-2xl font-semibold text-cocoa-900">
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gold-400 font-sans text-sm font-medium text-gold-700">
          {step}
        </span>
        {title}
      </h2>
      {children}
    </section>
  )
}

function Field({ label, name, form, onChange, onBlur, showError, className = '', type = 'text', ...rest }) {
  const error = showError(name)
  return (
    <div className={className}>
      <label htmlFor={name} className="field-label">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={form[name]}
        onChange={onChange}
        onBlur={onBlur}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`field-input ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-200/60' : ''}`}
        {...rest}
      />
      {error && (
        <p id={`${name}-error`} className="field-error">
          {error}
        </p>
      )}
    </div>
  )
}

function PaymentOption({ id, icon: Icon, title, text, selected, onSelect }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(id)}
      className={`flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition ${
        selected ? 'border-gold-500 bg-gold-100/50' : 'border-cream-300 hover:border-cocoa-300'
      }`}
    >
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${selected ? 'bg-cocoa-800 text-gold-300' : 'bg-cream-200 text-cocoa-600'}`}>
        <Icon className="h-5 w-5" />
      </span>
      <span className="flex-1">
        <span className="block font-medium text-cocoa-900">{title}</span>
        <span className="block text-xs text-cocoa-500">{text}</span>
      </span>
      <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${selected ? 'border-gold-600 bg-gold-500' : 'border-cream-300'}`}>
        {selected && <CheckIcon className="h-3 w-3 text-cocoa-950" strokeWidth={3} />}
      </span>
    </button>
  )
}

function BankTransferPanel({ total, orderRef, confirmed, onConfirm }) {
  const rows = [
    ['Bank', BANK_DETAILS.bankName],
    ['Account name', BANK_DETAILS.accountName],
    ['Account number', BANK_DETAILS.accountNumber, true],
    ['Amount', formatNaira(total), true],
    ['Narration / reference', orderRef, true],
  ]
  return (
    <div className="mt-5 animate-fade-in overflow-hidden rounded-2xl bg-cocoa-900 text-cream-100">
      <div className="ankara-pattern p-5 sm:p-6">
        <p className="eyebrow text-gold-400">Transfer details</p>
        <dl className="mt-4 divide-y divide-cream-50/10">
          {rows.map(([label, value, copyable]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-xs text-cream-200/60">{label}</dt>
              <dd className="flex items-center gap-2 text-right font-medium text-cream-50">
                <span className={label === 'Account number' ? 'font-display text-xl tracking-widest text-gold-300' : ''}>{value}</span>
                {copyable && <CopyButton value={label === 'Amount' ? String(total) : value} label={label} />}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-xs leading-relaxed text-cream-200/60">
          Demo account — no real payment is taken. Use your order reference as the narration so we can match your payment.
        </p>
      </div>
      <button
        type="button"
        onClick={onConfirm}
        aria-pressed={confirmed}
        className={`flex w-full items-center justify-center gap-2 px-6 py-4 text-sm font-medium tracking-[0.12em] uppercase transition ${
          confirmed ? 'bg-emerald-700 text-white hover:bg-emerald-800' : 'bg-gold-500 text-cocoa-950 hover:bg-gold-400'
        }`}
      >
        {confirmed ? (
          <>
            <CheckIcon className="h-4 w-4" strokeWidth={2.5} /> Transfer confirmed
          </>
        ) : (
          <>I've made the transfer</>
        )}
      </button>
    </div>
  )
}

function CopyButton({ value, label }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value)
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        } catch {
          // Clipboard not available (e.g. insecure context) — ignore.
        }
      }}
      className="rounded-md p-1.5 text-cream-200/60 transition hover:bg-cream-50/10 hover:text-gold-300"
      aria-label={`Copy ${label}`}
    >
      {copied ? <CheckIcon className="h-4 w-4 text-gold-300" /> : <CopyIcon className="h-4 w-4" />}
    </button>
  )
}

function Spinner() {
  return <span className="h-4 w-4 animate-spin rounded-full border-2 border-cocoa-950/30 border-t-cocoa-950" aria-hidden />
}
