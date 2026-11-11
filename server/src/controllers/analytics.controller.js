import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_RANGE_DAYS = 366;

const parseDate = (value, endOfDay = false) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }
  const date = new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value
    ? null
    : date;
};

export const resolveAnalyticsRange = (from, to, now = new Date()) => {
  const endDate = to ? parseDate(to, true) : new Date(now);
  const startDate = from
    ? parseDate(from)
    : new Date(endDate.getTime() - 29 * DAY_MS);

  if (!startDate || !endDate || startDate > endDate) {
    const error = new Error("Provide a valid date range with start before end.");
    error.statusCode = 400;
    throw error;
  }
  if (endDate.getTime() - startDate.getTime() > MAX_RANGE_DAYS * DAY_MS) {
    const error = new Error(`Date ranges cannot exceed ${MAX_RANGE_DAYS} days.`);
    error.statusCode = 400;
    throw error;
  }
  return { startDate, endDate };
};

const sum = (rows, key) => Number(rows[0]?.[key] || 0);

export const getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = resolveAnalyticsRange(
      req.query.from,
      req.query.to,
    );
    const orderDateFilter = { createdAt: { $gte: startDate, $lte: endDate } };
    const paidOrderFilter = {
      ...orderDateFilter,
      paymentStatus: "Paid",
      orderStatus: { $ne: "Cancelled" },
    };

    const [
      orderTotals,
      paidTotals,
      trendRows,
      topProducts,
      topCustomers,
      customerCounts,
      inventory,
      lowStockProducts,
      returnRows,
      refundTotals,
      paymentMethods,
    ] = await Promise.all([
      Order.aggregate([
        { $match: orderDateFilter },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            cancelledOrders: {
              $sum: { $cond: [{ $eq: ["$orderStatus", "Cancelled"] }, 1, 0] },
            },
          },
        },
      ]),
      Order.aggregate([
        { $match: paidOrderFilter },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$totalPrice" },
            orders: { $sum: 1 },
          },
        },
      ]),
      Order.aggregate([
        { $match: orderDateFilter },
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
        { $match: paidOrderFilter },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.product",
            quantitySold: { $sum: "$items.quantity" },
            revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          },
        },
        { $sort: { quantitySold: -1, revenue: -1 } },
        { $limit: 10 },
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
            quantitySold: 1,
            revenue: 1,
          },
        },
      ]),
      Order.aggregate([
        { $match: paidOrderFilter },
        {
          $group: {
            _id: "$user",
            totalSpent: { $sum: "$totalPrice" },
            totalOrders: { $sum: 1 },
          },
        },
        { $sort: { totalSpent: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "customer",
          },
        },
        { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0,
            customerId: "$_id",
            fullName: { $ifNull: ["$customer.fullName", "Deleted customer"] },
            email: "$customer.email",
            totalSpent: 1,
            totalOrders: 1,
          },
        },
      ]),
      Promise.all([
        User.countDocuments({ role: "customer" }),
        User.countDocuments({
          role: "customer",
          createdAt: { $gte: startDate, $lte: endDate },
        }),
      ]),
      Product.aggregate([
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            activeProducts: {
              $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
            },
            unitsInStock: { $sum: "$stock" },
            lowStockProducts: {
              $sum: { $cond: [{ $lte: ["$stock", 10] }, 1, 0] },
            },
            outOfStockProducts: {
              $sum: { $cond: [{ $eq: ["$stock", 0] }, 1, 0] },
            },
          },
        },
      ]),
      Product.find({ stock: { $lte: 10 } })
        .select("name stock isActive")
        .sort({ stock: 1, name: 1 })
        .limit(10)
        .lean(),
      Order.aggregate([
        {
          $match: {
            returnRequestedAt: { $gte: startDate, $lte: endDate },
            returnStatus: { $ne: "Not Requested" },
          },
        },
        { $group: { _id: "$returnStatus", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Order.aggregate([
        {
          $match: {
            refundStatus: "Completed",
            refundCompletedAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: null,
            totalRefunds: { $sum: "$totalPrice" },
            refundCount: { $sum: 1 },
          },
        },
      ]),
      Order.aggregate([
        { $match: paidOrderFilter },
        {
          $group: {
            _id: "$paymentMethod",
            revenue: { $sum: "$totalPrice" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { revenue: -1 } },
      ]),
    ]);

    const trendByDate = new Map(trendRows.map((row) => [row._id, row]));
    const trend = [];
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
      trend.push({
        date,
        orders: point?.orders || 0,
        revenue: point?.revenue || 0,
      });
    }

    const totalOrders = sum(orderTotals, "totalOrders");
    const totalRevenue = sum(paidTotals, "revenue");
    const paidOrderCount = sum(paidTotals, "orders");

    return res.status(200).json({
      success: true,
      range: { from: startDate, to: endDate },
      overview: {
        totalOrders,
        paidOrders: paidOrderCount,
        cancelledOrders: sum(orderTotals, "cancelledOrders"),
        revenue: totalRevenue,
        averageOrderValue: paidOrderCount ? totalRevenue / paidOrderCount : 0,
        totalCustomers: customerCounts[0],
        newCustomers: customerCounts[1],
      },
      salesTrend: trend,
      topProducts,
      topCustomers,
      inventory: {
        totalProducts: sum(inventory, "totalProducts"),
        activeProducts: sum(inventory, "activeProducts"),
        unitsInStock: sum(inventory, "unitsInStock"),
        lowStockProducts: sum(inventory, "lowStockProducts"),
        outOfStockProducts: sum(inventory, "outOfStockProducts"),
        lowStockItems: lowStockProducts,
      },
      returns: returnRows.reduce(
        (result, row) => ({ ...result, [row._id]: row.count }),
        { total: returnRows.reduce((count, row) => count + row.count, 0) },
      ),
      refunds: {
        total: sum(refundTotals, "totalRefunds"),
        count: sum(refundTotals, "refundCount"),
      },
      paymentMethods,
    });
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    console.error("Analytics Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load analytics.",
    });
  }
};
