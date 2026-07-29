import Product from "../models/product.model.js";
import mongoose from "mongoose";

// Create Product - Admin only
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category, images } = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      stock,
      category,
      images,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create Product Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all active products with search - Public route
export const getAllProducts = async (req, res) => {
  try {
    //  Get search value from the query parameters
    const {
      search,
      category,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    // Base filter - always show only active products
    const filter = {
      isActive: true,
    };
    // If user provides a search value, search by name or description
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Filter products by category
    if (category) {
      filter.category = {
        $regex: `^${category}$`,
        $options: "i",
      };
    }

    // Filter products by price range
    if (minPrice || maxPrice) {
      const min = minPrice ? Number(minPrice) : undefined;
      const max = maxPrice ? Number(maxPrice) : undefined;

      // Check if price values are valid numbers
      if ((minPrice && Number.isNaN(min)) || (maxPrice && Number.isNaN(max))) {
        return res.status(400).json({
          success: false,
          message: "Price must be a valid number",
        });
      }

      // Prevent negative price values
      if ((min !== undefined && min < 0) || (max !== undefined && max < 0)) {
        return res.status(400).json({
          success: false,
          message: "Price cannot be negative",
        });
      }

      // Minimum price cannot be greater than maximum price
      if (min !== undefined && max !== undefined && min > max) {
        return res.status(400).json({
          success: false,
          message: "Minimum price cannot be greater than maximum price",
        });
      }

      // Create MongoDB price filter
      filter.price = {};

      if (min !== undefined) {
        filter.price.$gte = min;
      }

      if (max !== undefined) {
        filter.price.$lte = max;
      }
    }

    // Default sorting - newest products first
    let sortOption = {
      createdAt: -1,
    };

    // Apply requested sorting
    if (sort === "price_asc") {
      sortOption = { price: 1 };
    } else if (sort === "price_desc") {
      sortOption = { price: -1 };
    } else if (sort === "oldest") {
      sortOption = { createdAt: 1 };
    } else if (sort === "newest") {
      sortOption = { createdAt: -1 };
    }

    // Pagination
    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    // Validate page and limit
    if (
      !Number.isInteger(pageNumber) ||
      !Number.isInteger(limitNumber) ||
      pageNumber < 1 ||
      limitNumber < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Page and limit must be positive integers",
      });
    }

    // Calculate how many products to skip
    const skip = (pageNumber - 1) * limitNumber;

    // Get total number of matching products
    const totalProducts = await Product.countDocuments(filter);

    // Fetch, filter, sorting and pagination products
    // Fetch matching products using the filter
    const products = await Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNumber);

    // Return matching products
    return res.status(200).json({
      success: true,
      count: products.length,
      totalProducts,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalProducts / limitNumber),
      products,
    });
  } catch (error) {
    console.error("Get product Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get a single active product by ID - Public
export const getProductById = async (req, res) => {
  try {
    // Get product ID from URL parameters
    const { id } = req.params;

    // check if ID is a valid MongoDB ObjectID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Find active product by its MongoDB ID
    const product = await Product.findOne({
      _id: id,
      isActive: true,
    });

    // Check if product exists
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Return the product
    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get Product Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update product by ID - Admin only
export const updateProduct = async (req, res) => {
  try {
    // Get product ID from URL parameters
    const { id } = req.params;
    // Check whether ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Find product and update it with validated request data
    const product = await Product.findByIdAndUpdate(id, req.body, {
      returnDocument: "after",
      runValidators: true,
    });

    // Check if product exists
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Return updated product
    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update Product Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete product by ID - Admin only
export const deleteProduct = async (req, res) => {
  try {
    // Get product ID from URL
    const { id } = req.params;

    // Check whether ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Find and delete product
    const product = await Product.findByIdAndDelete(id);

    // Check if product exists
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete Product Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
