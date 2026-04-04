import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { ProductCard } from "../components/productCard";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      setLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_backend_URL}/products`, {
          signal: controller.signal,
        });
        const list = Array.isArray(res.data) ? res.data : res.data?.products || [];
        setProducts(list);
      } catch (err) {
        if (axios.isCancel(err)) return;
        console.error("Failed to load products", err);
        toast.error("Unable to load products.");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
    return () => controller.abort();
  }, []);

  return (
    <div className="h-full w-full bg-primary text-text">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-heading text-3xl text-text">Products</h1>
          {!loading && (
            <span className="rounded-full border border-white/10 bg-secondary px-3 py-1 text-xs font-medium text-muted">{products.length} item(s)</span>
          )}
        </div>

        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="animate-pulse rounded-2xl border border-white/10 bg-secondary p-4">
                <div className="h-56 rounded-xl bg-hover" />
                <div className="mt-4 h-5 w-4/5 rounded bg-hover" />
                <div className="mt-2 h-4 w-2/5 rounded bg-hover" />
                <div className="mt-4 h-10 rounded-lg bg-hover" />
              </div>
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-secondary p-6 text-center text-muted">No products found.</div>
        )}

        {!loading && products.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div key={product._id || product.productId}>
                <ProductCard
                  id={product.productId || product._id}
                  images={product.images || []}
                  name={product.name || "Unnamed"}
                  price={typeof product.price === "number" ? product.price.toFixed(2) : product.price || "-"}
                  category={product.category || "Component"}
                  isAvailable={Boolean(product.isAvailable)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
