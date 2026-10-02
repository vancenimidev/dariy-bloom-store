import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 text-5xl font-semibold text-cocoa-900">This page didn't bloom</h1>
      <p className="mt-4 max-w-sm text-cocoa-500">The page you're looking for has moved or no longer exists.</p>
      <Link to="/shop" className="btn-primary mt-8">
        Back to the collection
      </Link>
    </div>
  )
}
