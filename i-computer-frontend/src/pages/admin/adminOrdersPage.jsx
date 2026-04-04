import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const ORDER_STATES = ["pending", "processing", "shipped", "delivered", "cancelled"];

function getAuthToken() {
	return localStorage.getItem("token") || localStorage.getItem(" token") || "";
}

function formatCurrency(value) {
	const num = Number(value) || 0;
	return `LKR ${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateValue) {
	if (!dateValue) return "-";
	const date = new Date(dateValue);
	if (Number.isNaN(date.getTime())) return "-";
	return date.toLocaleString();
}

export default function AdminOrdersPage() {
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [statusUpdating, setStatusUpdating] = useState("");
	const [query, setQuery] = useState("");
	const [selectedOrder, setSelectedOrder] = useState(null);
	const [selectedStatus, setSelectedStatus] = useState("pending");
	const [adminNote, setAdminNote] = useState("");
	const [savingNote, setSavingNote] = useState(false);

	useEffect(() => {
		const controller = new AbortController();

		async function loadOrders() {
			setLoading(true);
			const token = getAuthToken();

			if (!token) {
				toast.error("Please log in as admin to view orders");
				setLoading(false);
				return;
			}

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
				const message = error?.response?.data?.message || "Failed to load orders";
				toast.error(message);
			} finally {
				setLoading(false);
			}
		}

		loadOrders();
		return () => controller.abort();
	}, []);

	const filteredOrders = useMemo(() => {
		const search = query.trim().toLowerCase();
		if (!search) return orders;

		return orders.filter((order) => {
			const fields = [
				order.orderId,
				order.name,
				order.email,
				order.phone,
				order.address,
				order.state,
			]
				.filter(Boolean)
				.map((value) => String(value).toLowerCase());

			return fields.some((value) => value.includes(search));
		});
	}, [orders, query]);

	async function handleStateChange(orderId, newState) {
		const token = getAuthToken();

		if (!token) {
			toast.error("Please log in as admin first");
			return;
		}

		setStatusUpdating(orderId);

		try {
			const response = await axios.patch(
				`${import.meta.env.VITE_backend_URL}/orders/${orderId}/status`,
				{ state: newState },
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			const updatedOrder = response?.data?.order;

			setOrders((prev) =>
				prev.map((order) =>
					order.orderId === orderId
						? {
								...order,
								...(updatedOrder || { state: newState }),
							}
						: order
				)
			);
			toast.success("Order status updated");
		} catch (error) {
			const message = error?.response?.data?.message || "Failed to update order status";
			toast.error(message);
		} finally {
			setStatusUpdating("");
		}
	}

	useEffect(() => {
		if (!selectedOrder) return undefined;

		function onKeyDown(event) {
			if (event.key === "Escape") {
				setSelectedOrder(null);
			}
		}

		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [selectedOrder]);

	function getCustomerName(order) {
		if (order?.name) return order.name;
		const firstName = order?.customer?.firstName || "";
		const lastName = order?.customer?.lastName || "";
		const fullName = `${firstName} ${lastName}`.trim();
		return fullName || "Unknown";
	}

	function getCustomerEmail(order) {
		return order?.email || order?.customer?.email || "-";
	}

	function getCustomerPhone(order) {
		return order?.phone || order?.customer?.phone || "-";
	}

	function getAddress(order) {
		if (order?.address) return order.address;
		const shipping = order?.shippingAddress;
		if (!shipping) return "-";
		return [shipping.address, shipping.city, shipping.state, shipping.zipCode, shipping.country]
			.filter(Boolean)
			.join(", ") || "-";
	}

	function getItemName(item) {
		return item?.name || item?.title || item?.productName || item?.product?.name || "Unnamed item";
	}

	function openOrderDetails(order) {
		setSelectedOrder(order);
		setSelectedStatus(order?.state || "pending");
		setAdminNote("");
	}

	function closeOrderDetails() {
		if (savingNote) return;
		setSelectedOrder(null);
		setAdminNote("");
	}

	async function handleSaveNoteAndStatus() {
		if (!selectedOrder?.orderId) return;

		const token = getAuthToken();
		if (!token) {
			toast.error("Please log in as admin first");
			return;
		}

		if (!adminNote.trim()) {
			toast.error("Please enter a note");
			return;
		}

		setSavingNote(true);

		try {
			const response = await axios.patch(
				`${import.meta.env.VITE_backend_URL}/orders/${selectedOrder.orderId}/status`,
				{
					state: selectedStatus,
					note: adminNote.trim(),
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			const updatedOrder = response?.data?.order;

			setOrders((prev) =>
				prev.map((order) =>
					order.orderId === selectedOrder.orderId
						? {
								...order,
								...(updatedOrder || { state: selectedStatus }),
							}
						: order
				)
			);

			if (updatedOrder) {
				setSelectedOrder(updatedOrder);
				setSelectedStatus(updatedOrder.state || selectedStatus);
			}

			setAdminNote("");
			toast.success("Order note and status updated");
		} catch (error) {
			const message = error?.response?.data?.message || "Failed to update note and status";
			toast.error(message);
		} finally {
			setSavingNote(false);
		}
	}

	return (
		<>
			<div className="min-h-full bg-slate-50/70 p-3 sm:p-6">
			<div className="mx-auto flex max-w-6xl flex-col gap-4">
				<div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
					<div>
						<h1 className="text-2xl font-semibold text-slate-900">Orders</h1>
						<p className="text-sm text-slate-600">
							{loading ? "Loading orders..." : `${filteredOrders.length} order${filteredOrders.length !== 1 ? "s" : ""}`}
						</p>
					</div>

					<input
						type="text"
						placeholder="Search by ID, name, email..."
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-accent/30 transition focus:border-accent focus:ring sm:max-w-xs"
					/>
				</div>

				<div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-100">
							<thead className="bg-slate-50">
								<tr>
									<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Order ID</th>
									<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Customer</th>
									<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Contact</th>
									<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Items</th>
									<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Total</th>
									<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Date</th>
									<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Status</th>
									<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">View</th>
								</tr>
							</thead>

							<tbody className="divide-y divide-slate-100 bg-white">
								{loading && (
									<tr>
										<td colSpan="8" className="px-4 py-10 text-center">
											<div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-accent" />
										</td>
									</tr>
								)}

								{!loading && filteredOrders.length === 0 && (
									<tr>
										<td colSpan="8" className="px-4 py-8 text-center text-sm text-slate-600">
											No orders found.
										</td>
									</tr>
								)}

								{!loading &&
									filteredOrders.map((order) => {
										const itemCount = Array.isArray(order.items)
											? order.items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0)
											: 0;

										return (
											<tr key={order._id || order.orderId} className="align-top transition hover:bg-slate-50/80">
												<td className="px-4 py-3 text-sm font-medium text-gray-900">{order.orderId || "-"}</td>
												<td className="px-4 py-3 text-sm text-gray-800">
													<div className="font-medium">{order.name || "Unknown"}</div>
													<div className="text-xs text-gray-500">{order.address || "-"}</div>
												</td>
												<td className="px-4 py-3 text-sm text-gray-700">
													<div>{order.email || "-"}</div>
													<div className="text-xs text-gray-500">{order.phone || "-"}</div>
												</td>
												<td className="px-4 py-3 text-sm text-gray-700">{itemCount}</td>
												<td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(order.total)}</td>
												<td className="px-4 py-3 text-sm text-gray-700">{formatDate(order.date)}</td>
												<td className="px-4 py-3 text-sm">
													<select
														value={order.state || "pending"}
														onChange={(e) => handleStateChange(order.orderId, e.target.value)}
														disabled={statusUpdating === order.orderId}
														className="rounded-md border border-gray-200 px-2 py-1 text-sm text-gray-800 outline-none ring-accent/30 transition focus:border-accent focus:ring disabled:cursor-not-allowed"
													>
														{ORDER_STATES.map((state) => (
															<option key={state} value={state}>
																{state}
															</option>
														))}
													</select>
												</td>
												<td className="px-4 py-3 text-sm">
													<button
														type="button"
														onClick={() => openOrderDetails(order)}
														className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
													>
														View Info
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
			{selectedOrder && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
					onClick={closeOrderDetails}
				>
					<div
						className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
							<div>
								<h2 className="text-lg font-semibold text-gray-900">Order Details</h2>
								<p className="text-sm text-gray-600">Order ID: {selectedOrder.orderId || "-"}</p>
							</div>
							<button
								type="button"
								onClick={closeOrderDetails}
								disabled={savingNote}
								className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-50"
							>
								Close
							</button>
						</div>

						<div className="space-y-5 px-5 py-4">
							<div className="grid gap-3 rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700 sm:grid-cols-2">
								<div>
									<p className="text-xs uppercase tracking-wide text-gray-500">Customer</p>
									<p className="font-medium text-gray-900">{getCustomerName(selectedOrder)}</p>
								</div>
								<div>
									<p className="text-xs uppercase tracking-wide text-gray-500">Email</p>
									<p className="font-medium text-gray-900">{getCustomerEmail(selectedOrder)}</p>
								</div>
								<div>
									<p className="text-xs uppercase tracking-wide text-gray-500">Phone</p>
									<p className="font-medium text-gray-900">{getCustomerPhone(selectedOrder)}</p>
								</div>
								<div>
									<p className="text-xs uppercase tracking-wide text-gray-500">Status</p>
									<p className="font-medium capitalize text-gray-900">{selectedOrder.state || "pending"}</p>
								</div>
								<div>
									<p className="text-xs uppercase tracking-wide text-gray-500">Date</p>
									<p className="font-medium text-gray-900">{formatDate(selectedOrder.date || selectedOrder.createdAt)}</p>
								</div>
								<div>
									<p className="text-xs uppercase tracking-wide text-gray-500">Total</p>
									<p className="font-medium text-gray-900">{formatCurrency(selectedOrder.total)}</p>
								</div>
								<div className="sm:col-span-2">
									<p className="text-xs uppercase tracking-wide text-gray-500">Address</p>
									<p className="font-medium text-gray-900">{getAddress(selectedOrder)}</p>
								</div>
							</div>

							<div>
								<h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-700">Ordered Items</h3>
								<div className="space-y-2">
									{(Array.isArray(selectedOrder.items) ? selectedOrder.items : []).length === 0 ? (
										<div className="rounded-lg border border-dashed border-gray-200 px-3 py-4 text-sm text-gray-500">
											No items found for this order.
										</div>
									) : (
										(Array.isArray(selectedOrder.items) ? selectedOrder.items : []).map((item, index) => {
											const qty = Number(item?.quantity) || 1;
											const price = Number(item?.price) || 0;
											const rowKey = item?._id || item?.productId || item?.id || `${getItemName(item)}-${index}`;

											return (
												<div key={rowKey} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 text-sm">
													<div>
														<p className="font-medium text-gray-900">{getItemName(item)}</p>
														<p className="text-xs text-gray-500">Qty: {qty}</p>
													</div>
													<p className="font-medium text-gray-900">{formatCurrency(price * qty)}</p>
												</div>
											);
										})
									)}
								</div>
							</div>

							<div className="rounded-lg border border-gray-100 p-4">
								<h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-700">Admin Update</h3>
								<div className="grid gap-3 sm:grid-cols-2">
									<div>
										<label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Status</label>
										<select
											value={selectedStatus}
											onChange={(e) => setSelectedStatus(e.target.value)}
											disabled={savingNote}
											className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none ring-accent/30 focus:border-accent focus:ring"
										>
											{ORDER_STATES.map((state) => (
												<option key={state} value={state}>
													{state}
												</option>
											))}
										</select>
									</div>
									<div className="sm:col-span-2">
										<label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Note</label>
										<textarea
											rows="4"
											value={adminNote}
											onChange={(e) => setAdminNote(e.target.value)}
											disabled={savingNote}
											placeholder="Add admin note about this status change"
											className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none ring-accent/30 focus:border-accent focus:ring"
										/>
									</div>
								</div>
								<div className="mt-3 flex justify-end">
									<button
										type="button"
										onClick={handleSaveNoteAndStatus}
										disabled={savingNote}
										className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
									>
										{savingNote ? "Saving..." : "Save Change"}
									</button>
								</div>
								{selectedOrder.notes ? (
									<p className="mt-3 whitespace-pre-line rounded-md bg-gray-50 p-3 text-xs text-gray-600">{selectedOrder.notes}</p>
								) : null}
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
