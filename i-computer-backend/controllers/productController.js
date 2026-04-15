import Product from "../models/product.js";
import { isAdmin } from "./userController.js";

function calculateAverageRating(reviews = []) {
  if (!Array.isArray(reviews) || reviews.length === 0) {
    return 0;
  }

  const sum = reviews.reduce((acc, review) => acc + (Number(review.rating) || 0), 0);
  return Number((sum / reviews.length).toFixed(1));
}

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

export async function searchProducts(req, res) {
  const query = req.params.query;
  try {
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { altNames: { $elemMatch: { $regex: query, $options: "i" } } },
        { description: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ],
      isAvailable: true,
    });

    return res.json(products);

  }
  catch (error) {
    return res.status(500).json({
      message: "Error searching products",
      error: error.message,
    });
  }
}

export async function getProductReviews(req, res) {
  const pId = req.params.productId;

  try {
    const product = await Product.findOne({ productId: pId });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const reviews = Array.isArray(product.reviews)
      ? [...product.reviews].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      : [];

    return res.status(200).json({
      ratings: product.ratings || 0,
      totalReviews: reviews.length,
      reviews,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching product reviews",
      error: error.message,
    });
  }
}

export async function addProductReview(req, res) {
  if (!req.user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const pId = req.params.productId;
  const rating = Number(req.body?.rating);
  const comment = String(req.body?.comment || "").trim();
  const userEmail = String(req.user.email || "").trim().toLowerCase();
  const userName = `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim() || "Customer";

  if (!userEmail) {
    return res.status(400).json({
      message: "User email is missing in token",
    });
  }

  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({
      message: "Rating must be between 1 and 5",
    });
  }

  if (!comment) {
    return res.status(400).json({
      message: "Review comment is required",
    });
  }

  try {
    const product = await Product.findOne({ productId: pId });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (!Array.isArray(product.reviews)) {
      product.reviews = [];
    }

    const existingReview = product.reviews.find((review) => review.userEmail === userEmail);

    if (existingReview) {
      existingReview.rating = rating;
      existingReview.comment = comment;
      existingReview.userName = userName;
      existingReview.updatedAt = new Date();
    } else {
      product.reviews.push({
        userEmail,
        userName,
        rating,
        comment,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    product.ratings = calculateAverageRating(product.reviews);
    await product.save();

    const reviews = [...product.reviews].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    return res.status(200).json({
      message: existingReview ? "Review updated successfully" : "Review added successfully",
      ratings: product.ratings,
      totalReviews: reviews.length,
      reviews,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error saving product review",
      error: error.message,
    });
  }
}

export async function deleteProductReview(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }

  const pId = req.params.productId;
  const reviewId = req.params.reviewId;

  try {
    const product = await Product.findOne({ productId: pId });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const beforeCount = Array.isArray(product.reviews) ? product.reviews.length : 0;
    product.reviews = (product.reviews || []).filter(
      (review) => String(review._id) !== String(reviewId)
    );

    if (product.reviews.length === beforeCount) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    product.ratings = calculateAverageRating(product.reviews);
    await product.save();

    return res.status(200).json({
      message: "Review deleted successfully",
      ratings: product.ratings,
      totalReviews: product.reviews.length,
      reviews: product.reviews,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error deleting review",
      error: error.message,
    });
  }
}
