import express from 'express';
import { createProduct, getAllProducts,deleteProducts,updateProduct,getProductByID} from '../controllers/productController.js';
import { get } from 'mongoose';

const productRouter =  express.Router();

productRouter.get('/',getAllProducts);

productRouter.delete('/:productId',deleteProducts);

productRouter.post('/',createProduct);

productRouter.put('/:productId',updateProduct);

productRouter.get('/:productId', getProductByID);



export default productRouter;
