import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import ProductDeleteButton from "../../components/productDeleteButton";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProducts() {
      setLoading(true);
      const token = localStorage.getItem("token") || localStorage.getItem(" token");

      try {
        const res = await axios.get(`${import.meta.env.VITE_backend_URL}/products`, {
          signal: controller.signal,
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : undefined,
        });

        // Backend may return products array directly or under a products key.
        const list = Array.isArray(res.data) ? res.data : res.data?.products || [];
        setProducts(list);
      } catch (err) {
        if (axios.isCancel(err)) return;
        console.error("Failed to load products", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
    return () => controller.abort();
  }, []);

  const handleDeleted = (id) => {
    // Remove by either internal _id or productId to avoid stale rows when ids differ
    setProducts((prev) => prev.filter((p) => p._id !== id && p.productId !== id));
  };

  return (
    <div className="min-h-full bg-slate-50/70 p-3 sm:p-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Products</h1>
 
          </div>
          <Link
            to="/admin/addproduct"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2 text-white shadow-lg shadow-accent/30 transition hover:opacity-90 sm:w-auto"
            aria-label="Add product"
          >
            <span className="text-lg leading-none">+</span>
            <span className="text-sm font-medium">Add product</span>
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3 text-sm text-slate-600">
            {loading ? "Loading products..." : `${products.length} product${products.length !== 1 ? "s" : ""}`}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Product ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Name / Alt names
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Model
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Brand
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Price / Label
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Ratings
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Images
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loading && (
                  <tr>
                    <td colSpan="11" className="px-4 py-10 text-center">
                      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-accent" />
                    </td>
                  </tr>
                )}

                {!loading && products.length === 0 && (
                  <tr>
                    <td colSpan="11" className="px-4 py-8 text-center text-sm text-slate-600">
                      No products found.
                    </td>
                  </tr>
                )}

                {!loading &&
                  products.map((product) => (
                    <tr key={product._id || product.productId} className="transition hover:bg-slate-50/80">
                      <td className="px-4 py-3 text-sm text-gray-900">{product.productId || "-"}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div className="flex flex-col">
                          <span className="font-medium">{product.name || "Unnamed"}</span>
                          <span className="text-xs text-gray-500">
                            {(product.altNames && product.altNames.length > 0
                              ? product.altNames.join(", ")
                              : product.model || "") || ""}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{product.category || "-"}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{product.model || "-"}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{product.brand || "-"}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div className="flex flex-col">
                          <span>
                            {typeof product.price === "number" ? product.price.toFixed(2) : product.price || "-"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {typeof product.labelPrice === "number"
                              ? product.labelPrice.toFixed(2)
                              : product.labelPrice || "-"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{product.stock ?? "-"}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{product.ratings ?? 0}</td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${product.isAvailable ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                        >
                          <span className={`h-2 w-2 rounded-full ${product.isAvailable ? "bg-green-500" : "bg-gray-400"}`} />
                          {product.isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex flex-wrap gap-2">
                          {(product.images || [])
                            .slice(0, 3)
                            .map((url, idx) => (
                              <img
                                key={url || idx}
                                src={url}
                                alt={`${product.name || "Product"} image ${idx + 1}`}
                                className="h-12 w-12 rounded border object-cover"
                              />
                            ))}
                          {product.images && product.images.length > 3 && (
                            <span className="text-xs text-gray-500">+{product.images.length - 3} more</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/products/${product.productId || product._id}/edit`}
                            state={{ product }}
                            className="rounded-lg bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 transition hover:bg-cyan-100"
                          >
                            Edit
                          </Link>
                          <ProductDeleteButton
                            disabled={loading}
                            deviceId={product.productId || product._id}
                            onDeleted={handleDeleted}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
