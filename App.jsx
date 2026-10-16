
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import CreateStore from './pages/CreateStore';
import Dashboard from './pages/Dashboard';
import ManageProducts from './pages/ManageProducts';
import Storefront from './pages/Storefront';
import ProductDetail from './pages/ProductDetail';
import Orders from './pages/Orders';
import Catalog from './pages/Catalog';
import Shops from './pages/Shops';
import Cart from './pages/Cart';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/discover" element={<Catalog />} />
        <Route path="/category/:category" element={<Catalog />} />
        <Route path="/shops" element={<Shops />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
         <Route path="/create-store" element={<CreateStore />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<ManageProducts />} />
        <Route path="/store/:slug" element={<Storefront />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/seller/orders" element={<Orders seller />} />

      </Routes>
    </BrowserRouter>
  );
}
