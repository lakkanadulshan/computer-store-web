import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { uploadFile } from "../../utils/mediaUpload";

export default function EditProductPage() {
  const { productId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const productFromState = location.state?.product;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const [form, setForm] = useState({
    productId: "",
    name: "",
    altName: "",
    description: "",
    price: "",
    labelPrice: "",
    category: "",
    model: "",
    brand: "",
    stock: "0",
    isAvailable: false,
  });

  const applyProductData = (data) => {
    setForm({
      productId: data.productId || "",
      name: data.name || "",
      altName: data.altName || data.altNames?.[0] || "",
      description: data.description || "",
      price: data.price ?? "",
      labelPrice: data.labelPrice ?? "",
      category: data.category || "",
      model: data.model || "",
      brand: data.brand || "",
      stock: data.stock ?? "0",
      isAvailable: !!data.isAvailable,
    });
    setExistingImages(data.images || []);
  };

  useEffect(() => {
    if (productFromState) {
      applyProductData(productFromState);
      setLoading(false);
      return;
    }

    async function fetchProduct() {
      const token = localStorage.getItem("token") || localStorage.getItem(" token");
      if (!token) {
        toast.error("Please log in first.");
        navigate("/login");
        return;
      }

      try {
        const res = await axios.get(`${import.meta.env.VITE_backend_URL}/products/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data?.product || res.data;
        applyProductData(data);
      } catch (err) {
        console.error("Failed to load product", err);
        toast.error("Unable to load product.");
        navigate("/admin/products");
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId, navigate, productFromState]);

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  async function handleSave(e) {
    e.preventDefault();
    const token = localStorage.getItem("token") || localStorage.getItem(" token");
    if (!token) {
      toast.error("Please log in first.");
      navigate("/login");
      return;
    }

    if (!form.productId || !form.name) {
      toast.error("Product ID and Name are required.");
      return;
    }

    try {
      setSaving(true);
      let newImages = [];
      if (imageFiles.length) {
        newImages = await Promise.all(imageFiles.map((file) => uploadFile(file)));
      }
      const images = [...existingImages, ...newImages];

      await axios.put(
        `${import.meta.env.VITE_backend_URL}/products/${productId}`,
        {
          ...form,
          price: Number(form.price),
          labelPrice: Number(form.labelPrice),
          stock: Number(form.stock),
          images,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Product updated.");
      navigate("/admin/products");
    } catch (err) {
      console.error("Update failed", err);
      const msg = err?.response?.data?.message || "Failed to update product.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-accent" />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full justify-center items-start bg-slate-50/70 p-3 sm:p-6">
      <form onSubmit={handleSave} className="w-full max-w-3xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Edit Product</h1>

        <label className="flex flex-col gap-1 text-sm">
          Existing Images
          <div className="flex flex-wrap gap-3">
            {existingImages.length === 0 && <span className="text-xs text-gray-500">No images</span>}
            {existingImages.map((url, idx) => (
              <div key={url || idx} className="relative">
                <img src={url} alt={`Existing ${idx + 1}`} className="h-16 w-16 rounded border object-cover" />
                <button
                  type="button"
                  className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-red-500 text-white"
                  onClick={() => setExistingImages((prev) => prev.filter((img) => img !== url))}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Upload Additional Images
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-accent"
          />
          {imageFiles.length > 0 && (
            <span className="text-xs text-gray-500">{imageFiles.length} file(s) selected</span>
          )}
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Product ID
            <input
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-accent"
              value={form.productId}
              onChange={(e) => updateField("productId", e.target.value)}
              required
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Name
            <input
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-accent"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              required
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Alt Name
            <input
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-accent"
              value={form.altName}
              onChange={(e) => updateField("altName", e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Model
            <input
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-accent"
              value={form.model}
              onChange={(e) => updateField("model", e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Brand
            <input
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-accent"
              value={form.brand}
              onChange={(e) => updateField("brand", e.target.value)}
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          Description
          <textarea
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-accent"
            rows={3}
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
          />
        </label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Price
            <input
              type="number"
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-accent"
              value={form.price}
              onChange={(e) => updateField("price", e.target.value)}
              min="0"
              step="0.01"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Label Price
            <input
              type="number"
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-accent"
              value={form.labelPrice}
              onChange={(e) => updateField("labelPrice", e.target.value)}
              min="0"
              step="0.01"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Stock
            <input
              type="number"
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-accent"
              value={form.stock}
              onChange={(e) => updateField("stock", e.target.value)}
              min="0"
            />
          </label>
        </div>

        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isAvailable}
            onChange={(e) => updateField("isAvailable", e.target.checked)}
          />
          Available
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Category
          <select
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-accent"
            value={form.category}
            onChange={(e) => updateField("category", e.target.value)}
          >
            <option value="">Select a category</option>
            <option value="Ram">Ram</option>
            <option value="computer">Computers</option>
            <option value="cables">Cable</option>
            <option value="motherboard">Motherboard</option>
            <option value="cpu">CPU</option>
            <option value="gpu">GPU</option>
            <option value="storage-ssd">SSD</option>
            <option value="storage-hdd">HDD</option>
            <option value="psu">Power Supply</option>
            <option value="case">PC Case</option>
            <option value="cooling">Cooling / Fans</option>
            <option value="monitor">Monitor</option>
            <option value="keyboard">Keyboard</option>
            <option value="mouse">Mouse</option>
            <option value="laptop">Laptop</option>
          </select>
        </label>

        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-lg bg-accent px-4 py-2 text-white shadow transition hover:opacity-90"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 transition hover:bg-slate-50"
            onClick={() => navigate("/admin/products")}
            disabled={saving}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
