import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaSuitcase } from "react-icons/fa6";
import { FaRegUserCircle } from "react-icons/fa";
import { getCart } from "../utils/cart";

export default function Header() {
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const syncCartCount = () => {
      const cart = getCart();
      const count = cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
      setCartCount(count);
    };

    syncCartCount();
    window.addEventListener("cart-updated", syncCartCount);

    return () => window.removeEventListener("cart-updated", syncCartCount);
  }, []);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/products", label: "Products" },
    { to: "/orders", label: "Orders" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-primary/90 text-text backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-3 py-3 sm:px-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-secondary md:hidden"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span className="sr-only">Toggle menu</span>
            <div className="flex w-5 flex-col gap-1">
              <span className="h-0.5 w-full bg-text" />
              <span className="h-0.5 w-full bg-text" />
              <span className="h-0.5 w-full bg-text" />
            </div>
          </button>
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/logo.jpg"
              alt="ApexTech logo"
              className="h-10 w-auto rounded-lg object-contain sm:h-11"
            />
            <span className="font-heading hidden text-sm text-text sm:inline">ApexTech</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="relative text-sm font-medium text-muted transition hover:text-text after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-accent after:transition-all hover:after:w-full"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="hidden rounded-lg border border-white/15 bg-secondary px-3 py-2 text-xs font-semibold text-text transition duration-200 hover:bg-hover sm:inline-flex"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="hidden rounded-lg bg-accent-2 px-3 py-2 text-xs font-semibold text-text shadow-lg shadow-cyan-900/25 transition duration-200 hover:brightness-110 sm:inline-flex"
          >
            Sign Up
          </Link>
          <div className="hidden h-7 w-px bg-white/20 md:block" aria-hidden="true" />
          <Link
            to="/profile"
            className="hidden items-center gap-2 rounded-lg border border-white/15 bg-secondary px-3 py-2 text-xs font-semibold text-text transition duration-200 hover:bg-hover md:inline-flex"
          >
            <FaRegUserCircle className="text-base" />
            Profile
          </Link>
        <Link
          to="/cart"
          className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-secondary text-text transition duration-200 hover:bg-hover sm:h-11 sm:w-11"
          aria-label="Open cart"
        >
          <FaSuitcase className="text-lg" />
          {cartCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-semibold text-primary">
              {cartCount}
            </span>
          ) : null}
        </Link>
        </div>
      </div>

      <div className={`${menuOpen ? "pointer-events-auto" : "pointer-events-none"} fixed inset-0 z-50 md:hidden`}>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className={`${menuOpen ? "opacity-100" : "opacity-0"} absolute inset-0 bg-black/45 transition-opacity`}
            aria-label="Close menu backdrop"
          />
          <div
            className={`${menuOpen ? "translate-x-0" : "-translate-x-full"} relative h-full w-72 max-w-[85vw] border-r border-white/10 bg-primary px-4 py-4 text-text shadow-2xl transition-transform`}
          >
            <div className="mb-4 flex items-center justify-between border-b border-white/20 pb-3">
              <p className="font-heading text-base">Menu</p>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg border border-white/10 bg-secondary px-2 py-1 text-sm"
                aria-label="Close menu"
              >
                Close
              </button>
            </div>
            <div className="flex flex-col gap-1 text-sm">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-muted transition hover:bg-hover hover:text-text"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="mt-2 flex items-center gap-2 rounded-lg border border-white/10 bg-secondary px-3 py-2 text-text"
              >
                <FaRegUserCircle className="text-base" />
                Profile
              </Link>
              <div className="mt-4 flex gap-2">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 rounded-lg border border-white/10 bg-secondary px-3 py-2 text-center text-xs font-semibold">
                  Sign In
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="flex-1 rounded-lg bg-accent-2 px-3 py-2 text-center text-xs font-semibold">
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
      </div>
    </header>
  );
}
