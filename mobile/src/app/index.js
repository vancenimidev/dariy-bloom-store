import { Link, router } from 'expo-router'
import { FlatList, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import { BRAND } from '../../../src/lib/config'
import { formatNaira } from '../../../src/lib/format'
import { ProductImage } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useProducts } from '../context/ProductsContext'
import { colors, fonts } from '../theme'

export default function Shop() {
  const { products } = useProducts()
  const { user, enabled } = useAuth()
  const { width } = useWindowDimensions()
  const columns = width >= 900 ? 4 : width >= 600 ? 3 : 2

  return (
    <FlatList
      key={columns}
      data={products}
      numColumns={columns}
      keyExtractor={(p) => p.id}
      contentContainerStyle={{ padding: 12 }}
      ListHeaderComponent={
        <View style={styles.hero}>
          <Text style={styles.tagline}>{BRAND.tagline}</Text>
          <Text style={styles.bio}>{BRAND.bio}</Text>
          {enabled ? (
            <Link href="/account" style={styles.account}>
              {user ? `Signed in as ${user.email}` : 'Sign in to sync your bag with the website'}
            </Link>
          ) : null}
        </View>
      }
      renderItem={({ item }) => (
        <Pressable
          onPress={() => router.push(`/product/${item.slug}`)}
          style={[styles.card, { flexBasis: `${100 / columns}%`, maxWidth: `${100 / columns}%` }]}
        >
          <ProductImage uri={item.images[0]} label={item.name} style={styles.image} />
          {item.badge ? <Text style={styles.badge}>{item.badge}</Text> : null}
          <Text style={styles.name} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.price}>{formatNaira(item.price)}</Text>
        </Pressable>
      )}
    />
  )
}

const styles = StyleSheet.create({
  hero: { padding: 8, paddingBottom: 16 },
  tagline: { fontFamily: fonts.display, fontSize: 30, color: colors.cocoa900 },
  bio: { color: colors.cocoa700, marginTop: 6, lineHeight: 20 },
  account: { color: colors.gold600, marginTop: 12, fontWeight: '600' },
  card: { padding: 6, marginBottom: 12 },
  image: { width: '100%', aspectRatio: 3 / 4, borderRadius: 12 },
  badge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: colors.cream50,
    color: colors.cocoa900,
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: 'hidden',
  },
  name: { marginTop: 8, color: colors.ink, fontSize: 15 },
  price: { marginTop: 2, color: colors.cocoa700, fontWeight: '600' },
})
