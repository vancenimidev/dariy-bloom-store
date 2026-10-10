import { Stack, router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { Pressable, Text } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider } from '../context/AuthContext'
import { CartProvider, useCart } from '../context/CartContext'
import { ProductsProvider } from '../context/ProductsContext'
import { colors, fonts } from '../theme'

function CartButton() {
  const { itemCount } = useCart()
  return (
    <Pressable accessibilityLabel={`Bag, ${itemCount} items`} onPress={() => router.push('/cart')} style={{ paddingHorizontal: 8 }}>
      <Text style={{ color: colors.cocoa900, fontSize: 15, fontWeight: '600' }}>Bag ({itemCount})</Text>
    </Pressable>
  )
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ProductsProvider>
          <CartProvider>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerStyle: { backgroundColor: colors.cream50 },
                headerTintColor: colors.cocoa900,
                headerTitleStyle: { fontFamily: fonts.display },
                contentStyle: { backgroundColor: colors.cream50 },
                headerRight: () => <CartButton />,
              }}
            >
              <Stack.Screen name="index" options={{ title: 'Dariy Bloom' }} />
              <Stack.Screen name="product/[slug]" options={{ title: '' }} />
              <Stack.Screen name="cart" options={{ title: 'Your bag', headerRight: undefined }} />
              <Stack.Screen name="checkout" options={{ title: 'Checkout', headerRight: undefined }} />
              <Stack.Screen name="account" options={{ title: 'Account' }} />
              <Stack.Screen name="order/[reference]" options={{ title: 'Order placed', headerBackVisible: false }} />
            </Stack>
          </CartProvider>
        </ProductsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  )
}
