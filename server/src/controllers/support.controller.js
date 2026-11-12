import mongoose from "mongoose";
import Order from "../models/order.model.js";
import SupportMessage from "../models/supportMessage.model.js";
import SupportTicket, {
  SUPPORT_CATEGORIES,
  SUPPORT_PRIORITIES,
  SUPPORT_STATUSES,
} from "../models/supportTicket.model.js";
import User from "../models/user.model.js";
import { emitToAdmins, emitToCustomer } from "../realtime/socket.server.js";

const PAGE_SIZE = 20;
const MESSAGE_PAGE_SIZE = 50;

class SupportRequestError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const pagination = (query) => {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(
    Math.max(Number.parseInt(query.limit, 10) || PAGE_SIZE, 1),
    50,
  );
  return { page, limit, skip: (page - 1) * limit };
};

const emitSupportUpdate = (
  ticket,
  action,
  message,
  notifyCustomer = true,
) => {
  const customerId = ticket.customer?._id || ticket.customer;
  const payload = {
    ticketId: ticket._id.toString(),
    customerId: customerId.toString(),
    action,
    message,
  };
  try {
    emitToAdmins("support:update", payload);
    if (notifyCustomer) {
      emitToCustomer(customerId, "support:update", payload);
    }
  } catch (error) {
    console.error("Support realtime update failed:", error);
  }
};

const getMessages = async (ticketId, before, includeInternal) => {
  const filter = { ticket: ticketId };
  if (!includeInternal) filter.isInternal = false;

  if (before) {
    if (!isValidObjectId(before)) {
      return { invalidCursor: true };
    }

    const cursor = await SupportMessage.findOne({
      _id: before,
      ticket: ticketId,
      ...(includeInternal ? {} : { isInternal: false }),
    })
      .select("_id createdAt")
      .lean();

    if (!cursor) return { invalidCursor: true };

    filter.$or = [
      { createdAt: mongoose.trusted({ $lt: cursor.createdAt }) },
      {
        createdAt: cursor.createdAt,
        _id: mongoose.trusted({ $lt: cursor._id }),
      },
    ];
  }

  const page = await SupportMessage.find(filter)
    .populate("sender", "fullName role")
    .sort({ createdAt: -1, _id: -1 })
    .limit(MESSAGE_PAGE_SIZE + 1)
    .lean();
  const hasMore = page.length > MESSAGE_PAGE_SIZE;
  const messages = page.slice(0, MESSAGE_PAGE_SIZE).reverse();

  return { messages, hasMore, invalidCursor: false };
};

export const createSupportTicket = async (req, res) => {
  let session;
  try {
    const { subject, category, orderId, message } = req.body;
    let order = null;

    if (orderId) {
      order = await Order.findOne({
        _id: orderId,
        user: req.user._id,
      }).select("_id");

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "The selected order was not found",
        });
      }
    }

    const ticketId = new mongoose.Types.ObjectId();
    const ticketNumber = `AFS-${ticketId.toString().toUpperCase()}`;
    const now = new Date();
    session = await mongoose.startSession();

    let ticket;
    let firstMessage;
    await session.withTransaction(async () => {
      [ticket] = await SupportTicket.create(
        [
          {
            _id: ticketId,
            ticketNumber,
            customer: req.user._id,
            subject,
            category,
            order: order?._id || null,
            status: "open",
            priority: "normal",
            lastMessageAt: now,
            lastPublicMessageAt: now,
            lastPublicMessagePreview: message.slice(0, 180),
            lastMessageBy: "customer",
            adminUnread: 1,
          },
        ],
        { session },
      );
      [firstMessage] = await SupportMessage.create(
        [
          {
            ticket: ticket._id,
            sender: req.user._id,
            senderRole: "customer",
            body: message,
          },
        ],
        { session },
      );
    });

    emitSupportUpdate(ticket, "created", "A new support ticket was opened.");
    return res.status(201).json({
      success: true,
      message: "Support ticket created",
      ticket,
      firstMessage,
    });
  } catch (error) {
    console.error("Create Support Ticket Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to create support ticket",
    });
  } finally {
    if (session) await session.endSession();
  }
};

export const getCustomerTickets = async (req, res) => {
  try {
    const { page, limit, skip } = pagination(req.query);
    const filter = { customer: req.user._id };
    const [tickets, total] = await Promise.all([
      SupportTicket.find(filter)
        .populate("order", "orderStatus")
        .populate("assignedTo", "fullName")
        .sort({ lastPublicMessageAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SupportTicket.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      tickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: total ? Math.ceil(total / limit) : 0,
      },
    });
  } catch (error) {
    console.error("Get Customer Support Tickets Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load your support tickets",
    });
  }
};

export const getCustomerTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    if (!isValidObjectId(ticketId)) {
      return res.status(400).json({ success: false, message: "Invalid ticket ID" });
    }

    const ticket = await SupportTicket.findOneAndUpdate(
      { _id: ticketId, customer: req.user._id },
      { $set: { customerUnread: 0 } },
      { new: true },
    )
      .populate("order", "orderStatus createdAt")
      .populate("assignedTo", "fullName")
      .lean();

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Support ticket not found" });
    }

    const result = await getMessages(ticket._id, req.query.before, false);
    if (result.invalidCursor) {
      return res.status(400).json({ success: false, message: "Invalid message cursor" });
    }

    return res.status(200).json({
      success: true,
      ticket,
      messages: result.messages,
      hasMore: result.hasMore,
    });
  } catch (error) {
    console.error("Get Customer Support Ticket Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load the support conversation",
    });
  }
};

export const addCustomerSupportMessage = async (req, res) => {
  const { ticketId } = req.params;
  if (!isValidObjectId(ticketId)) {
    return res.status(400).json({ success: false, message: "Invalid ticket ID" });
  }

  let session;
  try {
    session = await mongoose.startSession();
    let ticket;
    let message;

    await session.withTransaction(async () => {
      ticket = await SupportTicket.findOne({
        _id: ticketId,
        customer: req.user._id,
      }).session(session);
      if (!ticket) throw new SupportRequestError(404, "Support ticket not found");
      if (ticket.status === "closed") {
        throw new SupportRequestError(
          409,
          "This ticket is closed. Open a new ticket for further help.",
        );
      }

      [message] = await SupportMessage.create(
        [
          {
            ticket: ticket._id,
            sender: req.user._id,
            senderRole: "customer",
            body: req.body.body,
          },
        ],
        { session },
      );

      ticket.status = "open";
      ticket.lastMessageAt = new Date();
      ticket.lastPublicMessageAt = ticket.lastMessageAt;
      ticket.lastPublicMessagePreview = req.body.body.slice(0, 180);
      ticket.lastMessageBy = "customer";
      ticket.adminUnread += 1;
      ticket.customerUnread = 0;
      ticket.resolvedAt = null;
      await ticket.save({ session });
    });

    emitSupportUpdate(ticket, "message", "A customer replied to a support ticket.");
    return res.status(201).json({ success: true, message });
  } catch (error) {
    if (error instanceof SupportRequestError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    console.error("Add Customer Support Message Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to send your message",
    });
  } finally {
    if (session) await session.endSession();
  }
};

export const getAdminSupportTickets = async (req, res) => {
  try {
    const { page, limit, skip } = pagination(req.query);
    const filter = {};
    const status = String(req.query.status || "all");
    const priority = String(req.query.priority || "all");
    const category = String(req.query.category || "all");
    const assignee = String(req.query.assignee || "all");

    if (status !== "all" && !SUPPORT_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid ticket status filter" });
    }
    if (priority !== "all" && !SUPPORT_PRIORITIES.includes(priority)) {
      return res.status(400).json({ success: false, message: "Invalid ticket priority filter" });
    }
    if (category !== "all" && !SUPPORT_CATEGORIES.includes(category)) {
      return res.status(400).json({ success: false, message: "Invalid ticket category filter" });
    }
    if (status !== "all") filter.status = status;
    if (priority !== "all") filter.priority = priority;
    if (category !== "all") filter.category = category;
    if (assignee === "unassigned") filter.assignedTo = null;
    if (assignee === "me") filter.assignedTo = req.user._id;
    if (!["all", "unassigned", "me"].includes(assignee)) {
      return res.status(400).json({ success: false, message: "Invalid assignee filter" });
    }

    const search = String(req.query.search || "").trim().slice(0, 100);
    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      const customers = await User.find({
        role: "customer",
        $or: [{ fullName: regex }, { email: regex }],
      })
        .select("_id")
        .lean();
      filter.$or = [
        { ticketNumber: regex },
        { subject: regex },
        {
          customer: mongoose.trusted({
            $in: customers.map((customer) => customer._id),
          }),
        },
      ];
    }

    const [tickets, total, statusCounts] = await Promise.all([
      SupportTicket.find(filter)
        .populate("customer", "fullName email")
        .populate("order", "orderStatus")
        .populate("assignedTo", "fullName")
        .sort({ lastMessageAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SupportTicket.countDocuments(filter),
      SupportTicket.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);

    const counts = Object.fromEntries(
      statusCounts.map(({ _id, count }) => [_id, count]),
    );
    return res.status(200).json({
      success: true,
      tickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: total ? Math.ceil(total / limit) : 0,
      },
      summary: {
        total: Object.values(counts).reduce((sum, count) => sum + count, 0),
        open: counts.open || 0,
        inProgress: counts.in_progress || 0,
        awaitingCustomer: counts.awaiting_customer || 0,
        resolved: counts.resolved || 0,
        closed: counts.closed || 0,
      },
    });
  } catch (error) {
    console.error("Get Admin Support Tickets Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load support tickets",
    });
  }
};

export const getSupportAgents = async (req, res) => {
  try {
    const agents = await User.find({ role: "admin", isActive: true })
      .select("fullName email")
      .sort({ fullName: 1 })
      .lean();
    return res.status(200).json({ success: true, agents });
  } catch (error) {
    console.error("Get Support Agents Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load support agents",
    });
  }
};

export const getAdminSupportTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    if (!isValidObjectId(ticketId)) {
      return res.status(400).json({ success: false, message: "Invalid ticket ID" });
    }

    const ticket = await SupportTicket.findByIdAndUpdate(
      ticketId,
      { $set: { adminUnread: 0 } },
      { new: true },
    )
      .populate("customer", "fullName email phone")
      .populate("order", "orderStatus createdAt")
      .populate("assignedTo", "fullName email")
      .lean();
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Support ticket not found" });
    }

    const result = await getMessages(ticket._id, req.query.before, true);
    if (result.invalidCursor) {
      return res.status(400).json({ success: false, message: "Invalid message cursor" });
    }
    return res.status(200).json({
      success: true,
      ticket,
      messages: result.messages,
      hasMore: result.hasMore,
    });
  } catch (error) {
    console.error("Get Admin Support Ticket Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load the support conversation",
    });
  }
};

export const addAdminSupportMessage = async (req, res) => {
  const { ticketId } = req.params;
  if (!isValidObjectId(ticketId)) {
    return res.status(400).json({ success: false, message: "Invalid ticket ID" });
  }

  let session;
  try {
    session = await mongoose.startSession();
    let ticket;
    let message;
    await session.withTransaction(async () => {
      ticket = await SupportTicket.findById(ticketId).session(session);
      if (!ticket) throw new SupportRequestError(404, "Support ticket not found");

      const isInternal = req.body.isInternal;
      [message] = await SupportMessage.create(
        [
          {
            ticket: ticket._id,
            sender: req.user._id,
            senderRole: "admin",
            body: req.body.body,
            isInternal,
          },
        ],
        { session },
      );

      ticket.lastMessageAt = new Date();
      ticket.lastMessageBy = "admin";
      if (isInternal) {
        ticket.adminUnread = 0;
      } else {
        ticket.status = "awaiting_customer";
        ticket.resolvedAt = null;
        ticket.closedAt = null;
        ticket.lastPublicMessageAt = ticket.lastMessageAt;
        ticket.lastPublicMessagePreview = req.body.body.slice(0, 180);
        ticket.customerUnread += 1;
      }
      await ticket.save({ session });
    });

    emitSupportUpdate(
      ticket,
      req.body.isInternal ? "internal_note" : "message",
      req.body.isInternal
        ? "A support agent added an internal note."
        : "A support agent replied to your ticket.",
      !req.body.isInternal,
    );
    return res.status(201).json({ success: true, message });
  } catch (error) {
    if (error instanceof SupportRequestError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    console.error("Add Admin Support Message Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to send the support message",
    });
  } finally {
    if (session) await session.endSession();
  }
};

export const updateAdminSupportTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    if (!isValidObjectId(ticketId)) {
      return res.status(400).json({ success: false, message: "Invalid ticket ID" });
    }

    const updates = {};
    if (req.body.status) {
      updates.status = req.body.status;
      updates.resolvedAt =
        req.body.status === "resolved" ? new Date() : null;
      updates.closedAt =
        req.body.status === "closed" ? new Date() : null;
    }
    if (req.body.priority) updates.priority = req.body.priority;
    if (Object.hasOwn(req.body, "assignedTo")) {
      if (req.body.assignedTo) {
        const agent = await User.findOne({
          _id: req.body.assignedTo,
          role: "admin",
          isActive: true,
        }).select("_id");
        if (!agent) {
          return res.status(400).json({
            success: false,
            message: "Assignee must be an active admin",
          });
        }
      }
      updates.assignedTo = req.body.assignedTo;
    }

    const ticket = await SupportTicket.findByIdAndUpdate(
      ticketId,
      { $set: updates },
      { new: true, runValidators: true },
    )
      .populate("customer", "fullName email")
      .populate("assignedTo", "fullName email")
      .populate("order", "orderStatus")
      .lean();

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Support ticket not found" });
    }

    emitSupportUpdate(ticket, "updated", "Your support ticket was updated.");
    return res.status(200).json({
      success: true,
      message: "Support ticket updated",
      ticket,
    });
  } catch (error) {
    console.error("Update Admin Support Ticket Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update support ticket",
    });
  }
};
