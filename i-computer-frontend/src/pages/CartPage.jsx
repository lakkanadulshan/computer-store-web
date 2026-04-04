import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { emptyCart, getCart, updateCartQuantity } from "../utils/cart";

export default function CartPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const syncCart = () => setCartItems(getCart());

    syncCart();
    window.addEventListener("cart-updated", syncCart);

    return () => window.removeEventListener("cart-updated", syncCart);
  }, []);

  const total = useMemo(
    () =>
      cartItems.reduce((sum, item) => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 1;
        return sum + price * quantity;
      }, 0),
    [cartItems],
  );

  const handleEmptyCart = () => {
    emptyCart();
    setCartItems([]);
    toast.success("Cart cleared.");
  };

  const handleUpdateQuantity = (item, nextQuantity) => {
    const itemKey = item._id || item.productId || item.id || item.name;
    const quantity = Number(nextQuantity);

    if (Number.isNaN(quantity)) return;

    const updatedCart = updateCartQuantity(itemKey, quantity);
    setCartItems(updatedCart);

    if (quantity <= 0) {
      toast.success("Item removed from cart.");
      return;
    }

    toast.success("Quantity updated.");
  };

  return (
    <div className="w-full min-h-full bg-primary text-text">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl text-text">Your Cart</h1>
            <p className="text-sm text-muted">Review the items you added before checkout.</p>
          </div>
          <button
            type="button"
            onClick={handleEmptyCart}
            disabled={cartItems.length === 0}
            className="rounded-lg border border-white/15 bg-secondary px-4 py-2 text-sm font-medium text-text transition duration-200 hover:bg-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            Empty cart
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-secondary p-8 text-center shadow-sm">
            <p className="text-lg font-semibold">Your cart is empty.</p>
            <p className="mt-2 text-sm text-muted">Add a product to start building your order.</p>
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="mt-6 rounded-lg bg-accent px-5 py-3 text-sm font-medium text-primary transition duration-200 hover:brightness-110"
            >
              Browse products
            </button>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              {cartItems.map((item) => {
                const itemKey = item._id || item.productId || item.id || item.name;
                const image = item.images?.[0] || "https://via.placeholder.com/200x150?text=No+Image";
                const quantity = Number(item.quantity) || 1;

                return (
                  <div key={itemKey} className="flex gap-4 rounded-2xl border border-white/10 bg-secondary p-4 shadow-sm">
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      <img src={image} alt={item.name || "Product"} className="h-full w-full object-cover" />
                    </div>

                    <div className="flex flex-1 flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div>
                        <h2 className="text-lg font-semibold text-text">{item.name || "Unnamed product"}</h2>
                        <p className="text-sm text-muted">{item.brand || item.category || "Added to cart"}</p>
                      </div>

                      <div className="flex flex-col items-start gap-2 text-left sm:items-end sm:text-right">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item, quantity - 1)}
                            className="h-9 w-9 rounded-full border border-white/15 text-lg font-semibold leading-none transition hover:bg-hover"
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={quantity}
                            onChange={(event) => handleUpdateQuantity(item, event.target.value)}
                            className="w-16 rounded-lg border border-white/15 bg-primary px-2 py-1 text-center text-sm outline-none focus:border-accent"
                            aria-label="Quantity"
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item, quantity + 1)}
                            className="h-9 w-9 rounded-full border border-white/15 text-lg font-semibold leading-none transition hover:bg-hover"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <p className="text-sm text-muted">Qty</p>
                        <p className="text-lg font-semibold">${Number(item.price || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <aside className="h-fit rounded-2xl border border-white/10 bg-secondary p-5 shadow-sm">
              <h2 className="text-xl font-semibold">Order summary</h2>
              <div className="mt-4 space-y-3 text-sm text-muted">
                <div className="flex items-center justify-between">
                  <span>Items</span>
                  <span>{cartItems.length}</span>
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-3 text-base font-semibold text-text">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="button"
                className="mt-6 w-full rounded-lg bg-accent-2 px-4 py-3 text-sm font-medium text-text transition duration-200 hover:bg-accent"
                onClick={() => navigate("/checkout")}
              >
                Checkout
              </button>

              <Link
                to="/products"
                className="mt-3 block text-center text-sm font-medium text-muted underline-offset-4 hover:text-accent hover:underline"
              >
                Continue shopping
              </Link>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}