import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ProductDetails from '../pages/ProductDetails';
import CartPage from '../pages/CartPage';
import WishlistPage from '../pages/WishlistPage';
import CheckoutPage from '../pages/CheckoutPage';
import OrderSuccessPage from '../pages/OrderSuccessPage';
import MyOrdersPage from '../pages/MyOrdersPage';
import OrderDetailsPage from '../pages/OrderDetailsPage';
import Profile from '../pages/Profile';
import AdminProductsPage from '../pages/AdminProductsPage';
import AdminCategoriesPage from '../pages/AdminCategoriesPage';
import AdminUsersPage from '../pages/AdminUsersPage';
import AnalyticsDashboard from '../pages/AnalyticsDashboard';
import NotFound from '../pages/NotFound';
import Forbidden403 from '../pages/Forbidden403';
import ServerError500 from '../pages/ServerError500';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="products/:id" element={<ProductDetails />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="wishlist" element={<WishlistPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="order-success/:orderId" element={<OrderSuccessPage />} />
        <Route path="orders" element={<MyOrdersPage />} />
        <Route path="orders/:orderId" element={<OrderDetailsPage />} />
        <Route path="profile" element={<Profile />} />
        <Route path="admin" element={<AnalyticsDashboard />} />
        <Route path="admin/analytics" element={<AnalyticsDashboard />} />
        <Route path="admin/products" element={<AdminProductsPage />} />
        <Route path="admin/categories" element={<AdminCategoriesPage />} />
        <Route path="admin/users" element={<AdminUsersPage />} />
        <Route path="403" element={<Forbidden403 />} />
        <Route path="500" element={<ServerError500 />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
