import { HeartIcon, ShieldIcon, SparkleIcon, TruckIcon } from './Icons'

const items = [
  { icon: SparkleIcon, title: 'Premium Ankara', text: 'Rich, vibrant prints chosen piece by piece.' },
  { icon: HeartIcon, title: 'Made to feel good', text: 'Comfort-first cuts that flatter every queen.' },
  { icon: TruckIcon, title: 'Nationwide delivery', text: '2–5 working days, free over ₦60,000.' },
  { icon: ShieldIcon, title: 'Pay your way', text: 'Bank transfer or pay on delivery.' },
]

export default function ValueProps() {
  return (
    <section className="border-y border-cream-300 bg-cream-100">
      <div className="container-page grid grid-cols-2 gap-x-6 gap-y-8 py-10 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:text-left">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cocoa-800 text-gold-300">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-sans text-sm font-medium tracking-wide text-cocoa-900">{title}</h3>
              <p className="mt-0.5 text-xs leading-relaxed text-cocoa-500">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
