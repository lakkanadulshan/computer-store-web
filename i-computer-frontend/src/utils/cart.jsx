const CART_STORAGE_KEY = "i-computer-cart";

function emitCartChange() {
	if (typeof window === "undefined") return;

	window.dispatchEvent(new Event("cart-updated"));
}

function readCart() {
	if (typeof window === "undefined") return [];

	try {
		const raw = window.localStorage.getItem(CART_STORAGE_KEY);
		if (!raw) return [];

		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch (error) {
		console.error("Failed to read cart", error);
		return [];
	}
}

function writeCart(cart) {
	if (typeof window === "undefined") return cart;

	window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
	emitCartChange();
	return cart;
}

function getProductKey(product) {
	return product?._id || product?.productId || product?.id || null;
}

export function getCart() {
	return readCart();
}

export function addToCart(product) {
	if (!product) return readCart();

	const productKey = getProductKey(product);
	const quantityToAdd = Number(product.quantity) > 0 ? Number(product.quantity) : 1;
	const cart = readCart();

	const existingIndex = cart.findIndex((item) => getProductKey(item) === productKey);
	if (existingIndex >= 0) {
		const existingItem = cart[existingIndex];
		const nextQuantity = (Number(existingItem.quantity) || 1) + quantityToAdd;
		cart[existingIndex] = {
			...existingItem,
			...product,
			quantity: nextQuantity,
		};
	} else {
		cart.push({
			...product,
			quantity: quantityToAdd,
		});
	}

	return writeCart(cart);
}

export function updateCartQuantity(productKey, quantity) {
	const normalizedQuantity = Number(quantity);
	if (!productKey || Number.isNaN(normalizedQuantity)) return readCart();

	const cart = readCart();
	const nextCart = cart
		.map((item) => {
			if (getProductKey(item) !== productKey) return item;

			return {
				...item,
				quantity: normalizedQuantity,
			};
		})
		.filter((item) => Number(item.quantity) > 0);

	return writeCart(nextCart);
}

export function emptyCart() {
	if (typeof window === "undefined") return [];

	window.localStorage.removeItem(CART_STORAGE_KEY);
	emitCartChange();
	return [];
}
