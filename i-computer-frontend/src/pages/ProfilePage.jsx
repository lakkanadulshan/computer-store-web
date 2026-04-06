import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBoxOpen, FaEnvelope, FaLocationDot, FaPhone, FaRightFromBracket, FaUser } from "react-icons/fa6";

function getUserDisplay() {
  const token = localStorage.getItem("token") || localStorage.getItem(" token");
  const role = localStorage.getItem("role") || "customer";

  if (!token) {
    return {
      firstName: "Guest",
      lastName: "User",
      email: "Not signed in",
      role,
      isGuest: true,
    };
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1] || ""));
    const firstName = payload?.firstName || payload?.user?.firstName || payload?.name || "User";
    const lastName = payload?.lastName || payload?.user?.lastName || "";
    const email = payload?.email || payload?.user?.email || "Email not available";

    return {
      firstName,
      lastName,
      email,
      role,
      isGuest: false,
    };
  } catch {
    return {
      firstName: "User",
      lastName: "",
      email: "Email not available",
      role,
      isGuest: false,
    };
  }
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = getUserDisplay();
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    if (user.isGuest || !user.email || user.email === "Not signed in") {
      setTotalOrders(0);
      return;
    }

    try {
      const emailKey = String(user.email).toLowerCase().trim();
      const stored = localStorage.getItem("orderCounts");
      if (!stored) {
        setTotalOrders(0);
        return;
      }

      const parsed = JSON.parse(stored);
      const count = Number(parsed[emailKey]) || 0;
      setTotalOrders(count);
    } catch {
      setTotalOrders(0);
    }
  }, [user.isGuest, user.email]);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem(" token");
    localStorage.removeItem("role");
    navigate("/login");
  }

  return (
    <div className="w-full bg-primary text-text">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-2xl border border-white/10 bg-secondary p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-accent">
              <FaUser className="text-xl" />
            </div>
            <div>
              <h1 className="font-heading text-xl text-text">{user.firstName} {user.lastName}</h1>
              <p className="text-xs uppercase tracking-wide text-muted">{user.role || "customer"}</p>
            </div>
          </div>

          <div className="mt-5 space-y-3 text-sm text-muted">
            <p className="flex items-center gap-2">
              <FaEnvelope className="text-accent" />
              <span>{user.email}</span>
            </p>
            <p className="flex items-center gap-2">
              <FaPhone className="text-accent" />
              <span>+94 77 000 0000</span>
            </p>
            <p className="flex items-center gap-2">
              <FaLocationDot className="text-accent" />
              <span>Colombo, Sri Lanka</span>
            </p>
          </div>

          <div className="mt-6 space-y-2">
            {user.isGuest ? (
              <Link
                to="/login"
                className="block w-full rounded-lg bg-accent px-4 py-2 text-center text-sm font-semibold text-primary transition hover:brightness-110"
              >
                Sign In
              </Link>
            ) : (
              <button
                type="button"
                onClick={logout}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-primary px-4 py-2 text-sm font-semibold text-text transition hover:bg-hover"
              >
                <FaRightFromBracket />
                Log Out
              </button>
            )}
          </div>
        </aside>

        <section className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-secondary p-5 shadow-sm">
            <h2 className="font-heading text-2xl text-text">Profile Overview</h2>
            <p className="mt-2 text-sm text-muted">
              Manage your account details and quickly jump back to shopping.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-primary p-4">
                <p className="text-xs uppercase tracking-wide text-muted">Total orders</p>
                <p className="mt-2 text-2xl font-semibold text-text">{totalOrders}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-primary p-4">
                <p className="text-xs uppercase tracking-wide text-muted">Wishlist items</p>
                <p className="mt-2 text-2xl font-semibold text-text">0</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-primary p-4">
                <p className="text-xs uppercase tracking-wide text-muted">Cart items</p>
                <p className="mt-2 text-2xl font-semibold text-text">Live</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-secondary p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-heading text-xl text-text">Recent Activity</h3>
              <Link
                to="/products"
                className="rounded-lg bg-accent-2 px-4 py-2 text-sm font-semibold text-text transition hover:brightness-110"
              >
                Continue Shopping
              </Link>
            </div>

            <div className="mt-4 rounded-xl border border-dashed border-white/15 bg-primary p-6 text-center text-sm text-muted">
              <FaBoxOpen className="mx-auto mb-2 text-xl text-accent" />
              No recent orders yet. Start exploring products to place your first order.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
