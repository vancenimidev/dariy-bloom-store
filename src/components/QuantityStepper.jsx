import { MinusIcon, PlusIcon } from './Icons'

export default function QuantityStepper({ value, onChange, min = 1, max = 20, size = 'md', label = 'Quantity' }) {
  const sm = size === 'sm'
  const btn = `flex items-center justify-center text-cocoa-700 transition hover:bg-cream-200 hover:text-cocoa-900 disabled:opacity-30 disabled:hover:bg-transparent ${
    sm ? 'h-8 w-8' : 'h-11 w-11'
  }`
  return (
    <div
      className={`inline-flex items-center rounded-full border border-cream-300 bg-white ${sm ? 'text-sm' : ''}`}
      role="group"
      aria-label={label}
    >
      <button type="button" className={`${btn} rounded-l-full`} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Decrease quantity">
        <MinusIcon className={sm ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      </button>
      <span className={`text-center font-medium tabular-nums ${sm ? 'w-7' : 'w-10'}`} aria-live="polite">
        {value}
      </span>
      <button type="button" className={`${btn} rounded-r-full`} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity">
        <PlusIcon className={sm ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      </button>
    </div>
  )
}
