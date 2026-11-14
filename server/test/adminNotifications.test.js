import assert from "node:assert/strict";
import test from "node:test";
import { resolveAdminNotificationQuery } from "../src/controllers/notification.controller.js";

test("admin notification query scopes requests and parses supported filters", () => {
  assert.deepEqual(
    resolveAdminNotificationQuery({
      filter: "unread",
      type: "Order",
      page: "2",
      limit: "10",
    }),
    {
      filter: { recipient: "admin", isRead: false, type: "Order" },
      page: 2,
      limit: 10,
      skip: 10,
    },
  );
  assert.deepEqual(resolveAdminNotificationQuery({ filter: "read" }).filter, {
    recipient: "admin",
    isRead: true,
  });
  assert.deepEqual(resolveAdminNotificationQuery({}).filter, {
    recipient: "admin",
  });
});

test("admin notification query rejects invalid filters and pagination", () => {
  for (const query of [
    { filter: "deleted" },
    { type: "Unknown" },
    { page: "0" },
    { limit: "51" },
  ]) {
    assert.throws(
      () => resolveAdminNotificationQuery(query),
      (error) => error.statusCode === 400,
    );
  }
});
