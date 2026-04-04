import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";

export default function SiteFooter() {
  return (
    <footer className="mt-14 border-t border-white/10 bg-primary">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="font-heading text-lg text-text">About</h3>
          <p className="mt-3 text-sm text-muted">Premium computer store focused on reliability, speed, and modern hardware experiences.</p>
        </div>
        <div>
          <h3 className="font-heading text-lg text-text">Shop</h3>
          <div className="mt-3 flex flex-col gap-2 text-sm text-muted">
            <Link to="/products" className="hover:text-accent">All Products</Link>
            <Link to="/cart" className="hover:text-accent">Cart</Link>
            <Link to="/checkout" className="hover:text-accent">Checkout</Link>
          </div>
        </div>
        <div>
          <h3 className="font-heading text-lg text-text">Support</h3>
          <div className="mt-3 flex flex-col gap-2 text-sm text-muted">
            <Link to="/contact" className="hover:text-accent">Contact</Link>
            <Link to="/about" className="hover:text-accent">About</Link>
            <Link to="/profile" className="hover:text-accent">My Account</Link>
          </div>
        </div>
        <div>
          <h3 className="font-heading text-lg text-text">Follow Us</h3>
          <div className="mt-3 flex items-center gap-3">
            {[FaFacebookF, FaInstagram, FaTwitter].map((Icon, idx) => (
              <button key={idx} type="button" className="rounded-lg border border-white/10 bg-secondary p-2 text-muted transition duration-200 hover:text-accent">
                <Icon />
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-muted">© {new Date().getFullYear()} I-COMPUTER. All rights reserved.</div>
    </footer>
  );
}
