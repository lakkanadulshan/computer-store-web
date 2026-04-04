import React, { useState } from "react"
import axios from "axios"
import toast from "react-hot-toast"

// Delete button with a simple confirmation modal. Controlled by props; uses local state to toggle the dialog.
function ProductDeleteButton({
	onDelete, // optional external handler; if omitted, this component will call the API itself
	onDeleted, // optional callback after successful delete
	disabled,
	deviceId,
	label = "Delete",
	heading = "Delete product",
	bodyText = "Are you sure you want to delete this product?",
	confirmText = "Delete",
	cancelText = "Cancel",
	className = "",
}) {
	const [open, setOpen] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const dialogLabelId = "delete-dialog-title"
	const dialogDescId = "delete-dialog-desc"

	const openDialog = () => {
		if (!disabled) setOpen(true)
	}

	const closeDialog = () => setOpen(false)

	const confirmDelete = async () => {
		// If parent provided custom handler, delegate to it.
		if (onDelete) {
			closeDialog()
			onDelete()
			return
		}

		if (!deviceId) {
			toast.error("Missing product id")
			return
		}

		try {
			setIsSubmitting(true)
			const token = localStorage.getItem("token") || localStorage.getItem(" token")
			await axios.delete(`${import.meta.env.VITE_backend_URL}/products/${deviceId}`, {
				headers: token
					? {
						Authorization: `Bearer ${token}`,
					}
					: undefined,
			})
			toast.success("Product deleted")
			onDeleted?.(deviceId)
			closeDialog()
		} catch (err) {
			console.error("Failed to delete product", err)
			const message = err?.response?.data?.message || "Failed to delete product"
			toast.error(message)
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleOverlayClick = (e) => {
		if (e.target === e.currentTarget) closeDialog()
	}

	return (
		<>
			<button
				type="button"
				onClick={openDialog}
				disabled={disabled || isSubmitting}
				className={`rounded border px-3 py-1 text-xs font-semibold transition ${disabled || isSubmitting ? "cursor-not-allowed border-gray-200 text-gray-400" : "border-red-200 text-red-600 hover:bg-red-50"} ${className}`}
			>
				{isSubmitting ? "Deleting..." : label}
			</button>

			{open && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
					onClick={handleOverlayClick}
					role="dialog"
					aria-modal="true"
					aria-labelledby={dialogLabelId}
					aria-describedby={dialogDescId}
				>
					<div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl">
						<div className="flex items-start justify-between gap-3">
							<div>
								<p id={dialogLabelId} className="text-base font-semibold text-gray-900">{heading}</p>
								<p id={dialogDescId} className="mt-1 text-sm text-gray-700">{bodyText}</p>
								<p className="mt-2 text-xs text-gray-500">ID: {deviceId || "unknown"}</p>
							</div>
							<button
								type="button"
								onClick={closeDialog}
								className="rounded p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
								aria-label="Close dialog"
							>
								x
							</button>
						</div>
						<div className="mt-4 flex justify-end gap-2 text-xs font-semibold">
							<button
								type="button"
								onClick={closeDialog}
								className="rounded border border-gray-200 px-3 py-2 text-gray-700 transition hover:bg-gray-50"
							>
								{cancelText}
							</button>
							<button
								type="button"
								onClick={confirmDelete}
								disabled={isSubmitting}
								className={`rounded px-3 py-2 text-white transition ${isSubmitting ? "bg-red-300 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}`}
							>
								{isSubmitting ? "Deleting..." : confirmText}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	)
}

export default ProductDeleteButton
