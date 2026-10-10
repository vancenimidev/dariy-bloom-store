import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

/**
 * Customer sign-in with a 6-digit email code (Supabase Auth OTP). Signing in
 * is what links this device's cart to the shared cart on the web store.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(Boolean(supabase))

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => data.subscription.unsubscribe()
  }, [])

  const value = useMemo(
    () => ({
      enabled: Boolean(supabase),
      loading,
      session,
      user: session?.user ?? null,
      /** Email a one-time code. Creates the customer account on first use. */
      sendCode: async (email) => {
        const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })
        if (error) throw error
      },
      verifyCode: async (email, token) => {
        const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })
        if (error) throw error
      },
      signOut: () => supabase.auth.signOut(),
    }),
    [loading, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
