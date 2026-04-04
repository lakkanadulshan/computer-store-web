import Order from "../models/order.js";
import Product from "../models/product.js";
import mongoose from "mongoose";
import { isAdmin } from "./userController.js";

export async function getOrders(req, res) {
  if (!req.user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  try {
    const isAdmin = req.user.role === "admin";

    if (isAdmin) {
      const allOrders = await Order.find().sort({ date: -1 });
      return res.status(200).json(allOrders);
    }

    const userOrders = await Order.find({
      $or: [
        { email: req.user.email },
        { userId: req.user.userId },
        { userId: req.user._id },
        { userId: req.user.id },
      ],
    }).sort({ date: -1 });

    return res.status(200).json(userOrders);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
}

export async function createOrder(req, res) {
  if (!req.user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  try {
    const latestOrder = await Order.findOne().sort({ date: -1 });

    let orderId = "ORD00001";
    if (latestOrder != null && latestOrder.orderId) {
      const latestOrderId = latestOrder.orderId;
      const latestOrderNumberString = latestOrderId.replace("ORD", "");
      const latestOrderNumber = parseInt(latestOrderNumberString, 10);
      let newOrderNumber = latestOrderNumber + 1;
      let newOrderNumberString = newOrderNumber.toString().padStart(5, "0");

      orderId = "ORD" + newOrderNumberString;
    }

    if (!Array.isArray(req.body.items) || req.body.items.length === 0) {
      return res.status(400).json({
        message: "Order must include at least one item",
      });
    }

    const items = [];
    let total = 0;

    for (let i = 0; i < req.body.items.length; i++) {
      const itemFromClient = req.body.items[i];
      const requestedProductId = itemFromClient.productId || itemFromClient.id || itemFromClient._id;
      const productQuery = [{ productId: requestedProductId }];
      if (mongoose.Types.ObjectId.isValid(requestedProductId)) {
        productQuery.push({ _id: requestedProductId });
      }
      const product = await Product.findOne({
        $or: productQuery,
      });
      if (product == null) {
        return res.status(400).json({
          message: `Product with ID ${requestedProductId} not found`,
        });
      }

      const quantity = Number(itemFromClient.quantity) || 1;
      items.push({
        productId: product.productId,
        name: product.name,
        price: product.price,
        quantity: quantity,
        image: product.images[0],
      });

      total += product.price * quantity;
    }

    let name = req.body.name || req.body.customer?.firstName;
    if (name == null) {
      name = req.user.firstName + " " + req.user.lastName;
    }

    const address = req.body.address || req.body.shippingAddress?.address;
    const phone = req.body.phone || req.body.customer?.phone;

    if (!address || !phone) {
      return res.status(400).json({
        message: "Address and phone are required",
      });
    }

    const userId = req.user.userId || req.user._id || req.user.id || req.user.email;

    const order = new Order({
      orderId: orderId,
      userId: userId,
      email: req.user.email,
      name: name,
      address: address,
      phone: phone,
      total: total,
      items: items,
      notes: req.body.notes,
    });

    await order.save();
    return res.status(201).json({
      message: "Order created successfully",
      orderId: orderId,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create order",
      error: error.message,
    });
  }
}

export async function updateOrderState(req, res) {
  if (!req.user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Forbidden",
    });
  }

  const validStates = ["pending", "processing", "shipped", "delivered", "cancelled"];
  const nextState = String(req.body.state || "").toLowerCase();

  if (!validStates.includes(nextState)) {
    return res.status(400).json({
      message: "Invalid order state",
    });
  }

  try {
    const updatedOrder = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      { state: nextState },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    return res.status(200).json({
      message: "Order state updated",
      order: updatedOrder,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update order state",
      error: error.message,
    });
  }
}

export async function updateOrderStatus (req, res) {
  if (!req.user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  if (!isAdmin(req)) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }

  const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
  const nextStatus = String(req.body.status || req.body.state || "").toLowerCase().trim();
  const adminNote = String(req.body.note || req.body.notes || "").trim();

  if (adminNote.length > 1000) {
    return res.status(400).json({
      message: "Note is too long",
    });
  }

  if (!validStatuses.includes(nextStatus)) {
    return res.status(400).json({
      message: "Invalid order status",
    });
  }

  try {
    const updatedOrder = await Order.findOne({ orderId: req.params.orderId });

    if (!updatedOrder) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    updatedOrder.state = nextStatus;

    if (adminNote.length > 0) {
      const actor = req.user.email || req.user.userId || "admin";
      const noteWithMeta = `[${new Date().toISOString()}] (${nextStatus}) [${actor}] ${adminNote}`;
      updatedOrder.notes = updatedOrder.notes
        ? `${updatedOrder.notes}\n${noteWithMeta}`
        : noteWithMeta;
    }

    await updatedOrder.save();

    return res.status(200).json({
      message: adminNote.length > 0 ? "Order status and note updated" : "Order status updated",
      order: updatedOrder,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update order status",
      error: error.message,
    });
  }
}