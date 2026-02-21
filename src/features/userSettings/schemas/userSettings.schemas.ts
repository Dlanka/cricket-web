import { z } from "zod";

export const profileSettingsSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required."),
  email: z.string().email("Enter a valid email."),
});

export const preferencesSettingsSchema = z.object({
  locale: z.string().trim().min(1, "Locale is required."),
  timezone: z.string().trim().min(1, "Timezone is required."),
  dateFormat: z.string().trim().min(1, "Date format is required."),
  theme: z.enum(["light", "dark", "system"]),
  notificationsEmail: z.boolean(),
  notificationsInApp: z.boolean(),
});

export const securitySettingsSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z.string().min(8, "New password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Confirm password is required."),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Confirm password must match new password.",
  });
