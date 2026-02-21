import { z } from "zod";
import type { TournamentType, TournamentStatus } from "../types/tournamentTypes";

export const tournamentCreateSchema = z.object({
  name: z.string().min(2, "Enter a tournament name"),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  type: z.enum(["LEAGUE", "KNOCKOUT", "LEAGUE_KNOCKOUT"]) as z.ZodType<
    TournamentType
  >,
  oversPerInnings: z
    .coerce
    .number()
    .int()
    .positive()
    .refine((value) => !Number.isNaN(value), "Enter overs per innings"),
  ballsPerOver: z
    .coerce
    .number()
    .int()
    .positive()
    .optional(),
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
});

export type TournamentCreateFormValues = z.input<typeof tournamentCreateSchema>;
export type TournamentCreateValues = z.output<typeof tournamentCreateSchema>;
