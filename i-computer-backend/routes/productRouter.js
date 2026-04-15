import express from 'express';
import { createProduct, getAllProducts, deleteProducts, updateProduct, getProductByID, searchProducts, getProductReviews, addProductReview, deleteProductReview } from '../controllers/productController.js';

const productRouter =  express.Router();

productRouter.get('/',getAllProducts);

productRouter.get('/search/:query', searchProducts);
productRouter.get('/:productId/reviews', getProductReviews);
productRouter.post('/:productId/reviews', addProductReview);
productRouter.delete('/:productId/reviews/:reviewId', deleteProductReview);

productRouter.delete('/:productId',deleteProducts);

productRouter.post('/',createProduct);

productRouter.put('/:productId',updateProduct);

productRouter.get('/:productId', getProductByID);



export default productRouter;
