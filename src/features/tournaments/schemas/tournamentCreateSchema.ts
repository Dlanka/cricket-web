import { z } from "zod";
import type { TournamentType, TournamentStatus } from "../types/tournamentTypes";

const optionalLocation = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
  },
  z
    .string()
    .min(2, "Location must be at least 2 characters.")
    .max(120, "Location must be 120 characters or less.")
    .optional(),
);

const optionalDate = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
  },
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date.")
    .optional(),
);

export const tournamentCreateSchema = z.object({
  name: z.string().min(2, "Enter a tournament name"),
  location: optionalLocation,
  startDate: optionalDate,
  endDate: optionalDate,
  type: z.enum(["LEAGUE", "KNOCKOUT", "LEAGUE_KNOCKOUT"]) as z.ZodType<
    TournamentType
  >,
  oversPerInnings: z
    .coerce
    .number()
    .int()
    .min(1, "Overs per innings must be at least 1."),
  ballsPerOver: z
    .coerce
    .number()
    .int()
    .min(1, "Balls per over must be at least 1."),
  qualificationCount: z.preprocess(
    (value) =>
      value === "" || value == null || (typeof value === "number" && Number.isNaN(value))
        ? undefined
        : value,
    z.coerce.number().int().min(2, "Qualification count must be at least 2"),
  ).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "COMPLETED"]).optional() as z.ZodType<
    TournamentStatus | undefined
  >,
}).superRefine((values, ctx) => {
  if (values.startDate && values.endDate && values.endDate < values.startDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["endDate"],
      message: "End date must be on or after start date.",
    });
  }
});

export type TournamentCreateFormValues = z.input<typeof tournamentCreateSchema>;
export type TournamentCreateValues = z.output<typeof tournamentCreateSchema>;
