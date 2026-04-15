import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

function getAuthToken() {
  return localStorage.getItem("token") || localStorage.getItem(" token") || "";
}

function formatDate(dateValue) {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
}

export default function AdminReviewsPage() {
  const [reviewRows, setReviewRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [deletingKey, setDeletingKey] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadReviews() {
      setLoading(true);
      const token = getAuthToken();

      if (!token) {
        toast.error("Please log in as admin");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${import.meta.env.VITE_backend_URL}/products`, {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const products = Array.isArray(res.data) ? res.data : res.data?.products || [];

        const rows = [];
        products.forEach((product) => {
          const productId = product.productId || product._id;
          const productName = product.name || "Unnamed";
          const productReviews = Array.isArray(product.reviews) ? product.reviews : [];

          productReviews.forEach((review) => {
            rows.push({
              productId,
              productName,
              reviewId: String(review._id || ""),
              userName: review.userName || "Customer",
              userEmail: review.userEmail || "-",
              rating: Number(review.rating) || 0,
              comment: review.comment || "",
              updatedAt: review.updatedAt || review.createdAt || null,
            });
          });
        });

        rows.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
        setReviewRows(rows);
      } catch (error) {
        if (axios.isCancel(error)) return;
        toast.error(error?.response?.data?.message || "Failed to load reviews");
      } finally {
        setLoading(false);
      }
    }

    loadReviews();
    return () => controller.abort();
  }, []);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return reviewRows;

    return reviewRows.filter((row) => {
      const fields = [row.productName, row.userName, row.userEmail, row.comment]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());

      return fields.some((value) => value.includes(q));
    });
  }, [reviewRows, query]);

  async function deleteReview(row) {
    const token = getAuthToken();
    if (!token) {
      toast.error("Please log in as admin");
      return;
    }

    const key = `${row.productId}:${row.reviewId}`;
    setDeletingKey(key);

    try {
      await axios.delete(`${import.meta.env.VITE_backend_URL}/products/${row.productId}/reviews/${row.reviewId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setReviewRows((prev) => prev.filter((item) => `${item.productId}:${item.reviewId}` !== key));
      toast.success("Review removed successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to remove review");
    } finally {
      setDeletingKey("");
    }
  }

  return (
    <div className="min-h-full bg-slate-50/70 p-3 sm:p-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Reviews</h1>
            <p className="text-sm text-slate-600">
              {loading ? "Loading reviews..." : `${filteredRows.length} review${filteredRows.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          <input
            type="text"
            placeholder="Search by product, user, comment..."
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
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Rating</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Review</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loading && (
                  <tr>
                    <td colSpan="6" className="px-4 py-10 text-center">
                      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-accent" />
                    </td>
                  </tr>
                )}

                {!loading && filteredRows.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-sm text-slate-600">
                      No reviews found.
                    </td>
                  </tr>
                )}

                {!loading &&
                  filteredRows.map((row) => {
                    const key = `${row.productId}:${row.reviewId}`;
                    return (
                      <tr key={key} className="transition hover:bg-slate-50/80">
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{row.productName}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <div className="font-medium">{row.userName}</div>
                          <div className="text-xs text-gray-500">{row.userEmail}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-amber-600 font-semibold">{row.rating}/5</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{row.comment}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{formatDate(row.updatedAt)}</td>
                        <td className="px-4 py-3 text-sm">
                          <button
                            type="button"
                            onClick={() => deleteReview(row)}
                            disabled={deletingKey === key}
                            className="rounded-lg bg-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-200 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {deletingKey === key ? "Removing..." : "Remove"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
