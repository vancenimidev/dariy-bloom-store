// Gives iOS/Android a persistent, synchronous `localStorage` (backed by SQLite),
// so the cart and Supabase session survive app restarts just like on the web.
import 'expo-sqlite/localStorage/install'
