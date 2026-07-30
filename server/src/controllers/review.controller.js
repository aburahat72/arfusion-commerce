import mongoose from "mongoose";
import Review from "../models/review.model.js";
import Product from "../models/product.model.js";

// addReview
// Add Review
export const addReview = async (req, res) => {
  try {
    // Logic started
    // Get logged-in user ID
    const userId = req.user._id;

    // Get request data
    const { productId, rating, comment } = req.body;

    // Check whether product ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Find active product
    const product = await Product.findOne({
      _id: productId,
      isActive: true,
    });

    // Check whether product exists
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check whether user has already reviewed this product
    const existingReview = await Review.findOne({
      user: userId,
      product: productId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    // Create review
    const review = await Review.create({
      user: userId,
      product: productId,
      rating,
      comment,
    });

    // Return created review
    return res.status(201).json({
      success: true,
      message: "Review added successfully",
      review,
    });
  } catch (error) {
    console.error("Add Review Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// getProductReviews
// Get Product Reviews
export const getProductReviews = async (req, res) => {
  try {
    // Logic started
    // Get product ID from URL
    const { productId } = req.params;

    // Check whether product ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Find active product
    const product = await Product.findOne({
      _id: productId,
      isActive: true,
    });

    // Check whether product exists
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Get all reviews for the product
    const reviews = await Review.find({
      product: productId,
    }).populate("user", "fullName");

    // Calculate average rating
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((total, review) => total + review.rating, 0) /
          reviews.length
        : 0;

    // Return reviews
    return res.status(200).json({
      success: true,
      count: reviews.length,
      averageRating: Number(averageRating.toFixed(1)),
      reviews,
    });
  } catch (error) {
    console.error("Get Reviews Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// updateReview
// Update Review
export const updateReview = async (req, res) => {
  try {
    // Logic started
    // Get logged-in user ID
    const userId = req.user._id;

    // Get review ID from URL
    const { reviewId } = req.params;

    // Get updated data
    const { rating, comment } = req.body;

    // Check whether review ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    // Find user's review
    const review = await Review.findOne({
      _id: reviewId,
      user: userId,
    });

    // Check whether review exists
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Update rating if provided
    if (rating !== undefined) {
      review.rating = rating;
    }

    // Update comment if provided
    if (comment !== undefined) {
      review.comment = comment;
    }

    // Save review
    await review.save();

    // Return updated review
    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    console.error("Update Review Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// deleteReview
// Delete Review
export const deleteReview = async (req, res) => {
  try {
    // Logic started
    // Get logged-in user ID
    const userId = req.user._id;

    // Get review ID from URL
    const { reviewId } = req.params;

    // Check whether review ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    // Find user's review
    const review = await Review.findOne({
      _id: reviewId,
      user: userId,
    });

    // Check whether review exists
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Delete review
    await review.deleteOne();

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete Review Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
