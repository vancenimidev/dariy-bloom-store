import { Stack, router, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import { formatNaira } from '../../../../src/lib/format'
import { Button, Chip, Heading, ProductImage, QuantityStepper } from '../../components/ui'
import { useCart } from '../../context/CartContext'
import { useProducts } from '../../context/ProductsContext'
import { colors } from '../../theme'

export default function ProductDetail() {
  const { slug } = useLocalSearchParams()
  const { products, loading } = useProducts()
  const { addItem } = useCart()
  const { width } = useWindowDimensions()
  const product = products.find((p) => p.slug === slug)
  const [size, setSize] = useState()
  const [quantity, setQuantity] = useState(1)
  const [sizeError, setSizeError] = useState(false)

  if (!product) {
    return (
      <View style={{ padding: 24 }}>
        <Text>{loading ? 'Loading…' : 'This piece is no longer available.'}</Text>
      </View>
    )
  }

  const onAdd = () => {
    if (product.sizes.length && !size) return setSizeError(true)
    addItem(product, { size, quantity })
    router.push('/cart')
  }

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
      <Stack.Screen options={{ title: product.name }} />
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
        {(product.images.length ? product.images : [null]).map((uri, i) => (
          <ProductImage key={uri ?? i} uri={uri} label={product.name} style={{ width: Math.min(width, 700), aspectRatio: 3 / 4 }} />
        ))}
      </ScrollView>
      <View style={{ padding: 20 }}>
        <Heading>{product.name}</Heading>
        <Text style={styles.price}>{formatNaira(product.price)}</Text>
        {product.tagline ? <Text style={styles.tagline}>{product.tagline}</Text> : null}
        <Text style={styles.body}>{product.description}</Text>

        {product.sizes.length ? (
          <>
            <Text style={styles.section}>Size</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {product.sizes.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  selected={size === s}
                  onPress={() => {
                    setSize(s)
                    setSizeError(false)
                  }}
                />
              ))}
            </View>
            {sizeError ? <Text style={styles.error}>Please choose a size.</Text> : null}
          </>
        ) : null}

        <Text style={styles.section}>Quantity</Text>
        <View style={{ flexDirection: 'row' }}>
          <QuantityStepper value={quantity} onChange={setQuantity} />
        </View>

        <Button title="Add to bag" onPress={onAdd} style={{ marginTop: 24 }} />

        {product.details?.length ? (
          <>
            <Text style={styles.section}>Details</Text>
            {product.details.map((d) => (
              <Text key={d} style={styles.body}>
                • {d}
              </Text>
            ))}
          </>
        ) : null}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  price: { fontSize: 18, color: colors.cocoa700, fontWeight: '600', marginTop: 6 },
  tagline: { fontStyle: 'italic', color: colors.cocoa500, marginTop: 10 },
  body: { color: colors.ink, lineHeight: 22, marginTop: 8 },
  section: { marginTop: 20, marginBottom: 8, fontWeight: '600', color: colors.cocoa900 },
  error: { color: colors.danger, fontSize: 12 },
})
