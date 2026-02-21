import { z } from "zod";
import type { TournamentStatus, TournamentType } from "../types/tournamentTypes";

const optionalNumber = z.number().int().min(1).optional();

export const tournamentUpdateSchema = z
  .object({
    name: z.string().min(2, "Enter a tournament name").optional(),
    location: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    type: z
      .enum(["LEAGUE", "KNOCKOUT", "LEAGUE_KNOCKOUT"])
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
    status: z
      .enum(["DRAFT", "ACTIVE", "COMPLETED"])
      .optional() as z.ZodType<TournamentStatus | undefined>,
  })
  .refine((values) => Object.values(values).some((value) => value !== undefined), {
    message: "Update at least one field.",
  });

export type TournamentUpdateFormValues = z.input<typeof tournamentUpdateSchema>;
export type TournamentUpdateValues = z.output<typeof tournamentUpdateSchema>;
