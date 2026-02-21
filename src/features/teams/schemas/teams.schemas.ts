import { z } from "zod";

export const teamCreateSchema = z.object({
  name: z.string().min(2, "Enter a team name"),
  shortName: z.string().max(10, "Max 10 characters").optional(),
});

export const teamUpdateSchema = z
  .object({
    name: z.string().min(2, "Enter a team name").optional(),
    shortName: z.string().max(10, "Max 10 characters").optional(),
  })
  .refine((values) => Object.values(values).some((value) => value !== undefined), {
    message: "Update at least one field.",
  });

export type TeamCreateFormValues = z.input<typeof teamCreateSchema>;
export type TeamCreateValues = z.output<typeof teamCreateSchema>;
export type TeamUpdateFormValues = z.input<typeof teamUpdateSchema>;
export type TeamUpdateValues = z.output<typeof teamUpdateSchema>;
