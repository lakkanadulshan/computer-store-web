import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { getCart, emptyCart } from "../utils/cart";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  useEffect(() => {
    const cart = getCart();
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      navigate("/cart");
      return;
    }
    setCartItems(cart);
  }, [navigate]);

  const total = useMemo(
    () =>
      cartItems.reduce((sum, item) => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 1;
        return sum + price * quantity;
      }, 0),
    [cartItems]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.firstName ||
      !formData.email ||
      !formData.address ||
      !formData.city
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const backendUrl = import.meta.env.VITE_backend_URL;
      const token = localStorage.getItem("token") || localStorage.getItem(" token");
      if (!backendUrl) {
        throw new Error("Backend URL is not configured");
      }

      if (!token) {
        throw new Error("Unauthorized. Please log in again.");
      }

      const sanitizedItems = cartItems
        .map((item) => {
          const quantity = Number(item.quantity) || 1;
          const price = Number(item.price) || 0;

          return {
            productId: item.productId || item._id || item.id || null,
            name: item.name || "Unnamed product",
            price,
            quantity,
            image: item.image || item.images?.[0] || "",
            brand: item.brand || "",
            category: item.category || "",
          };
        })
        .filter((item) => item.quantity > 0);

      if (!sanitizedItems.length) {
        throw new Error("No valid items found in cart.");
      }

      const tax = total * 0.1;
      const shipping = 0;
      const finalTotal = total + tax + shipping;
      const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

      const orderPayload = {
        orderId,
        // Flat fields for backward compatibility with older backend validators
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
        date: new Date().toISOString(),
        status: "pending",
        customer: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
        },
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
        items: sanitizedItems,
        subtotal: total,
        tax,
        shipping,
        total: finalTotal,
      };

      const response = await axios.post(`${backendUrl}/orders`, orderPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 15000,
      });

      toast.success(response.data?.message || "Order placed successfully!");
      emptyCart();
      try {
        const emailKey = String(formData.email || "").toLowerCase().trim();
        if (emailKey) {
          const stored = localStorage.getItem("orderCounts");
          const counts = stored ? JSON.parse(stored) : {};
          const current = Number(counts[emailKey]) || 0;
          counts[emailKey] = current + 1;
          localStorage.setItem("orderCounts", JSON.stringify(counts));
        }
      } catch {
        // ignore localStorage errors
      }
      navigate("/");
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "";

      const isDuplicateKey = /E11000|duplicate key/i.test(String(backendMessage));

      if (isDuplicateKey) {
        const fieldMatch = String(backendMessage).match(/index:\s*([a-zA-Z0-9_]+)_/);
        const field = fieldMatch?.[1] || "a unique field";
        toast.error(`Order failed: duplicate value for ${field}. Backend must allow multiple orders per user.`);
      } else {
        const message =
          backendMessage ||
          error.message ||
          "Failed to place order. Please try again.";
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div className="w-full min-h-full bg-primary text-text">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8">
          <h1 className="font-heading text-3xl text-text">Checkout</h1>
          <p className="mt-2 text-sm text-muted">Complete your order by filling in your details below</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div className="rounded-2xl border border-white/10 bg-secondary p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">Personal Information</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First name *"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="rounded-lg border border-white/15 bg-primary px-3 py-2 outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
                  required
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="rounded-lg border border-white/15 bg-primary px-3 py-2 outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email address *"
                  value={formData.email}
                  onChange={handleChange}
                  className="rounded-lg border border-white/15 bg-primary px-3 py-2 outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 sm:col-span-2"
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  className="rounded-lg border border-white/15 bg-primary px-3 py-2 outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 sm:col-span-2"
                />
              </div>
            </div>

            {/* Shipping Address */}
            <div className="rounded-2xl border border-white/10 bg-secondary p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">Shipping Address</h2>
              <div className="grid gap-4">
                <input
                  type="text"
                  name="address"
                  placeholder="Street address *"
                  value={formData.address}
                  onChange={handleChange}
                  className="rounded-lg border border-white/15 bg-primary px-3 py-2 outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
                  required
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    type="text"
                    name="city"
                    placeholder="City *"
                    value={formData.city}
                    onChange={handleChange}
                    className="rounded-lg border border-white/15 bg-primary px-3 py-2 outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
                    required
                  />
                  <input
                    type="text"
                    name="state"
                    placeholder="State/Province"
                    value={formData.state}
                    onChange={handleChange}
                    className="rounded-lg border border-white/15 bg-primary px-3 py-2 outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    type="text"
                    name="zipCode"
                    placeholder="ZIP/Postal code"
                    value={formData.zipCode}
                    onChange={handleChange}
                    className="rounded-lg border border-white/15 bg-primary px-3 py-2 outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
                  />
                  <input
                    type="text"
                    name="country"
                    placeholder="Country"
                    value={formData.country}
                    onChange={handleChange}
                    className="rounded-lg border border-white/15 bg-primary px-3 py-2 outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-accent px-4 py-3 text-sm font-medium text-primary transition duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Processing..." : "Place Order"}
            </button>
          </form>

          {/* Order Summary */}
          <aside className="h-fit rounded-2xl border border-white/10 bg-secondary p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {cartItems.map((item) => {
                const itemKey = item._id || item.productId || item.id || item.name;
                const quantity = Number(item.quantity) || 1;
                const price = Number(item.price) || 0;
                const itemTotal = price * quantity;

                return (
                  <div key={itemKey} className="flex justify-between gap-2 border-b border-white/10 pb-3 text-sm">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted">Qty: {quantity}</p>
                    </div>
                    <p className="font-semibold">${itemTotal.toFixed(2)}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Shipping</span>
                <span>FREE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Tax</span>
                <span>${(total * 0.1).toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2 text-base font-semibold">
                <span>Total</span>
                <span>${(total * 1.1).toFixed(2)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/cart")}
              className="mt-4 w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 text-sm font-medium text-text transition duration-200 hover:bg-hover"
            >
              Back to cart
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}
