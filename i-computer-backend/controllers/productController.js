import Product from "../models/product.js";
import { isAdmin } from "./userController.js";

export async function createProduct(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({
      message: "Forbidden: Admins only",
    });
  }

  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();

    return res.status(201).json({
      message: "Product created successfully",
      product: savedProduct,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error creating product",
      error: error.message,
    });
  }
}

export function getAllProducts(req, res) {
  if (isAdmin(req)) {
    Product.find()
      .then((products) => {
        res.json(products);
      })
      .catch((error) => {
        res.status(500).json({
          message: "Error fetching products",
          error: error.message,
        });
      });
  } else {
    Product.find({ isAvailable: true })
      .then((products) => {
        res.json(products);
      })
      .catch((error) => {
        res.status(500).json({
          message: "Error fetching products",
          error: error.message,
        });
      });
  }
}



export function deleteProducts(req, res) {
    if (!isAdmin(req)) {
        return res.status(403).json({
            message: "Forbidden: Admins only"
        });
    }

    const productId = req.params.productId;

    Product.deleteOne({ productId: productId }).then(() => {
        return res.status(200).json({ 
            message: "Product deleted successfully"
        });
    }).catch((error) => {
        return res.status(500).json({
            message: "Error deleting product",
            error: error.message
        });
    });
}


export  function updateProduct(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({
      message: "Forbidden: Admins only",
    });
  }

  const productId = req.params.productId;

  Product.updateOne({ productId: productId }, req.body)
    .then(() => {
      return res.status(200).json({
        message: "Product updated successfully",
      });
    })}

    export function getProductByID(req, res) {
      const pId = req.params.productId;
    
      Product.findOne({ productId: pId })
        .then((product) => {
          if (!product) { 
            return res.status(404).json({
              message: "Product not found",
            });
          }
          return res.json(product);
        })
        .catch((error) => {
          return res.status(500).json({
            message: "Error fetching product",
            error: error.message,
          });
        }); 
    }
