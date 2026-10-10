import { router } from 'expo-router'
import { useState } from 'react'
import { ScrollView, Text } from 'react-native'
import { Button, Field, Heading } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { colors } from '../theme'

export default function Account() {
  const { enabled, user, sendCode, verifyCode, signOut } = useAuth()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState('email') // email | code
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const run = async (fn) => {
    setBusy(true)
    setError('')
    try {
      await fn()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (!enabled) {
    return (
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text>Accounts are turned off because Supabase isn't configured in mobile/.env.</Text>
      </ScrollView>
    )
  }

  if (user) {
    return (
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Heading>Hi there</Heading>
        <Text style={{ color: colors.cocoa700, marginVertical: 12 }}>
          Signed in as {user.email}. Your bag is saved to your account and stays in sync on every device.
        </Text>
        <Button title="Sign out" variant="secondary" onPress={() => run(signOut)} loading={busy} />
      </ScrollView>
    )
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
      <Heading>Sign in</Heading>
      <Text style={{ color: colors.cocoa700, marginVertical: 12 }}>
        We'll email you a 6-digit code. Anything already in your bag comes with you.
      </Text>
      {step === 'email' ? (
        <>
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            placeholder="you@example.com"
          />
          <Button
            title="Email me a code"
            loading={busy}
            disabled={!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())}
            onPress={() => run(async () => {
              await sendCode(email.trim())
              setStep('code')
            })}
          />
        </>
      ) : (
        <>
          <Field
            label={`Code sent to ${email.trim()}`}
            value={code}
            onChangeText={(t) => setCode(t.replace(/\D/g, ''))}
            keyboardType="number-pad"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="123456"
          />
          <Button
            title="Sign in"
            loading={busy}
            disabled={code.length !== 6}
            onPress={() => run(async () => {
              await verifyCode(email.trim(), code)
              router.back()
            })}
          />
          <Button title="Use a different email" variant="secondary" style={{ marginTop: 10 }} onPress={() => setStep('email')} />
        </>
      )}
      {error ? <Text style={{ color: colors.danger, marginTop: 12 }}>{error}</Text> : null}
    </ScrollView>
  )
}
