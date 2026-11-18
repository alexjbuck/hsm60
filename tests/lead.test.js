import { test } from "node:test";
import assert from "node:assert/strict";
import { parseLead } from "../src/lib/lead.js";

const fd = (o) => { const f = new FormData(); for (const [k, v] of Object.entries(o)) f.set(k, v); return f; };

test("accepts a normal lead and normalizes email", () => {
  const { lead } = parseLead(fd({ name: " Jane ", email: "Jane@Ex.com", phone: "(904) 555-1212", background: "Civilian pilot" }));
  assert.deepEqual(lead, { name: "Jane", email: "jane@ex.com", phone: "(904) 555-1212", background: "Civilian pilot", message: "" });
});
test("rejects missing name, bad email, bad phone, unknown background", () => {
  assert.ok(parseLead(fd({ email: "a@b.co" })).error);
  assert.ok(parseLead(fd({ name: "x", email: "nope" })).error);
  assert.ok(parseLead(fd({ name: "x", email: "a@b.co", phone: "call me" })).error);
  assert.ok(parseLead(fd({ name: "x", email: "a@b.co", background: "<script>" })).error);
});
test("honeypot flags spam", () => {
  assert.ok(parseLead(fd({ name: "x", email: "a@b.co", website: "http://spam" })).spam);
});
test("truncates oversized input", () => {
  assert.equal(parseLead(fd({ name: "x", email: "a@b.co", message: "m".repeat(5000) })).lead.message.length, 2000);
});
