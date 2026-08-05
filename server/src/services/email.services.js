import transporter from "../config/mailer.js";

import welcomeEmail from "../templates/welcomeEmail.js";
import orderConfirmation from "../templates/orderConfirmation.js";
import paymentSuccess from "../templates/paymentSuccess.js";
import orderShipped from "../templates/orderShipped.js";
import orderDelivered from "../templates/orderDelivered.js";
import orderCancelled from "../templates/orderCancelled.js";

// All returns imports templates
import returnRequested from "../templates/returnRequested.js";
import returnApproved from "../templates/returnApproved.js";
import returnRejected from "../templates/returnRejected.js";
import refundCompleted from "../templates/refundCompleted.js";
import replacementShipped from "../templates/replacementShipped.js";

// Send Email
const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    });

    console.log("Email sent:", info.messageId);

    return info;
  } catch (error) {
    console.error("Email Error:", error);
    throw error;
  }
};

// Welcome Email
export const sendWelcomeEmail = async (email, name) => {
  const subject = "Welcome to ARFusion Commerce";

  return sendEmail({
    to: email,
    subject,
    html: welcomeEmail(name),
  });
};

// Order Confirmation Email
export const sendOrderConfirmationEmail = async (
  email,
  name,
  orderId,
  amount,
) => {
  const subject = "Order Confirmation";

  return sendEmail({
    to: email,
    subject,
    html: orderConfirmation(name, orderId, amount),
  });
};

// Payment Success Email
export const sendPaymentSuccessEmail = async (email, name, orderId, amount) => {
  const subject = "Payment Successful";

  return sendEmail({
    to: email,
    subject,
    html: paymentSuccess(name, orderId, amount),
  });
};

// Order Shipped Email
export const sendOrderShippedEmail = async (email, name, orderId) => {
  const subject = "Order Shipped";

  return sendEmail({
    to: email,
    subject,
    html: orderShipped(name, orderId),
  });
};

// Order Delivered Email
export const sendOrderDeliveredEmail = async (email, name, orderId) => {
  const subject = "Order Delivered";

  return sendEmail({
    to: email,
    subject,
    html: orderDelivered(name, orderId),
  });
};

// Order Cancelled Email
export const sendOrderCancelledEmail = async (email, name, orderId) => {
  const subject = "Order Cancelled";

  return sendEmail({
    to: email,
    subject,
    html: orderCancelled(name, orderId),
  });
};

// All returns emails are handled below
// Return Requested Email
export const sendReturnRequestedEmail = async (
  email,
  name,
  orderId,
  requestType,
) => {
  const subject = "Return Request Received";

  return sendEmail({
    to: email,
    subject,
    html: returnRequested(name, orderId, requestType),
  });
};

// Return Approved Email
export const sendReturnApprovedEmail = async (
  email,
  name,
  orderId,
) => {
  const subject = "Return Request Approved";

  return sendEmail({
    to: email,
    subject,
    html: returnApproved(name, orderId),
  });
};

// Return Rejected Email
export const sendReturnRejectedEmail = async (
  email,
  name,
  orderId,
) => {
  const subject = "Return Request Rejected";

  return sendEmail({
    to: email,
    subject,
    html: returnRejected(name, orderId),
  });
};

// Refund Completed Email
export const sendRefundCompletedEmail = async (
  email,
  name,
  orderId,
  amount,
) => {
  const subject = "Refund Completed";

  return sendEmail({
    to: email,
    subject,
    html: refundCompleted(name, orderId, amount),
  });
};

// Replacement Shipped Email
export const sendReplacementShippedEmail = async (
  email,
  name,
  orderId,
) => {
  const subject = "Replacement Shipped";

  return sendEmail({
    to: email,
    subject,
    html: replacementShipped(name, orderId),
  });
};
