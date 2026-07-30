import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

// Get Analytics
export const getAnalytics = async (req, res) => {
  try {
    // Logic started
    // Monthly Revenue
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          orderStatus: "Delivered",
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: {
            $sum: "$totalPrice",
          },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    // Monthly Orders
    const monthlyOrders = await Order.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          orders: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    // Top Selling Products
    const topSellingProducts = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalSold: {
            $sum: "$items.quantity",
          },
        },
      },
      {
        $sort: {
          totalSold: -1,
        },
      },
      {
        $limit: 5,
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
    ]);

    // Top Categories
    const topCategories = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          totalProducts: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          totalProducts: -1,
        },
      },
    ]);

    // Top Customers
    const topCustomers = await Order.aggregate([
      {
        $group: {
          _id: "$user",
          totalSpent: {
            $sum: "$totalPrice",
          },
          totalOrders: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          totalSpent: -1,
        },
      },
      {
        $limit: 5,
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
    ]);

    // Revenue by Payment Method
    const paymentMethodRevenue = await Order.aggregate([
      {
        $match: {
          orderStatus: "Delivered",
        },
      },
      {
        $group: {
          _id: "$paymentMethod",
          revenue: {
            $sum: "$totalPrice",
          },
        },
      },
    ]);

    // Return analytics
    return res.status(200).json({
      success: true,
      analytics: {
        monthlyRevenue,
        monthlyOrders,
        topSellingProducts,
        topCategories,
        topCustomers,
        paymentMethodRevenue,
      },
    });
  } catch (error) {
    console.error("Analytics Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
