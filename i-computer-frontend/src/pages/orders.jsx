import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

function getAuthToken() {
	return localStorage.getItem("token") || localStorage.getItem(" token") || "";
}

function formatCurrency(value) {
	const num = Number(value) || 0;
	return `LKR ${num.toLocaleString(undefined, {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})}`;
}

function formatDate(dateValue) {
	if (!dateValue) return "-";
	const date = new Date(dateValue);
	if (Number.isNaN(date.getTime())) return "-";
	return date.toLocaleString();
}

export default function OrdersPage() {
	const navigate = useNavigate();
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const token = getAuthToken();

		if (!token) {
			toast.error("Please login to view your orders");
			navigate("/login");
			return;
		}

		const controller = new AbortController();

		async function loadOrders() {
			setLoading(true);
			try {
				const response = await axios.get(`${import.meta.env.VITE_backend_URL}/orders`, {
					signal: controller.signal,
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				const list = Array.isArray(response.data) ? response.data : response.data?.orders || [];
				setOrders(list);
			} catch (error) {
				if (axios.isCancel(error)) return;
				const message = error?.response?.data?.message || "Failed to load your orders";
				toast.error(message);
			} finally {
				setLoading(false);
			}
		}

		loadOrders();

		return () => controller.abort();
	}, [navigate]);

	const totalPurchasedItems = useMemo(() => {
		return orders.reduce((sum, order) => {
			const itemCount = Array.isArray(order.items)
				? order.items.reduce((orderSum, item) => orderSum + (Number(item.quantity) || 1), 0)
				: 0;
			return sum + itemCount;
		}, 0);
	}, [orders]);

	return (
		<div className="w-full min-h-full bg-primary text-text">
			<div className="mx-auto max-w-6xl px-4 py-10">
				<div className="mb-8 flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-white/10 bg-secondary p-6 shadow-sm">
					<div>
						<h1 className="font-heading text-3xl text-text">My Orders</h1>
						<p className="mt-2 text-sm text-muted">
							See all products you purchased and track order status.
						</p>
					</div>
					<div className="text-right">
						<p className="text-sm text-muted">Total orders</p>
						<p className="text-2xl font-semibold text-accent">{orders.length}</p>
						<p className="text-xs text-muted">{totalPurchasedItems} items purchased</p>
					</div>
				</div>

				{loading ? (
					<div className="flex items-center justify-center rounded-2xl border border-white/10 bg-secondary p-10">
						<div className="h-9 w-9 animate-spin rounded-full border-4 border-white/20 border-t-accent" />
					</div>
				) : orders.length === 0 ? (
					<div className="rounded-2xl border border-white/10 bg-secondary p-8 text-center">
						<h2 className="text-xl font-semibold">No orders yet</h2>
						<p className="mt-2 text-sm text-muted">When you buy products, they will appear here.</p>
						<Link
							to="/products"
							className="mt-5 inline-flex rounded-lg bg-accent px-4 py-2 text-sm font-medium text-primary transition hover:brightness-110"
						>
							Start shopping
						</Link>
					</div>
				) : (
					<div className="space-y-6">
						{orders.map((order) => (
							<div
								key={order._id || order.orderId}
								className="rounded-2xl border border-white/10 bg-secondary p-5 shadow-sm fade-in-up"
							>
								<div className="mb-4 grid gap-3 border-b border-white/10 pb-4 sm:grid-cols-2 lg:grid-cols-4">
									<div>
										<p className="text-xs uppercase tracking-wide text-muted">Order ID</p>
										<p className="mt-1 font-semibold">{order.orderId || "-"}</p>
									</div>
									<div>
										<p className="text-xs uppercase tracking-wide text-muted">Date</p>
										<p className="mt-1 font-semibold">{formatDate(order.date)}</p>
									</div>
									<div>
										<p className="text-xs uppercase tracking-wide text-muted">Status</p>
										<p className="mt-1 inline-flex rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase text-accent">
											{order.state || "pending"}
										</p>
									</div>
									<div>
										<p className="text-xs uppercase tracking-wide text-muted">Total</p>
										<p className="mt-1 font-semibold text-accent">{formatCurrency(order.total)}</p>
									</div>
								</div>

								<div className="space-y-3">
									{(order.items || []).map((item, index) => (
										<div
											key={`${item.productId || item.name || "item"}-${index}`}
											className="flex items-center gap-3 rounded-xl border border-white/10 bg-primary p-3"
										>
											<img
												src={item.image || "/logo.jpg"}
												alt={item.name || "Product image"}
												className="h-16 w-16 rounded-lg object-cover"
											/>
											<div className="min-w-0 flex-1">
												<p className="truncate text-sm font-semibold">{item.name || "Unnamed product"}</p>
												<p className="text-xs text-muted">Qty: {Number(item.quantity) || 1}</p>
											</div>
											<p className="text-sm font-semibold text-accent">{formatCurrency(item.price)}</p>
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
