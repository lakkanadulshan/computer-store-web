import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { ProductCard } from "../components/productCard";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return products;

    return products.filter((product) => {
      const searchableValues = [
        product?.name,
        product?.category,
        product?.productId,
      ]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());

      return searchableValues.some((value) => value.includes(query));
    });
  }, [products, searchTerm]);

  return (
    <div className="h-full w-full bg-primary text-text">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="font-heading text-3xl text-text">Products</h1>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:items-end">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search products..."
              className="w-full rounded-lg border border-white/15 bg-secondary px-4 py-2.5 text-sm text-text outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/40 sm:w-80"
            />
            {!loading && (
              <span className="w-fit rounded-full border border-white/10 bg-secondary px-3 py-1 text-xs font-medium text-muted">
                {filteredProducts.length} item(s)
              </span>
            )}
          </div>
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

        {!loading && filteredProducts.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-secondary p-6 text-center text-muted">No products found.</div>
        )}

        {!loading && filteredProducts.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
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
