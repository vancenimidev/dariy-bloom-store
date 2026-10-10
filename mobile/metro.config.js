const path = require('path')
const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)

// Let the app import the web store's plain-JS modules (prices, delivery rules,
// catalogue, states) from ../src so both apps share one source of truth.
config.watchFolders = [path.resolve(__dirname, '../src')]

module.exports = config
