import assert from "node:assert/strict";
import test from "node:test";
import SupportMessage from "../src/models/supportMessage.model.js";
import SupportTicket from "../src/models/supportTicket.model.js";
import {
  adminSupportMessageSchema,
  createSupportTicketSchema,
  supportMessageSchema,
  updateSupportTicketSchema,
} from "../src/validations/support.validation.js";

const orderId = "507f1f77bcf86cd799439011";

test("support ticket creation validates topic, subject, order reference, and first message", () => {
  const valid = {
    subject: "Delivery update needed",
    category: "shipping_delivery",
    orderId,
    message: "Please let me know when this order will arrive.",
  };

  assert.equal(createSupportTicketSchema.safeParse(valid).success, true);
  assert.equal(
    createSupportTicketSchema.safeParse({ ...valid, category: "unknown" }).success,
    false,
  );
  assert.equal(
    createSupportTicketSchema.safeParse({ ...valid, orderId: "not-an-id" }).success,
    false,
  );
  assert.equal(
    createSupportTicketSchema.safeParse({ ...valid, message: "help" }).success,
    false,
  );
});

test("support replies require a body and admin notes have an explicit visibility flag", () => {
  assert.equal(supportMessageSchema.safeParse({ body: "Thanks for your help." }).success, true);
  assert.equal(supportMessageSchema.safeParse({ body: " " }).success, false);
  assert.equal(
    adminSupportMessageSchema.parse({ body: "Check payment logs" }).isInternal,
    false,
  );
  assert.equal(
    adminSupportMessageSchema.safeParse({
      body: "This stays internal.",
      isInternal: true,
    }).success,
    true,
  );
});

test("admin ticket updates require a valid change and support assignment clearing", () => {
  assert.equal(updateSupportTicketSchema.safeParse({}).success, false);
  assert.equal(
    updateSupportTicketSchema.safeParse({
      status: "resolved",
      priority: "high",
      assignedTo: null,
    }).success,
    true,
  );
});

test("support ticket and message models index ticket queues and conversation history", () => {
  const ticketIndexes = SupportTicket.schema.indexes();
  const messageIndexes = SupportMessage.schema.indexes();

  assert.ok(ticketIndexes.some(([keys]) => keys.customer === 1 && keys.lastPublicMessageAt === -1));
  assert.ok(messageIndexes.some(([keys]) => keys.ticket === 1 && keys.createdAt === -1));
  assert.equal(SupportTicket.schema.path("lastPublicMessageAt").isRequired, true);
  assert.equal(SupportMessage.schema.path("isInternal").defaultValue, false);
});
