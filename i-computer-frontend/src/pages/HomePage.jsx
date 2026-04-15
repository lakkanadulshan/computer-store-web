import Header from "../components/header";
import { Route, Routes } from "react-router-dom";
import LandingPage from "./LandingPage";
import ProductsPage from "./ProductsPage";
import ProductOverviewPage from "./ProductOverviewPage";
import CartPage from "./CartPage";
import CheckoutPage from "./CheckoutPage";
import SiteFooter from "../components/SiteFooter";
import ProfilePage from "./ProfilePage";
import OrdersPage from "./orders";
import AboutPage from "./AboutPage";
import ContactPage from "./ContactPage";

export default function HomePage() {
  return (
    <div className="flex h-full w-full flex-col overflow-x-hidden overflow-y-auto">
      <Header />
      <div className="w-full flex-1 bg-primary">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:productId" element={<ProductOverviewPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="/*" element={<h1>404 Not Found</h1>} />
        </Routes>
      </div>
      <SiteFooter />
    </div>
  );
}
