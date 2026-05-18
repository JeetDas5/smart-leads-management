import { z } from "zod";

export const createLeadSchema = z.object({
  name: z.string().min(2, "Name is required"),

  email: z.email("Invalid email"),

  status: z.enum(["new", "contacted", "qualified", "lost"]).optional(),

  source: z.enum(["website", "instagram", "referral"]),
});

export const updateLeadSchema = createLeadSchema.partial();
