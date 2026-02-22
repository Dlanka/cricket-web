import { z } from "zod";

const contactNumberPattern = /^[+\d\s().-]{6,20}$/;

const optionalTrimmedString = (max: number, message: string) =>
  z.preprocess(
    (value) => {
      if (typeof value !== "string") return value;
      const trimmed = value.trim();
      return trimmed === "" ? undefined : trimmed;
    },
    z.string().max(max, message).optional(),
  );

const optionalContactNumber = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
  },
  z
    .string()
    .regex(
      contactNumberPattern,
      "Enter a valid contact number (6-20 chars, + digits spaces () - .)",
    )
    .optional(),
);

export const teamCreateSchema = z.object({
  name: z.string().min(2, "Enter a team name"),
  shortName: optionalTrimmedString(10, "Max 10 characters"),
  contactPerson: optionalTrimmedString(80, "Max 80 characters"),
  contactNumber: optionalContactNumber,
});

export const teamUpdateSchema = z
  .object({
    name: z.string().min(2, "Enter a team name").optional(),
    shortName: optionalTrimmedString(10, "Max 10 characters"),
    contactPerson: optionalTrimmedString(80, "Max 80 characters"),
    contactNumber: optionalContactNumber,
  })
  .refine((values) => Object.values(values).some((value) => value !== undefined), {
    message: "Update at least one field.",
  });

export type TeamCreateFormValues = z.input<typeof teamCreateSchema>;
export type TeamCreateValues = z.output<typeof teamCreateSchema>;
export type TeamUpdateFormValues = z.input<typeof teamUpdateSchema>;
export type TeamUpdateValues = z.output<typeof teamUpdateSchema>;
