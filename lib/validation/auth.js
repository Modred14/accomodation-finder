// lib/validation/auth.js
import { z } from "zod";

export const registerSchema = z
  .object({
    role: z.enum(["student", "landlord", "agent"]),
    full_name: z.string().trim().min(2, "Enter your full name").max(120),
    email: z.string().trim().toLowerCase().email("Enter a valid email address"),
    phone: z
      .string()
      .trim()
      .min(7, "Enter a valid phone number")
      .max(20)
      .optional()
      .or(z.literal("")),
    password: z.string().min(8, "Password must be at least 8 characters"),
    university_id: z.string().uuid().optional().or(z.literal("")),
    agency_name: z.string().trim().max(120).optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.role === "student" && !data.university_id) {
      ctx.addIssue({
        code: "custom",
        path: ["university_id"],
        message: "Select your university",
      });
    }
  });

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});
