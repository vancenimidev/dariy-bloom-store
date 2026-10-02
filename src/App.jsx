import { Outlet, Route, Routes } from 'react-router-dom'
import CartDrawer from './components/CartDrawer'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import ScrollManager from './components/ScrollManager'
import Checkout from './pages/Checkout'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import OrderSuccess from './pages/OrderSuccess'
import ProductDetail from './pages/ProductDetail'
import Shop from './pages/Shop'

function Layout() {
  return (
    <div className="flex min-h-svh flex-col">
      <ScrollManager />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="product/:slug" element={<ProductDetail />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="order/:reference" element={<OrderSuccess />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
