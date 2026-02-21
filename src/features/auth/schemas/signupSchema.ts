import { z } from "zod";

export const signupSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Use at least 8 characters"),
  tenantName: z.string().trim().min(1, "Organization name is required"),
});

export type SignupFormValues = z.infer<typeof signupSchema>;
