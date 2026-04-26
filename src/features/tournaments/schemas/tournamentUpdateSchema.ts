import { z } from "zod";
import type { TournamentStatus, TournamentType } from "../types/tournamentTypes";

const optionalNumber = z.number().int().min(1).optional();
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

export const tournamentUpdateSchema = z
  .object({
    name: z.string().min(2, "Enter a tournament name").optional(),
    location: optionalLocation,
    startDate: optionalDate,
    endDate: optionalDate,
    type: z
      .enum(["LEAGUE", "KNOCKOUT", "LEAGUE_KNOCKOUT", "SERIES"])
      .optional() as z.ZodType<TournamentType | undefined>,
    oversPerInnings: optionalNumber,
    ballsPerOver: optionalNumber,
    qualificationCount: z.preprocess(
      (value) =>
        value === "" || value == null || (typeof value === "number" && Number.isNaN(value))
          ? undefined
          : value,
      z.coerce.number().int().min(2, "Qualification count must be at least 2"),
    ).optional(),
    seriesTotalMatches: z.preprocess(
      (value) =>
        value === "" || value == null || (typeof value === "number" && Number.isNaN(value))
          ? undefined
          : value,
      z.coerce.number().int().min(1, "Total matches must be at least 1"),
    ).optional(),
    seriesWinsToClinch: z.preprocess(
      (value) =>
        value === "" || value == null || (typeof value === "number" && Number.isNaN(value))
          ? undefined
          : value,
      z.coerce.number().int().min(1, "Wins to clinch must be at least 1"),
    ).optional(),
    status: z
      .enum(["DRAFT", "ACTIVE", "COMPLETED"])
      .optional() as z.ZodType<TournamentStatus | undefined>,
  })
  .superRefine((values, ctx) => {
    if (values.startDate && values.endDate && values.endDate < values.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "End date must be on or after start date.",
      });
    }
    if (values.type === "SERIES") {
      if (
        values.seriesTotalMatches !== undefined &&
        values.seriesWinsToClinch !== undefined &&
        values.seriesWinsToClinch > values.seriesTotalMatches
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["seriesWinsToClinch"],
          message: "Wins to clinch cannot exceed total matches.",
        });
      }
    }
  })
  .refine((values) => Object.values(values).some((value) => value !== undefined), {
    message: "Update at least one field.",
  });

export type TournamentUpdateFormValues = z.input<typeof tournamentUpdateSchema>;
export type TournamentUpdateValues = z.output<typeof tournamentUpdateSchema>;
