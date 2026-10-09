import { useState } from 'react'
import BrandMark from './BrandMark'

/**
 * <img> with a branded fallback. If the local photo in /public/images is
 * missing (or fails to load), an elegant Ankara-patterned placeholder with
 * the product name is shown instead, so the layout never breaks.
 *
 * `hideOnError` renders nothing instead of the placeholder (for optional
 * extra photos); `onError` reports the failed src to the parent.
 */
export default function ProductImage({
  src,
  alt,
  className = '',
  imgClassName = '',
  label,
  loading = 'lazy',
  hideOnError = false,
  onError,
}) {
  const [failedSrc, setFailedSrc] = useState(null)
  const failed = !src || failedSrc === src

  if (failed && hideOnError) return null

  return (
    <div className={`@container relative overflow-hidden bg-cream-200 ${className}`}>
      {failed ? (
        <div className="ankara-pattern absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-cocoa-700 via-cocoa-800 to-cocoa-950 p-4 text-center">
          <BrandMark className="h-10 w-auto text-gold-300/80 @[8rem]:mb-3 @[8rem]:h-14" />
          <span className="hidden font-display text-lg leading-tight text-gold-300 italic @[8rem]:block">{label ?? alt}</span>
          <span className="mt-2 hidden text-[0.6rem] tracking-[0.3em] text-cream-50/50 uppercase @[8rem]:block">Dariy Bloom</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={loading}
          onError={() => {
            setFailedSrc(src)
            onError?.(src)
          }}
          className={`h-full w-full object-cover ${imgClassName}`}
        />
      )}
    </div>
  )
}
