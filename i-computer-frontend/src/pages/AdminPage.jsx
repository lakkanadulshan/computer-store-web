import { useEffect, useState } from "react";
import { NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { FaClipboardList } from "react-icons/fa";
import { AiFillProduct } from "react-icons/ai";
import { FaUser } from "react-icons/fa";
import { FaCommentAlt } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import AdminProducts from "./admin/adminProducts";
import AddProductPage from "./admin/addProductPage";
import EditProductPage from "./admin/editProductPage";
import AdminOrdersPage from "./admin/adminOrdersPage";

export default function AdminPage() {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem(" token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    let role = (localStorage.getItem("role") || "").toLowerCase();

    if (!role) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1] || ""));
        role = String(payload?.role || payload?.user?.role || "").toLowerCase();
      } catch {
        role = "";
      }
    }

    if (role && role !== "admin") {
      navigate("/", { replace: true });
      return;
    }

    setIsAuthorized(true);
  }, [navigate]);

  if (!isAuthorized) {
    return null;
  }

  const navItemBase =
    "flex h-11 min-w-max items-center gap-2.5 rounded-xl px-4 text-sm font-medium transition lg:h-12 lg:w-full";

  function navItemClass({ isActive }) {
    return `${navItemBase} ${isActive ? "bg-white text-cyan-900 shadow-sm" : "text-white/90 hover:bg-white/15 hover:text-white"}`;
  }

  return (
    <div className="flex h-full w-full max-h-full flex-col bg-linear-to-br from-slate-950 via-cyan-950 to-slate-900 lg:flex-row">
      <aside className="w-full shrink-0 border-b border-white/10 bg-white/5 backdrop-blur-sm lg:h-full lg:w-72 lg:border-b-0 lg:border-r">
        <div className="flex h-22 w-full items-center gap-3 px-4 lg:h-24">
          <img src="/logo.png" alt="Logo" className="h-14 w-14 rounded-xl bg-white/10 p-1.5 object-contain" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-200">Control Center</p>
            <p className="text-lg font-semibold text-white">Admin Dashboard</p>
          </div>
        </div>
        <div className="px-3 pb-4 lg:px-4">
          <div className="mb-3 hidden items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-medium text-cyan-100 lg:flex">
            <HiSparkles />
            Manage orders and products efficiently
          </div>
          <nav className="flex w-full gap-2 overflow-x-auto py-1 lg:flex-col lg:overflow-visible">
            <NavLink to="/admin" end className={navItemClass}>
            <FaClipboardList />
            Orders
            </NavLink>
            <NavLink to="/admin/products" className={navItemClass}>
            <AiFillProduct />
            Products
            </NavLink>
            <NavLink to="/admin/users" className={navItemClass}>
            <FaUser />
            Users
            </NavLink>
            <NavLink to="/admin/reviews" className={navItemClass}>
            <FaCommentAlt />
            Reviews
            </NavLink>
          </nav>
        </div>
      </aside>

      <main className="min-h-0 flex-1 overflow-y-auto p-2 sm:p-3 lg:max-h-full lg:p-5">
        <div className="min-h-full overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl shadow-black/20">
        <Routes>
          <Route path="/" element={<AdminOrdersPage />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/:productId/edit" element={<EditProductPage />} />
          <Route path="addproduct" element={<AddProductPage />} />
          <Route path="users" element={<h1>Users</h1>} />
          <Route path="reviews" element={<h1>Reviews</h1>} />
        </Routes>
        </div>
      </main>
    </div>
  );
}
