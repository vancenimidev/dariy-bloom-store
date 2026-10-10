import { router } from 'expo-router'
import { useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native'
import { BANK_DETAILS, PAYMENT_METHODS, deliveryFeeFor } from '../../../src/lib/config'
import { formatNaira, generateOrderRef } from '../../../src/lib/format'
import { NIGERIAN_STATES } from '../../../src/data/states'
import { Button, Chip, Field, Heading } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { sendOrderConfirmation } from '../lib/email'
import { saveOrder } from '../lib/ordersApi'
import { isSupabaseConfigured } from '../lib/supabase'
import { colors } from '../theme'

const EMPTY_FORM = { name: '', email: '', phone: '', address: '', city: '', state: 'Lagos', notes: '' }

// Same rules as the web store's checkout.
function validate(form) {
  const errors = {}
  if (form.name.trim().length < 2) errors.name = 'Please enter your full name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) errors.email = 'Please enter a valid email address.'
  const phone = form.phone.replace(/[\s-]/g, '')
  if (!/^(\+?234|0)[789][01]\d{8}$/.test(phone)) errors.phone = 'Enter a valid Nigerian number, e.g. 0803 123 4567.'
  if (form.address.trim().length < 6) errors.address = 'Please enter your street address.'
  if (form.city.trim().length < 2) errors.city = 'Please enter your city or area.'
  if (!form.state) errors.state = 'Please choose a state.'
  return errors
}

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const { user } = useAuth()
  const [orderRef] = useState(generateOrderRef)
  const [form, setForm] = useState(() => ({ ...EMPTY_FORM, email: user?.email ?? '' }))
  const [touched, setTouched] = useState({})
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer')
  const [transferConfirmed, setTransferConfirmed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const deliveryFee = deliveryFeeFor(subtotal)
  const total = subtotal + deliveryFee
  const errors = validate(form)
  const errorFor = (field) => (touched[field] ? errors[field] : undefined)
  const field = (name) => ({
    value: form[name],
    onChangeText: (v) => setForm((f) => ({ ...f, [name]: v })),
    onBlur: () => setTouched((t) => ({ ...t, [name]: true })),
    error: errorFor(name),
  })

  const placeOrder = async () => {
    setTouched(Object.fromEntries(Object.keys(EMPTY_FORM).map((k) => [k, true])))
    if (Object.keys(errors).length) return setSubmitError('Please check the highlighted fields.')
    if (paymentMethod === 'bank_transfer' && !transferConfirmed) {
      return setSubmitError('Please confirm your bank transfer before placing your order.')
    }
    if (!isSupabaseConfigured) return setSubmitError('Ordering needs Supabase to be configured in mobile/.env.')
    setSubmitError('')
    setBusy(true)

    const order = {
      reference: orderRef,
      createdAt: new Date().toISOString(),
      customer: Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()])),
      paymentMethod,
      paymentStatus: paymentMethod === 'bank_transfer' ? 'awaiting_confirmation' : 'pay_on_delivery',
      items: items.map(({ productId, name, price, size, quantity, image, slug }) => ({
        productId,
        slug,
        name,
        price,
        size,
        quantity,
        image,
      })),
      subtotal,
      deliveryFee,
      total,
    }

    try {
      const { synced } = await saveOrder(order)
      if (!synced) throw new Error("We couldn't save your order. Please check your connection and try again.")
      const email = await sendOrderConfirmation(order, { synced })
      clearCart()
      router.replace({
        pathname: '/order/[reference]',
        params: { reference: order.reference, total: String(total), method: paymentMethod, email: email.status },
      })
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (!items.length) {
    return (
      <View style={{ padding: 24 }}>
        <Text style={{ marginBottom: 16 }}>Your bag is empty.</Text>
        <Button title="Shop the collection" onPress={() => router.replace('/')} />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
        <Heading style={{ fontSize: 22, marginBottom: 12 }}>Delivery details</Heading>
        <Field label="Full name" autoComplete="name" {...field('name')} />
        <Field label="Email" autoCapitalize="none" keyboardType="email-address" autoComplete="email" {...field('email')} />
        <Field label="Phone" keyboardType="phone-pad" autoComplete="tel" placeholder="0803 123 4567" {...field('phone')} />
        <Field label="Street address" autoComplete="street-address" {...field('address')} />
        <Field label="City / area" {...field('city')} />

        <Text style={styles.label}>State</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
          {NIGERIAN_STATES.map((s) => (
            <Chip key={s} label={s} selected={form.state === s} onPress={() => setForm((f) => ({ ...f, state: s }))} />
          ))}
        </ScrollView>
        <Field label="Delivery notes (optional)" multiline {...field('notes')} />

        <Heading style={{ fontSize: 22, marginVertical: 12 }}>Payment</Heading>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {Object.entries(PAYMENT_METHODS).map(([id, label]) => (
            <Chip key={id} label={label} selected={paymentMethod === id} onPress={() => setPaymentMethod(id)} />
          ))}
        </View>
        {paymentMethod === 'bank_transfer' ? (
          <View style={styles.bank}>
            <Text style={styles.bankText}>
              Transfer {formatNaira(total)} to {BANK_DETAILS.bankName}, {BANK_DETAILS.accountNumber} ({BANK_DETAILS.accountName}).
              Use {orderRef} as the narration.
            </Text>
            <Chip
              label={transferConfirmed ? '✓ I have sent the transfer' : 'I have sent the transfer'}
              selected={transferConfirmed}
              onPress={() => setTransferConfirmed((v) => !v)}
            />
          </View>
        ) : (
          <Text style={styles.bankText}>Please have {formatNaira(total)} ready when your order arrives.</Text>
        )}

        <View style={styles.summary}>
          <Text style={styles.total}>Total {formatNaira(total)}</Text>
          <Text style={{ color: colors.cocoa500 }}>
            {formatNaira(subtotal)} + {deliveryFee ? `${formatNaira(deliveryFee)} delivery` : 'free delivery'}
          </Text>
        </View>
        {submitError ? <Text style={styles.error}>{submitError}</Text> : null}
        <Button title="Place order" onPress={placeOrder} loading={busy} />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  label: { fontSize: 13, color: colors.cocoa700, marginBottom: 6, fontWeight: '500' },
  bank: { backgroundColor: colors.gold100, padding: 14, borderRadius: 12, marginTop: 4 },
  bankText: { color: colors.cocoa900, lineHeight: 20, marginBottom: 10 },
  summary: { marginVertical: 16 },
  total: { fontSize: 18, fontWeight: '700', color: colors.ink },
  error: { color: colors.danger, marginBottom: 12 },
})
