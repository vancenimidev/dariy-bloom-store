import { useState } from 'react'
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { colors, fonts } from '../theme'

export function Button({ title, onPress, disabled, loading, variant = 'primary', style }) {
  const secondary = variant === 'secondary'
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.buttonSecondary,
        (disabled || loading) && { opacity: 0.5 },
        pressed && { opacity: 0.8 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={secondary ? colors.cocoa900 : colors.cream50} />
      ) : (
        <Text style={[styles.buttonText, secondary && { color: colors.cocoa900 }]}>{title}</Text>
      )}
    </Pressable>
  )
}

export function Field({ label, error, ...props }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.cocoa300}
        style={[styles.input, error && { borderColor: colors.danger }]}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  )
}

export function Chip({ label, selected, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && { color: colors.cream50 }]}>{label}</Text>
    </Pressable>
  )
}

export function QuantityStepper({ value, onChange, min = 1, max = 20 }) {
  return (
    <View style={styles.stepper}>
      <Pressable accessibilityLabel="Decrease quantity" onPress={() => onChange(value - 1)} disabled={value <= min} style={styles.stepperBtn}>
        <Text style={styles.stepperText}>−</Text>
      </Pressable>
      <Text style={styles.stepperValue}>{value}</Text>
      <Pressable accessibilityLabel="Increase quantity" onPress={() => onChange(value + 1)} disabled={value >= max} style={styles.stepperBtn}>
        <Text style={styles.stepperText}>+</Text>
      </Pressable>
    </View>
  )
}

/** Product photo with the web store's branded placeholder fallback. */
export function ProductImage({ uri, style, label }) {
  const [failed, setFailed] = useState(false)
  if (!uri || failed) {
    return (
      <View style={[style, styles.placeholder]}>
        <Text style={styles.placeholderText}>{label ?? 'Dariy Bloom'}</Text>
      </View>
    )
  }
  return <Image source={{ uri }} style={style} resizeMode="cover" onError={() => setFailed(true)} accessibilityLabel={label} />
}

export const Heading = ({ children, style }) => <Text style={[styles.heading, style]}>{children}</Text>

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.cocoa900,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 999,
    alignItems: 'center',
  },
  buttonSecondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.cocoa900 },
  buttonText: { color: colors.cream50, fontSize: 15, fontWeight: '600', letterSpacing: 0.5 },
  label: { fontSize: 13, color: colors.cocoa700, marginBottom: 6, fontWeight: '500' },
  input: {
    borderWidth: 1,
    borderColor: colors.cream300,
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    color: colors.ink,
  },
  error: { color: colors.danger, fontSize: 12, marginTop: 4 },
  chip: {
    borderWidth: 1,
    borderColor: colors.cocoa300,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: { backgroundColor: colors.cocoa900, borderColor: colors.cocoa900 },
  chipText: { color: colors.cocoa900, fontSize: 14 },
  stepper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.cream300, borderRadius: 999 },
  stepperBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  stepperText: { fontSize: 18, color: colors.cocoa900 },
  stepperValue: { minWidth: 24, textAlign: 'center', fontSize: 15, color: colors.ink },
  placeholder: { backgroundColor: colors.cream200, alignItems: 'center', justifyContent: 'center' },
  placeholderText: { fontFamily: fonts.display, color: colors.cocoa500, fontSize: 16 },
  heading: { fontFamily: fonts.display, fontSize: 28, color: colors.cocoa900 },
})
