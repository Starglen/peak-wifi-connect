import { describe, expect, it } from "vitest";
import { contactSchema, receiptSchema } from "./contact";

describe("message and receipt validation", () => {
  const message = { name: "Jane", email: "jane@example.com", message: "Installation enquiry" };
  it("requires a name, valid reply email and message", () => {
    expect(contactSchema.safeParse(message).success).toBe(true);
    expect(contactSchema.safeParse({ ...message, name: " " }).success).toBe(false);
    expect(contactSchema.safeParse({ ...message, email: "not-an-email" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...message, message: " " }).success).toBe(false);
  });
  it("bounds contact input and rejects the bot field", () => {
    expect(contactSchema.safeParse({ ...message, message: "a".repeat(1001) }).success).toBe(false);
    expect(contactSchema.safeParse({ ...message, website: "spam" }).success).toBe(false);
  });
  it("accepts only a ten-character M-Pesa receipt, never arbitrary text", () => {
    expect(receiptSchema.parse(" qjk12abc34 ")).toBe("QJK12ABC34");
    expect(receiptSchema.safeParse("<script>").success).toBe(false);
    expect(receiptSchema.safeParse("QJK12ABC3").success).toBe(false);
  });
});