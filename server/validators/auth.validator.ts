import { z } from "zod";
import { UserRole } from "../constants/enum.js";

export const registerSchema = z.object({
  name: z.string().min(2, "Name is required"),

  email: z.email("Invalid email"),

  password: z.string().min(6, "Password must be at least 6 characters"),

  role: z.enum(UserRole)
});

export const loginSchema = z.object({
  email: z.email("Invalid email"),

  password: z.string().min(6, "Password must be at least 6 characters"),
});
