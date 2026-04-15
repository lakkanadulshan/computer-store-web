import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

function getAuthToken() {
  return localStorage.getItem("token") || localStorage.getItem(" token") || "";
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [updatingEmail, setUpdatingEmail] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadUsers() {
      setLoading(true);
      const token = getAuthToken();

      if (!token) {
        toast.error("Please log in as admin");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${import.meta.env.VITE_backend_URL}/users`, {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const list = Array.isArray(res.data) ? res.data : res.data?.users || [];
        setUsers(list);
      } catch (error) {
        if (axios.isCancel(error)) return;
        toast.error(error?.response?.data?.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
    return () => controller.abort();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;

    return users.filter((user) => {
      const haystack = [
        user.email,
        user.firstName,
        user.lastName,
        user.phone,
        user.address,
        user.city,
        user.country,
        user.role,
      ]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());

      return haystack.some((value) => value.includes(q));
    });
  }, [users, query]);

  async function toggleBlock(user) {
    const token = getAuthToken();
    if (!token) {
      toast.error("Please log in as admin");
      return;
    }

    if (String(user.role || "").toLowerCase() === "admin") {
      toast.error("Admin users cannot be blocked");
      return;
    }

    setUpdatingEmail(user.email);

    try {
      const nextBlockedState = !Boolean(user.isBlocked);
      const res = await axios.patch(
        `${import.meta.env.VITE_backend_URL}/users/${encodeURIComponent(user.email)}/block`,
        { isBlocked: nextBlockedState },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedUser = res.data?.user;
      setUsers((prev) =>
        prev.map((item) => (item.email === user.email ? { ...item, ...(updatedUser || { isBlocked: nextBlockedState }) } : item))
      );

      toast.success(res.data?.message || "User status updated");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update user status");
    } finally {
      setUpdatingEmail("");
    }
  }

  return (
    <div className="min-h-full bg-slate-50/70 p-3 sm:p-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
            <p className="text-sm text-slate-600">
              {loading ? "Loading users..." : `${filteredUsers.length} user${filteredUsers.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          <input
            type="text"
            placeholder="Search users by name, email, phone..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-accent/30 transition focus:border-accent focus:ring sm:max-w-sm"
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Address</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loading && (
                  <tr>
                    <td colSpan="7" className="px-4 py-10 text-center">
                      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-accent" />
                    </td>
                  </tr>
                )}

                {!loading && filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-sm text-slate-600">
                      No users found.
                    </td>
                  </tr>
                )}

                {!loading &&
                  filteredUsers.map((user) => (
                    <tr key={user._id || user.email} className="transition hover:bg-slate-50/80">
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        {`${user.firstName || ""} ${user.lastName || ""}`.trim() || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{user.email || "-"}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{user.phone || "-"}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {[user.address, user.city, user.state, user.zipCode, user.country]
                          .filter(Boolean)
                          .join(", ") || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 capitalize">{user.role || "customer"}</td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                            user.isBlocked ? "bg-rose-100 text-rose-700" : "bg-green-100 text-green-700"
                          }`}
                        >
                          <span className={`h-2 w-2 rounded-full ${user.isBlocked ? "bg-rose-500" : "bg-green-500"}`} />
                          {user.isBlocked ? "Blocked" : "Active"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          type="button"
                          disabled={updatingEmail === user.email || String(user.role || "").toLowerCase() === "admin"}
                          onClick={() => toggleBlock(user)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                            user.isBlocked
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                              : "bg-rose-100 text-rose-700 hover:bg-rose-200"
                          } disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                          {updatingEmail === user.email
                            ? "Updating..."
                            : user.isBlocked
                            ? "Unblock"
                            : "Block"}
                        </button>
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
