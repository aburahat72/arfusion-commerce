import mongoose from "mongoose";

export const SUPPORT_CATEGORIES = [
  "product_question",
  "order_status",
  "shipping_delivery",
  "payment",
  "returns_refunds",
  "account",
  "technical",
  "other",
];

export const SUPPORT_STATUSES = [
  "open",
  "in_progress",
  "awaiting_customer",
  "resolved",
  "closed",
];

export const SUPPORT_PRIORITIES = ["low", "normal", "high", "urgent"];

const supportTicketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 120,
    },
    category: {
      type: String,
      enum: SUPPORT_CATEGORIES,
      required: true,
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    status: {
      type: String,
      enum: SUPPORT_STATUSES,
      default: "open",
      index: true,
    },
    priority: {
      type: String,
      enum: SUPPORT_PRIORITIES,
      default: "normal",
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    lastMessageAt: {
      type: Date,
      required: true,
      index: true,
    },
    lastPublicMessageAt: {
      type: Date,
      required: true,
    },
    lastPublicMessagePreview: {
      type: String,
      trim: true,
      maxlength: 180,
      default: "",
    },
    lastMessageBy: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    customerUnread: {
      type: Number,
      min: 0,
      default: 0,
    },
    adminUnread: {
      type: Number,
      min: 0,
      default: 0,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    closedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

supportTicketSchema.index({ status: 1, priority: 1, lastMessageAt: -1 });
supportTicketSchema.index({ customer: 1, lastPublicMessageAt: -1 });
supportTicketSchema.index({ assignedTo: 1, status: 1, lastMessageAt: -1 });

const SupportTicket = mongoose.model("SupportTicket", supportTicketSchema);

export default SupportTicket;
