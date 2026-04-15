import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { FaBoxOpen, FaEnvelope, FaLocationDot, FaPhone, FaRightFromBracket, FaUser } from "react-icons/fa6";

function getUserDisplay() {
  const token = localStorage.getItem("token") || localStorage.getItem(" token");
  const role = localStorage.getItem("role") || "customer";

  if (!token) {
    return {
      firstName: "Guest",
      lastName: "User",
      email: "Not signed in",
      image: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      role,
      isGuest: true,
    };
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1] || ""));
    const firstName = payload?.firstName || payload?.user?.firstName || payload?.name || "User";
    const lastName = payload?.lastName || payload?.user?.lastName || "";
    const email = payload?.email || payload?.user?.email || "Email not available";
    const image = payload?.image || payload?.user?.image || "";
    const phone = payload?.phone || payload?.user?.phone || "";
    const address = payload?.address || payload?.user?.address || "";
    const city = payload?.city || payload?.user?.city || "";
    const state = payload?.state || payload?.user?.state || "";
    const zipCode = payload?.zipCode || payload?.user?.zipCode || "";
    const country = payload?.country || payload?.user?.country || "";

    return {
      firstName,
      lastName,
      email,
      image,
      phone,
      address,
      city,
      state,
      zipCode,
      country,
      role,
      isGuest: false,
    };
  } catch {
    return {
      firstName: "User",
      lastName: "",
      email: "Email not available",
      image: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      role,
      isGuest: false,
    };
  }
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getUserDisplay());
  const [totalOrders, setTotalOrders] = useState(0);
  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [address, setAddress] = useState(user.address || "");
  const [city, setCity] = useState(user.city || "");
  const [state, setState] = useState(user.state || "");
  const [zipCode, setZipCode] = useState(user.zipCode || "");
  const [country, setCountry] = useState(user.country || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem(" token");
    if (!token) {
      setUser(getUserDisplay());
      return;
    }

    const controller = new AbortController();

    async function loadProfile() {
      try {
        const res = await axios.get(`${import.meta.env.VITE_backend_URL}/users/me`, {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const profile = res.data?.user;
        if (!profile) return;

        const nextUser = {
          firstName: profile.firstName || "User",
          lastName: profile.lastName || "",
          email: profile.email || "Email not available",
          image: profile.image || "",
          phone: profile.phone || "",
          address: profile.address || "",
          city: profile.city || "",
          state: profile.state || "",
          zipCode: profile.zipCode || "",
          country: profile.country || "",
          role: profile.role || "customer",
          isGuest: false,
        };

        setUser(nextUser);
        setFirstName(nextUser.firstName);
        setLastName(nextUser.lastName);
        setPhone(nextUser.phone || "");
        setAddress(nextUser.address || "");
        setCity(nextUser.city || "");
        setState(nextUser.state || "");
        setZipCode(nextUser.zipCode || "");
        setCountry(nextUser.country || "");
      } catch {
        setUser(getUserDisplay());
      }
    }

    loadProfile();
    return () => controller.abort();
  }, []);

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

  async function saveProfile(event) {
    event.preventDefault();
    const token = localStorage.getItem("token") || localStorage.getItem(" token");

    if (!token) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First name and last name are required");
      return;
    }

    setSaving(true);
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_backend_URL}/users/me`,
        {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          zipCode: zipCode.trim(),
          country: country.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
      }

      const updated = res.data?.user;
      if (updated) {
        setUser((prev) => ({
          ...prev,
          ...updated,
          isGuest: false,
        }));

        setPhone(updated.phone || "");
        setAddress(updated.address || "");
        setCity(updated.city || "");
        setState(updated.state || "");
        setZipCode(updated.zipCode || "");
        setCountry(updated.country || "");
      }

      toast.success(res.data?.message || "Profile updated");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full bg-primary text-text">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-2xl border border-white/10 bg-secondary p-5 shadow-sm">
          <div className="flex items-center gap-3">
            {user.image ? (
              <img
                src={user.image}
                alt="Profile"
                className="h-14 w-14 rounded-full border border-white/20 object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-accent">
                <FaUser className="text-xl" />
              </div>
            )}
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
              <span>{user.phone || "Not set"}</span>
            </p>
            <p className="flex items-center gap-2">
              <FaLocationDot className="text-accent" />
              <span>
                {[user.address, user.city, user.state, user.zipCode, user.country].filter(Boolean).join(", ") || "Not set"}
              </span>
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
            <h3 className="font-heading text-xl text-text">Edit Profile</h3>
            <p className="mt-2 text-sm text-muted">Update your account details here.</p>

            <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={saveProfile}>
              <div>
                <label className="mb-1 block text-sm text-muted">First name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-primary px-3 py-2 text-text outline-none transition focus:border-accent"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-muted">Last name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-primary px-3 py-2 text-text outline-none transition focus:border-accent"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm text-muted">Phone number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-primary px-3 py-2 text-text outline-none transition focus:border-accent"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm text-muted">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-primary px-3 py-2 text-text outline-none transition focus:border-accent"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-muted">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-primary px-3 py-2 text-text outline-none transition focus:border-accent"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-muted">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(event) => setState(event.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-primary px-3 py-2 text-text outline-none transition focus:border-accent"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-muted">ZIP code</label>
                <input
                  type="text"
                  value={zipCode}
                  onChange={(event) => setZipCode(event.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-primary px-3 py-2 text-text outline-none transition focus:border-accent"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-muted">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-primary px-3 py-2 text-text outline-none transition focus:border-accent"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-primary transition hover:brightness-110 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
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
