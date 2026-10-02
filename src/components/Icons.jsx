const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

const make = (paths) =>
  function Icon({ className = 'h-5 w-5', ...props }) {
    return (
      <svg viewBox="0 0 24 24" className={className} {...base} {...props}>
        {paths}
      </svg>
    )
  }

export const BagIcon = make(
  <>
    <path d="M5 8h14l-1.2 11.1a2 2 0 0 1-2 1.9H8.2a2 2 0 0 1-2-1.9L5 8Z" />
    <path d="M9 10V6.5a3 3 0 0 1 6 0V10" />
  </>,
)
export const CloseIcon = make(<path d="M6 6l12 12M18 6 6 18" />)
export const MenuIcon = make(<path d="M4 7h16M4 12h16M4 17h10" />)
export const PlusIcon = make(<path d="M12 5v14M5 12h14" />)
export const MinusIcon = make(<path d="M5 12h14" />)
export const TrashIcon = make(
  <>
    <path d="M4 7h16M10 11v6M14 11v6" />
    <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
  </>,
)
export const ArrowRightIcon = make(<path d="M5 12h14M13 6l6 6-6 6" />)
export const ArrowLeftIcon = make(<path d="M19 12H5M11 6l-6 6 6 6" />)
export const CheckIcon = make(<path d="M5 12.5l4.5 4.5L19 7.5" />)
export const TruckIcon = make(
  <>
    <path d="M3 6h11v10H3zM14 10h4l3 3v3h-7" />
    <circle cx="7" cy="17.5" r="1.8" />
    <circle cx="17" cy="17.5" r="1.8" />
  </>,
)
export const BankIcon = make(
  <>
    <path d="M3 10h18L12 4 3 10ZM5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18" />
  </>,
)
export const CashIcon = make(
  <>
    <rect x="3" y="6" width="18" height="12" rx="2" />
    <circle cx="12" cy="12" r="2.5" />
    <path d="M6.5 9.5v.01M17.5 14.5v.01" />
  </>,
)
export const CopyIcon = make(
  <>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V6a2 2 0 0 1 2-2h8" />
  </>,
)
export const MailIcon = make(
  <>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m4 7 8 6 8-6" />
  </>,
)
export const SparkleIcon = make(
  <path d="M12 3c.6 4.2 2.8 6.4 7 7-4.2.6-6.4 2.8-7 7-.6-4.2-2.8-6.4-7-7 4.2-.6 6.4-2.8 7-7Z" />,
)
export const ShieldIcon = make(
  <>
    <path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6l-7-3Z" />
    <path d="m9 12 2 2 4-4" />
  </>,
)
export const HeartIcon = make(
  <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />,
)
export const InstagramIcon = make(
  <>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <path d="M17.5 6.5v.01" />
  </>,
)
export const PhoneIcon = make(
  <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />,
)
