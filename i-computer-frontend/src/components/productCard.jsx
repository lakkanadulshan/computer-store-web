import React, { useState } from "react";
import { Link } from "react-router-dom";
import { formatLkr } from "../utils/currency";

export function ProductCard({ id, name, price, images = [], category, isAvailable = true }) {
    const fallback = "https://via.placeholder.com/300x200?text=No+Image";
    const safeImages = images.length ? images : [fallback];
    const [currentIndex, setCurrentIndex] = useState(0);

    const hasAlt = safeImages.length > 1;

    const handleEnter = () => {
        if (hasAlt) {
            setCurrentIndex(1);
        }
    };

    const handleLeave = () => setCurrentIndex(0);

    return (
        <Link
            to={`/products/${id || "unknown"}`}
            className="group flex h-full flex-col gap-3 rounded-2xl border border-white/10 bg-secondary p-4 transition duration-200 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,194,255,0.12)]"
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
        >
            <div className="relative h-52 overflow-hidden rounded-xl bg-slate-100 sm:h-56">
                {category ? (
                    <span className="absolute left-2 top-2 z-10 rounded-full bg-accent px-2.5 py-1 text-[11px] font-medium text-primary">
                        {category}
                    </span>
                ) : null}
                <img
                    src={safeImages[currentIndex]}
                    alt={name || "Product"}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
                {hasAlt && (
                    <div className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[11px] font-semibold text-slate-700">
                        Hover to preview
                    </div>
                )}
            </div>
            <div className="flex flex-col gap-1">
                <h3 className="font-heading line-clamp-2 text-xl text-text">{name}</h3>
                <p className="text-base font-bold text-accent">{formatLkr(price)}</p>
            </div>
            <div className="mt-1 text-xs font-medium">
                <span className={`rounded-full px-2 py-1 ${isAvailable ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>
                    {isAvailable ? "In stock" : "Out of stock"}
                </span>
            </div>
            <div className="mt-auto rounded-lg bg-accent-2 px-3 py-2 text-center text-sm font-medium text-text transition duration-200 hover:bg-accent active:scale-[0.99]">
                Add to Cart
            </div>
        </Link>
    );
}