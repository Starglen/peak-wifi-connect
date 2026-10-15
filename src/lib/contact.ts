import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(100, "Name is too long."),
  email: z.string().trim().email("Please enter a valid email.").max(255),
  message: z.string().trim().min(1, "Please write a message.").max(1000, "Keep your message under 1,000 characters."),
  website: z.string().max(0, "Unable to send this message.").default(""),
});

export const receiptSchema = z.string().trim().toUpperCase().regex(/^[A-Z0-9]{10}$/, "Enter the 10-character M-Pesa transaction code.");