import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'dariy-bloom:cart'

const lineKey = (productId, size) => `${productId}::${size ?? ''}`

function cartReducer(items, action) {
  switch (action.type) {
    case 'add': {
      const { product, size, quantity } = action
      const key = lineKey(product.id, size)
      const existing = items.find((i) => i.key === key)
      if (existing) {
        return items.map((i) => (i.key === key ? { ...i, quantity: Math.min(i.quantity + quantity, 20) } : i))
      }
      return [
        ...items,
        {
          key,
          productId: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          image: product.images?.[0],
          size,
          quantity,
        },
      ]
    }
    case 'setQuantity':
      return action.quantity <= 0
        ? items.filter((i) => i.key !== action.key)
        : items.map((i) => (i.key === action.key ? { ...i, quantity: Math.min(action.quantity, 20) } : i))
    case 'remove':
      return items.filter((i) => i.key !== action.key)
    case 'clear':
      return []
    default:
      return items
  }
}

const loadCart = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, undefined, loadCart)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // ignore storage errors (private mode etc.)
    }
  }, [items])

  const addItem = useCallback((product, { size, quantity = 1 } = {}) => {
    dispatch({ type: 'add', product, size, quantity })
    setIsOpen(true)
  }, [])
  const setQuantity = useCallback((key, quantity) => dispatch({ type: 'setQuantity', key, quantity }), [])
  const removeItem = useCallback((key) => dispatch({ type: 'remove', key }), [])
  const clearCart = useCallback(() => dispatch({ type: 'clear' }), [])

  const value = useMemo(() => {
    const itemCount = items.reduce((n, i) => n + i.quantity, 0)
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    return {
      items,
      itemCount,
      subtotal,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem,
      setQuantity,
      removeItem,
      clearCart,
    }
  }, [items, isOpen, addItem, setQuantity, removeItem, clearCart])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
