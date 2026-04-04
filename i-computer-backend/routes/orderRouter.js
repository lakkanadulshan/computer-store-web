import express from 'express';
import { createOrder, getOrders, updateOrderState, updateOrderStatus } from '../controllers/orderController.js';

const orderRouter = express.Router();

orderRouter.get('/', getOrders);
orderRouter.post('/', createOrder);
orderRouter.patch('/:orderId/state', updateOrderState);
orderRouter.patch('/:orderId/status', updateOrderStatus);

export default orderRouter;
