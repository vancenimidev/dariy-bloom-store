import { createContext, useContext, useEffect, useState } from 'react'
import { products as localProducts } from '../data/products'
import { fetchProducts } from '../lib/productsApi'

const ProductsContext = createContext({ products: localProducts, loading: false })

/**
 * Provides the catalogue. Renders the local catalogue immediately, then
 * swaps in the Supabase catalogue if one is configured and available.
 */
export function ProductsProvider({ children }) {
  const [state, setState] = useState({ products: localProducts, loading: true })

  useEffect(() => {
    let cancelled = false
    fetchProducts()
      .then((products) => !cancelled && setState({ products, loading: false }))
      .catch(() => !cancelled && setState({ products: localProducts, loading: false }))
    return () => {
      cancelled = true
    }
  }, [])

  return <ProductsContext.Provider value={state}>{children}</ProductsContext.Provider>
}

export const useProducts = () => useContext(ProductsContext)
