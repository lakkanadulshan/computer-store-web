import React from "react";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { uploadFile } from "../../utils/mediaUpload";

export default function AddProductPage() {
  const [productId, setProductId] = useState("");
  const [name, setName] = useState("");
  const [altName, setAltName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [labelPrice, setLabelPrice] = useState("");
  const [category, setCategory] = useState("");
  const [model, setModel] = useState("");
  const [brand, setBrand] = useState("");
  const [stock, setStock] = useState("0");
  const [isAvailable, setIsAvailable] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const navigate = useNavigate();

  async function addProduct(e) {
    e.preventDefault();

    const token = localStorage.getItem("token") || localStorage.getItem(" token");
    if (!token) {
      toast.error("Please log in first.");
      navigate("/login");
      return;
    }

    if (
      !productId ||
      !name ||
      !altName ||
      !description ||
      !price ||
      !labelPrice ||
      !category ||
      !model ||
      !brand ||
      !stock
    ) {
      toast.error("Please fill out all fields.");
      return;
    }

    try {
      if (!imageFiles.length) {
        toast.error("Please select at least one image.");
        return;
      }

      setUploadingImage(true);
      const imageUrls = await Promise.all(imageFiles.map((file) => uploadFile(file)));

      await axios.post(
        `${import.meta.env.VITE_backend_URL}/products`,
        {
          productId,
          name,
          altName,
          description,
          price: Number(price),
          labelPrice: Number(labelPrice),
          category,
          model,
          brand,
          stock: Number(stock),
          isAvailable,
          images: imageUrls,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Product added successfully.");
      navigate("/admin");
    } catch (error) {
      console.error("Add product failed", error);
      const message = error?.response?.data?.message || "Failed to add product.";
      toast.error(message);
    } finally {
      setUploadingImage(false);
    }
  }


  return (
    <div className="flex h-full w-full justify-center items-start bg-slate-50/70 p-3 sm:p-6">
      <form
        // onSubmit={addProduct}
        className="w-full max-w-3xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h1 className="text-2xl font-semibold text-slate-900">Add New Product</h1>

        <label className="flex flex-col gap-1 text-sm">
          Product Images
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
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              placeholder="SKU-001"
              required
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Name
            <input
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-accent"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Alt Name
            <input
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-accent"
              value={altName}
              onChange={(e) => setAltName(e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Model
            <input
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-accent"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="Model"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Brand
            <input
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-accent"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Brand"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          Description
          <textarea
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-accent"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description"
          />
        </label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Price
            <input
              type="number"
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-accent"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Label Price
            <input
              type="number"
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-accent"
              value={labelPrice}
              onChange={(e) => setLabelPrice(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Stock
            <input
              type="number"
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-accent"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              min="0"
            />
          </label>
        </div>

        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isAvailable}
            onChange={(e) => setIsAvailable(e.target.checked)}
          />
          Available
        </label>

        <label>
          Category
          <select className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-accent" value={category} onChange={(e) => setCategory(e.target.value)}>
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
            type="submit" onClick={addProduct}
            className="rounded-lg bg-accent px-4 py-2 text-white shadow transition hover:opacity-90"
            disabled={uploadingImage}
          >
            {uploadingImage ? "Uploading image..." : "Save Product"}
          </button>
          <button
            type="reset"
            className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 transition hover:bg-slate-50"
            onClick={() => {
              setProductId("");
              setName("");
              setAltName("");
              setDescription("");
              setPrice("");
              setLabelPrice("");
              setCategory("");
              setModel("");
              setBrand("");
              setStock("0");
              setIsAvailable(false);
              setImageFiles([]);
              setUploadingImage(false);
            }}
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
