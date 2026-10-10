import { Link, router } from 'expo-router'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { FREE_DELIVERY_THRESHOLD, deliveryFeeFor } from '../../../src/lib/config'
import { formatNaira } from '../../../src/lib/format'
import { Button, ProductImage, QuantityStepper } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { colors } from '../theme'

export default function Cart() {
  const { items, subtotal, setQuantity, removeItem, synced, syncing, syncError } = useCart()
  const { enabled, user } = useAuth()
  const deliveryFee = deliveryFeeFor(subtotal)

  const syncNote = !enabled
    ? null
    : syncing
      ? 'Syncing your bag…'
      : synced
        ? 'Synced with your Dariy Bloom account.'
        : null

  return (
    <FlatList
      data={items}
      keyExtractor={(i) => i.key}
      contentContainerStyle={{ padding: 16 }}
      ListHeaderComponent={
        <View style={{ marginBottom: 8 }}>
          {syncNote ? <Text style={styles.note}>{syncNote}</Text> : null}
          {enabled && !user ? (
            <Link href="/account" style={styles.link}>
              Sign in to keep this bag in sync with the website
            </Link>
          ) : null}
          {syncError ? <Text style={styles.error}>Couldn't sync: {syncError}</Text> : null}
        </View>
      }
      ListEmptyComponent={
        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
          <Text style={{ color: colors.cocoa700, marginBottom: 16 }}>Your bag is empty.</Text>
          <Button title="Shop the collection" onPress={() => router.replace('/')} />
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.row}>
          <ProductImage uri={item.image} label={item.name} style={styles.thumb} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.name}>{item.name}</Text>
            {item.size ? <Text style={styles.meta}>Size {item.size}</Text> : null}
            {!item.available ? <Text style={styles.error}>No longer available</Text> : null}
            <Text style={styles.price}>{formatNaira(item.price * item.quantity)}</Text>
            <View style={styles.actions}>
              <QuantityStepper value={item.quantity} min={0} onChange={(q) => setQuantity(item.key, q)} />
              <Pressable onPress={() => removeItem(item.key)}>
                <Text style={styles.remove}>Remove</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
      ListFooterComponent={
        items.length ? (
          <View style={styles.summary}>
            <Row label="Subtotal" value={formatNaira(subtotal)} />
            <Row label="Delivery" value={deliveryFee ? formatNaira(deliveryFee) : 'Free'} />
            {deliveryFee ? (
              <Text style={styles.meta}>Free delivery on orders from {formatNaira(FREE_DELIVERY_THRESHOLD)}.</Text>
            ) : null}
            <Row label="Total" value={formatNaira(subtotal + deliveryFee)} bold />
            <Button
              title="Checkout"
              disabled={items.some((i) => !i.available)}
              onPress={() => router.push('/checkout')}
              style={{ marginTop: 16 }}
            />
          </View>
        ) : null
      }
    />
  )
}

const Row = ({ label, value, bold }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 }}>
    <Text style={[{ color: colors.cocoa700 }, bold && { fontWeight: '700', color: colors.ink }]}>{label}</Text>
    <Text style={[{ color: colors.ink }, bold && { fontWeight: '700' }]}>{value}</Text>
  </View>
)

const styles = StyleSheet.create({
  note: { color: colors.cocoa500, fontSize: 13 },
  link: { color: colors.gold600, fontWeight: '600', marginTop: 4 },
  error: { color: colors.danger, fontSize: 13, marginTop: 4 },
  row: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderColor: colors.cream300 },
  thumb: { width: 84, height: 112, borderRadius: 8 },
  name: { fontSize: 15, color: colors.ink },
  meta: { fontSize: 13, color: colors.cocoa500, marginTop: 2 },
  price: { fontWeight: '600', color: colors.cocoa700, marginTop: 4 },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  remove: { color: colors.cocoa500, textDecorationLine: 'underline' },
  summary: { marginTop: 16, padding: 16, backgroundColor: colors.cream100, borderRadius: 12 },
})
