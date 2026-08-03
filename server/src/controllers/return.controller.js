import mongoose from "mongoose";

import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

// import {
//   sendReturnRequestedEmail,
//   sendReturnApprovedEmail,
//   sendReturnRejectedEmail,
//   sendRefundCompletedEmail,
//   sendReplacementShippedEmail,
// } from "../services/email.services.js";

// requestReturn
// Customer - Request return
export const requestReturn = async (req, res) => {
  try {
    // Logic started
    // Get logged-in user ID
    const userId = req.user._id;

    // Get order ID from URL
    const { orderId } = req.params;

    // Get request data
    const { returnReason, requestType } = req.body;

    // Check whether order ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    // Find user's order
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    });

    // Check whether order exists
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check whether order has been delivered
    if (order.orderStatus !== "Delivered") {
      return res.status(400).json({
        success: false,
        message: "Only delivered orders can be returned",
      });
    }

    // Check whether return request already exists
    if (order.returnStatus !== "Not Requested") {
      return res.status(400).json({
        success: false,
        message: "Return request has already been submitted",
      });
    }

    // Check whether return period has expired
    if (!order.returnEligibleUntil || new Date() > order.returnEligibleUntil) {
      return res.status(400).json({
        success: false,
        message: "Return window has expired",
      });
    }

    // Save return request details
    order.returnStatus = "Pending";
    order.returnReason = returnReason;
    order.returnRequestedAt = new Date();

    // Save request type
    if (requestType === "Refund") {
      order.refundRequested = true;
      order.refundStatus = "Pending";
    }

    if (requestType === "Replacement") {
      order.replacementRequested = true;
    }

    // Save order
    await order.save();

    // Send return request email
    // Uncomment after creating email service
    /*
try {
  await sendReturnRequestedEmail(
    req.user.email,
    req.user.fullName,
    order._id,
    requestType
  );
} catch (error) {
  console.error("Return request email failed:", error);
}
*/

    // Return response
    return res.status(200).json({
      success: true,
      message: `${requestType} request submitted successfully`,
      order,
    });
  } catch (error) {
    console.error("Request Return Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// getMyReturnRequests
// Customer - Get my return requests
export const getMyReturnRequests = async (req, res) => {
  try {
    // Logic started
    // Get logged-in user ID
    const userId = req.user._id;

    // Find all return requests of the logged-in user
    const returnRequests = await Order.find({
      user: userId,
      returnStatus: {
        $ne: "Not Requested",
      },
    })
      .populate("items.product")
      .sort({
        returnRequestedAt: -1,
      });

    // Check whether any return requests exist
    if (returnRequests.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No return requests found",
        returnRequests: [],
      });
    }

    // Return all return requests
    return res.status(200).json({
      success: true,
      count: returnRequests.length,
      returnRequests,
    });
  } catch (error) {
    console.error("Get My Return Requests Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// getAllReturnRequests
// Admin - Get all return requests
export const getAllReturnRequests = async (req, res) => {
  try {
    // Logic started
    // Find all return requests
    const returnRequests = await Order.find({
      returnStatus: {
        $ne: "Not Requested",
      },
    })
      .populate("user", "fullName email")
      .populate("items.product")
      .sort({
        returnRequestedAt: -1,
      });

    // Check whether any return requests exist
    if (returnRequests.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No return requests found",
        returnRequests: [],
      });
    }

    // Return all return requests
    return res.status(200).json({
      success: true,
      count: returnRequests.length,
      returnRequests,
    });
  } catch (error) {
    console.error("Get All Return Requests Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// approveReturn
// Admin - Approve return request
export const approveReturn = async (req, res) => {
  try {
    // Logic started
    // Get order ID from URL
    const { orderId } = req.params;

    // Check whether order ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    // Find order
    const order = await Order.findById(orderId);

    // Check whether order exists
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check whether return request exists
    if (order.returnStatus !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "No pending return request found",
      });
    }

    // Approve return request
    order.returnStatus = "Approved";

    // Save order
    await order.save();

    // Find customer
    const customer = await User.findById(order.user);

    // Check whether customer exists
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Send return approved email
    /* Uncomment after creating email service

try {
  await sendReturnApprovedEmail(
    customer.email,
    customer.fullName,
    order._id,
  );
} catch (error) {
  console.error("Return approved email failed:", error);
}

*/

    // Return response
    return res.status(200).json({
      success: true,
      message: "Return request approved successfully",
      order,
    });
  } catch (error) {
    console.error("Approve Return Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// rejectReturn
// Admin - Reject return request
export const rejectReturn = async (req, res) => {
  try {
    // Logic started
    // Get order ID from URL
    const { orderId } = req.params;

    // Check whether order ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    // Find order
    const order = await Order.findById(orderId);

    // Check whether order exists
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check whether return request exists
    if (order.returnStatus !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "No pending return request found",
      });
    }

    // Reject return request
    order.returnStatus = "Rejected";

    // Reset request flags
    order.refundRequested = false;
    order.replacementRequested = false;
    order.refundStatus = "Not Applicable";

    // Save order
    await order.save();

    // Find customer
    const customer = await User.findById(order.user);

    // Check whether customer exists
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Send return rejected email
    /* Uncomment after creating email service

try {
  await sendReturnRejectedEmail(
    customer.email,
    customer.fullName,
    order._id,
  );
} catch (error) {
  console.error("Return rejected email failed:", error);
}

*/

    // Return response
    return res.status(200).json({
      success: true,
      message: "Return request rejected successfully",
      order,
    });
  } catch (error) {
    console.error("Reject Return Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// completeRefund
// Admin - Complete refund
export const completeRefund = async (req, res) => {
  try {
    // Logic started
    // Get order ID from URL
    const { orderId } = req.params;

    // Check whether order ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    // Find order
    const order = await Order.findById(orderId);

    // Check whether order exists
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check whether refund was requested
    if (!order.refundRequested) {
      return res.status(400).json({
        success: false,
        message: "Refund was not requested",
      });
    }

    // Check whether return request has been approved
    if (order.returnStatus !== "Approved") {
      return res.status(400).json({
        success: false,
        message: "Return request has not been approved",
      });
    }

    // Check whether refund has already been completed
    if (order.refundStatus === "Completed") {
      return res.status(400).json({
        success: false,
        message: "Refund has already been completed",
      });
    }

    // Update refund status
    order.refundStatus = "Completed";
    order.returnStatus = "Refunded";

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: {
          stock: item.quantity,
        },
      });
    }

    // Save order
    await order.save();

    // Find customer
    const customer = await User.findById(order.user);

    // Check whether customer exists
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Send refund completed email
    /* Uncomment after creating email service

try {
  await sendRefundCompletedEmail(
    customer.email,
    customer.fullName,
    order._id,
    order.totalPrice,
  );
} catch (error) {
  console.error("Refund completed email failed:", error);
}

*/

    // Return response
    return res.status(200).json({
      success: true,
      message: "Refund completed successfully",
      order,
    });
  } catch (error) {
    console.error("Complete Refund Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// completeReplacement
// Admin - Complete replacement
export const completeReplacement = async (req, res) => {
  try {
    // Logic started
    // Get order ID from URL
    const { orderId } = req.params;

    // Check whether order ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    // Find order
    const order = await Order.findById(orderId);

    // Check whether order exists
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check whether replacement was requested
    if (!order.replacementRequested) {
      return res.status(400).json({
        success: false,
        message: "Replacement was not requested",
      });
    }

    // Check whether return request has been approved
    if (order.returnStatus !== "Approved") {
      return res.status(400).json({
        success: false,
        message: "Return request has not been approved",
      });
    }

    // Check product stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.name} is out of stock`,
        });
      }
    }

    // Reduce stock for replacement
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: {
          stock: -item.quantity,
        },
      });
    }

    // Update replacement status
    order.returnStatus = "Replaced";
    order.replacementRequested = false;

    // Save order
    await order.save();

    // Find customer
    const customer = await User.findById(order.user);

    // Check whether customer exists
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Send replacement shipped email
    /* Uncomment after creating email service

try {
  await sendReplacementShippedEmail(
    customer.email,
    customer.fullName,
    order._id,
  );
} catch (error) {
  console.error("Replacement shipped email failed:", error);
}

*/

    // Return response
    return res.status(200).json({
      success: true,
      message: "Replacement completed successfully",
      order,
    });
  } catch (error) {
    console.error("Complete Replacement Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
