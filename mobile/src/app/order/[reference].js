import { router, useLocalSearchParams } from 'expo-router'
import { ScrollView, Text } from 'react-native'
import { BANK_DETAILS, BRAND } from '../../../../src/lib/config'
import { formatNaira } from '../../../../src/lib/format'
import { Button, Heading } from '../../components/ui'
import { colors } from '../../theme'

export default function OrderSuccess() {
  const { reference, total, method, email } = useLocalSearchParams()
  const amount = Number(total)

  return (
    <ScrollView contentContainerStyle={{ padding: 24 }}>
      <Heading>Thank you! 🌸</Heading>
      <Text style={{ marginTop: 12, color: colors.cocoa700, lineHeight: 22 }}>
        Your order <Text style={{ fontWeight: '700' }}>{reference}</Text> has been received.
      </Text>
      {method === 'bank_transfer' && amount ? (
        <Text style={{ marginTop: 12, lineHeight: 22 }}>
          If you haven't already, transfer {formatNaira(amount)} to {BANK_DETAILS.bankName} · {BANK_DETAILS.accountNumber} ·{' '}
          {BANK_DETAILS.accountName}, using {reference} as the narration.
        </Text>
      ) : null}
      <Text style={{ marginTop: 12, color: colors.cocoa500 }}>
        {email === 'sent'
          ? 'A confirmation email is on its way.'
          : `We couldn't send your confirmation email, but your order is saved. Questions? ${BRAND.email}`}
      </Text>
      <Button title="Continue shopping" onPress={() => router.replace('/')} style={{ marginTop: 24 }} />
    </ScrollView>
  )
}
