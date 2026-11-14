import mongoose from "mongoose";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import { resolveAnalyticsRange } from "./analytics.controller.js";

const DAY_MS = 24 * 60 * 60 * 1000;

const sum = (rows, key) => Number(rows[0]?.[key] || 0);

export const buildCreatedAtRangeFilter = (startDate, endDate) => ({
  createdAt: mongoose.trusted({ $gte: startDate, $lte: endDate }),
});

const percentageChange = (current, previous) => {
  if (previous === 0) {
    return current === 0 ? 0 : null;
  }
  return ((current - previous) / previous) * 100;
};

const getOrderTotals = (dateRange) =>
  Order.aggregate([
    { $match: { createdAt: dateRange } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        paidOrders: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$paymentStatus", "Paid"] },
                  { $ne: ["$orderStatus", "Cancelled"] },
                ],
              },
              1,
              0,
            ],
          },
        },
        revenue: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$paymentStatus", "Paid"] },
                  { $ne: ["$orderStatus", "Cancelled"] },
                ],
              },
              "$totalPrice",
              0,
            ],
          },
        },
      },
    },
  ]);

export const getDashboardStats = async (req, res) => {
  try {
    const { startDate, endDate } = resolveAnalyticsRange(
      req.query.from,
      req.query.to,
    );
    const rangeDuration = endDate.getTime() - startDate.getTime() + 1;
    const previousStartDate = new Date(startDate.getTime() - rangeDuration);
    const previousEndDate = new Date(startDate.getTime() - 1);
    const dateRange = { $gte: startDate, $lte: endDate };
    const previousDateRange = {
      $gte: previousStartDate,
      $lte: previousEndDate,
    };

    const [
      currentOrderTotals,
      previousOrderTotals,
      currentCustomerCount,
      previousCustomerCount,
      totalCustomerCount,
      totalProducts,
      lowStockProducts,
      trendRows,
      orderStatusRows,
      recentOrders,
      topProducts,
    ] = await Promise.all([
      getOrderTotals(dateRange),
      getOrderTotals(previousDateRange),
      User.countDocuments({
        role: "customer",
        ...buildCreatedAtRangeFilter(startDate, endDate),
      }),
      User.countDocuments({
        role: "customer",
        ...buildCreatedAtRangeFilter(previousStartDate, previousEndDate),
      }),
      User.countDocuments({ role: "customer" }),
      Product.countDocuments(),
      Product.find({ stock: mongoose.trusted({ $lte: 10 }) })
        .select("name stock images isActive")
        .sort({ stock: 1, name: 1 })
        .limit(10)
        .lean(),
      Order.aggregate([
        { $match: { createdAt: dateRange } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            orders: { $sum: 1 },
            revenue: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$paymentStatus", "Paid"] },
                      { $ne: ["$orderStatus", "Cancelled"] },
                    ],
                  },
                  "$totalPrice",
                  0,
                ],
              },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $match: { createdAt: dateRange } },
        { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
      ]),
      Order.find(buildCreatedAtRangeFilter(startDate, endDate))
        .sort({ createdAt: -1 })
        .limit(8)
        .populate("user", "fullName email")
        .lean(),
      Order.aggregate([
        {
          $match: {
            createdAt: dateRange,
            paymentStatus: "Paid",
            orderStatus: { $ne: "Cancelled" },
          },
        },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.product",
            quantitySold: { $sum: "$items.quantity" },
            revenue: {
              $sum: { $multiply: ["$items.price", "$items.quantity"] },
            },
          },
        },
        { $sort: { quantitySold: -1, revenue: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0,
            productId: "$_id",
            name: { $ifNull: ["$product.name", "Deleted product"] },
            image: { $ifNull: [{ $arrayElemAt: ["$product.images.url", 0] }, ""] },
            quantitySold: 1,
            revenue: 1,
          },
        },
      ]),
    ]);

    const trendByDate = new Map(trendRows.map((row) => [row._id, row]));
    const salesTrend = [];
    for (
      let timestamp = Date.UTC(
        startDate.getUTCFullYear(),
        startDate.getUTCMonth(),
        startDate.getUTCDate(),
      );
      timestamp <= endDate.getTime();
      timestamp += DAY_MS
    ) {
      const date = new Date(timestamp).toISOString().slice(0, 10);
      const point = trendByDate.get(date);
      salesTrend.push({
        date,
        orders: point?.orders || 0,
        revenue: point?.revenue || 0,
      });
    }

    const revenue = sum(currentOrderTotals, "revenue");
    const paidOrders = sum(currentOrderTotals, "paidOrders");
    const previousRevenue = sum(previousOrderTotals, "revenue");
    const previousPaidOrders = sum(previousOrderTotals, "paidOrders");
    const newCustomers = currentCustomerCount;

    return res.status(200).json({
      success: true,
      range: { from: startDate, to: endDate },
      dashboard: {
        overview: {
          revenue,
          totalOrders: sum(currentOrderTotals, "totalOrders"),
          paidOrders,
          averageOrderValue: paidOrders ? revenue / paidOrders : 0,
          newCustomers,
          totalCustomers: totalCustomerCount,
          totalProducts,
          revenueChange: percentageChange(revenue, previousRevenue),
          ordersChange: percentageChange(
            sum(currentOrderTotals, "totalOrders"),
            sum(previousOrderTotals, "totalOrders"),
          ),
          customersChange: percentageChange(
            currentCustomerCount,
            previousCustomerCount,
          ),
          averageOrderValueChange: percentageChange(
            paidOrders ? revenue / paidOrders : 0,
            previousPaidOrders ? previousRevenue / previousPaidOrders : 0,
          ),
        },
        salesTrend,
        ordersByStatus: orderStatusRows,
        recentOrders,
        topProducts,
        lowStockProducts,
      },
    });
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Dashboard Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load dashboard data.",
    });
  }
};
