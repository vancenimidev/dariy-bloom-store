import { getRandomValues } from 'expo-crypto'
import './storage'

// The web store's generateOrderRef() uses crypto.getRandomValues, which
// React Native doesn't provide globally.
if (typeof globalThis.crypto?.getRandomValues !== 'function') {
  globalThis.crypto = { ...globalThis.crypto, getRandomValues }
}
