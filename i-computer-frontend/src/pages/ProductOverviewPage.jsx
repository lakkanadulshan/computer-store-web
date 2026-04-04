import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { addToCart } from "../utils/cart";

export default function ProductOverviewPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_backend_URL}/products/${productId}`, {
          signal: controller.signal,
        });
        const data = res.data?.product || res.data;
        setProduct(data);
      } catch (err) {
        if (axios.isCancel(err)) return;
        console.error("Failed to load product", err);
        toast.error("Product not found.");
        navigate("/products");
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [productId, navigate]);

  const images = useMemo(() => {
    const list = product?.images || [];
    if (list.length) return list;
    return ["https://via.placeholder.com/600x400?text=No+Image"];
  }, [product]);

  const handleAddToCart = () => {
    addToCart({
      ...product,
      quantity: 1,
      image: images[0],
    });
    toast.success("Added to cart");
    navigate("/cart");
  };

  const handleBuyNow = () => {
    addToCart({
      ...product,
      quantity: 1,
      image: images[0],
    });
    navigate("/checkout");
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-accent" />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="h-full w-full bg-primary text-text">
      <div className="mx-auto max-w-6xl px-4 py-10 grid gap-10 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <div className="aspect-4/3 overflow-hidden rounded-2xl border border-white/10 bg-secondary shadow-sm">
            <img
              src={images[activeIdx]}
              alt={product.name || "Product"}
              className="h-full w-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {images.map((img, idx) => (
                <button
                  key={img || idx}
                  type="button"
                  onClick={() => setActiveIdx(idx)}
                  className={`h-16 w-16 overflow-hidden rounded-lg border ${idx === activeIdx ? "border-accent" : "border-white/10"}`}
                >
                  <img src={img} alt={`thumb-${idx}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-secondary p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="font-heading text-3xl text-text">{product.name}</h1>
              {product.brand && <p className="text-sm text-muted">{product.brand}</p>}
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-accent">${product.price}</p>
              {product.labelPrice && (
                <p className="text-sm text-muted line-through">${product.labelPrice}</p>
              )}
            </div>
          </div>

          {product.description && <p className="leading-relaxed text-muted">{product.description}</p>}

          <div className="flex flex-wrap gap-4 text-sm">
            {product.model && <span className="rounded-full border border-white/10 bg-hover px-3 py-1 text-muted">Model: {product.model}</span>}
            {product.category && <span className="rounded-full border border-white/10 bg-hover px-3 py-1 text-muted">Category: {product.category}</span>}
            {product.stock !== undefined && <span className="rounded-full border border-white/10 bg-hover px-3 py-1 text-muted">Stock: {product.stock}</span>}
            <span className={`rounded-full px-3 py-1 shadow-sm ${product.isAvailable ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"}`}>
              {product.isAvailable ? "Available" : "Unavailable"}
            </span>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleAddToCart}
              className="rounded-lg bg-accent px-4 py-3 text-primary font-medium shadow transition duration-200 hover:brightness-110"
            >
              Add to cart
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              className="rounded-lg border border-white/15 bg-transparent px-4 py-3 font-medium text-text transition duration-200 hover:bg-hover"
            >
              Buy now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
