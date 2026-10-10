import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import {
  addCartLine,
  clearCartLines,
  fetchCartLines,
  removeCartLine,
  setCartLine,
  subscribeToCart,
} from '../lib/cartApi'
import { useAuth } from './AuthContext'
import { useProducts } from './ProductsContext'

const CartContext = createContext(null)
const GUEST_KEY = 'dariy-bloom:cart'
const MAX_QTY = 20

// Same line key as the web store's CartContext.
const lineKey = (productId, size) => `${productId}::${size ?? ''}`

/** Lines are { key, productId, size, quantity }; product details come from the catalogue. */
function linesReducer(lines, action) {
  switch (action.type) {
    case 'replace':
      return action.lines.map((l) => ({ ...l, key: lineKey(l.productId, l.size) }))
    case 'add': {
      const key = lineKey(action.productId, action.size)
      if (lines.some((l) => l.key === key)) {
        return lines.map((l) => (l.key === key ? { ...l, quantity: Math.min(l.quantity + action.quantity, MAX_QTY) } : l))
      }
      return [...lines, { key, productId: action.productId, size: action.size, quantity: Math.min(action.quantity, MAX_QTY) }]
    }
    case 'setQuantity':
      return action.quantity <= 0
        ? lines.filter((l) => l.key !== action.key)
        : lines.map((l) => (l.key === action.key ? { ...l, quantity: Math.min(action.quantity, MAX_QTY) } : l))
    case 'remove':
      return lines.filter((l) => l.key !== action.key)
    case 'clear':
      return []
    default:
      return lines
  }
}

const readGuestCart = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(GUEST_KEY))
    return Array.isArray(parsed)
      ? parsed.filter((l) => l?.productId && l.quantity > 0).map(({ productId, size, quantity }) => ({ productId, size, quantity }))
      : []
  } catch {
    return []
  }
}

const writeGuestCart = (lines) => {
  try {
    if (lines.length) localStorage.setItem(GUEST_KEY, JSON.stringify(lines))
    else localStorage.removeItem(GUEST_KEY)
  } catch {
    // storage unavailable — the cart still works in memory
  }
}

/**
 * Cart state.
 *  - Guest: kept on this device only (like the web store today).
 *  - Signed in: stored in Supabase `cart_items` and kept live with Realtime,
 *    so it matches the customer's cart on every other device. Any guest
 *    items are merged into the account cart on sign-in.
 */
export function CartProvider({ children }) {
  const { user, loading: authLoading } = useAuth()
  const { products } = useProducts()
  const userId = user?.id ?? null

  const [lines, dispatch] = useReducer(linesReducer, undefined, () => linesReducer([], { type: 'replace', lines: readGuestCart() }))
  const [mode, setMode] = useState('guest') // guest | syncing | synced
  const [syncError, setSyncError] = useState('')
  const userIdRef = useRef(userId)
  userIdRef.current = userId

  const refresh = useCallback(async () => {
    const id = userIdRef.current
    if (!id) return
    try {
      const serverLines = await fetchCartLines()
      if (userIdRef.current === id) {
        dispatch({ type: 'replace', lines: serverLines })
        setSyncError('')
      }
    } catch (err) {
      setSyncError(err.message)
    }
  }, [])

  // Switch between the guest cart and the account cart when auth changes.
  useEffect(() => {
    if (authLoading) return
    if (!userId) {
      setMode('guest')
      dispatch({ type: 'replace', lines: readGuestCart() })
      return
    }

    let cancelled = false
    setMode('syncing')
    ;(async () => {
      const guestLines = readGuestCart()
      try {
        for (const l of guestLines) await addCartLine(l.productId, l.size, l.quantity)
        writeGuestCart([])
      } catch (err) {
        setSyncError(err.message)
      }
      if (cancelled) return
      await refresh()
      if (!cancelled) setMode('synced')
    })()

    const unsubscribe = subscribeToCart(userId, refresh)
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [userId, authLoading, refresh])

  // Guests: persist on this device.
  useEffect(() => {
    if (mode === 'guest' && !authLoading) writeGuestCart(lines.map(({ productId, size, quantity }) => ({ productId, size, quantity })))
  }, [lines, mode, authLoading])

  /** Apply locally right away, then push to Supabase; re-fetch if the server disagrees. */
  const push = useCallback(
    (action, remote) => {
      dispatch(action)
      if (!userIdRef.current) return
      remote().catch((err) => {
        setSyncError(err.message)
        refresh()
      })
    },
    [refresh],
  )

  const findLine = useCallback((key) => lines.find((l) => l.key === key), [lines])

  const addItem = useCallback(
    (product, { size, quantity = 1 } = {}) =>
      push({ type: 'add', productId: product.id, size, quantity }, () => addCartLine(product.id, size, quantity)),
    [push],
  )
  const setQuantity = useCallback(
    (key, quantity) => {
      const line = findLine(key)
      if (line) push({ type: 'setQuantity', key, quantity }, () => setCartLine(line.productId, line.size, quantity))
    },
    [findLine, push],
  )
  const removeItem = useCallback(
    (key) => {
      const line = findLine(key)
      if (line) push({ type: 'remove', key }, () => removeCartLine(line.productId, line.size))
    },
    [findLine, push],
  )
  const clearCart = useCallback(() => push({ type: 'clear' }, clearCartLines), [push])

  const value = useMemo(() => {
    const byId = new Map(products.map((p) => [p.id, p]))
    // Same item shape as the web store's cart, so order items match.
    const items = lines.map((l) => {
      const p = byId.get(l.productId)
      return {
        key: l.key,
        productId: l.productId,
        slug: p?.slug ?? l.productId,
        name: p?.name ?? l.productId,
        price: p?.price ?? 0,
        image: p?.images?.[0],
        size: l.size,
        quantity: l.quantity,
        available: Boolean(p),
      }
    })
    return {
      items,
      itemCount: items.reduce((n, i) => n + i.quantity, 0),
      subtotal: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      synced: mode === 'synced',
      syncing: mode === 'syncing',
      syncError,
      refresh,
      addItem,
      setQuantity,
      removeItem,
      clearCart,
    }
  }, [lines, products, mode, syncError, refresh, addItem, setQuantity, removeItem, clearCart])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
