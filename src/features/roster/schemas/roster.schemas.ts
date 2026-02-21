import { z } from "zod";

export const setRosterSchema = z
  .object({
    teamId: z.string().min(1),
    playingPlayerIds: z
      .array(z.string().min(1))
      .min(1, "Select at least 1 player.")
      .max(11, "You can select up to 11 players only."),
    captainId: z.string().optional(),
    keeperId: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (
      values.captainId &&
      !values.playingPlayerIds.includes(values.captainId)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Captain must be in playing XI.",
        path: ["captainId"],
      });
    }
    if (
      values.keeperId &&
      !values.playingPlayerIds.includes(values.keeperId)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Keeper must be in playing XI.",
        path: ["keeperId"],
      });
    }
  });

export type SetRosterFormValues = z.input<typeof setRosterSchema>;
export type SetRosterValues = z.output<typeof setRosterSchema>;
