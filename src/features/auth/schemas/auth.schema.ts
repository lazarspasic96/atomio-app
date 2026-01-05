import { z } from "zod";

// Email schema
export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address");

// Password schema
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters");

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

// Register schema
export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
