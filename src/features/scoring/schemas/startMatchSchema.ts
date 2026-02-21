import { z } from "zod";

export const startMatchSchema = z
  .object({
    battingTeamId: z.string().min(1, "Select batting team."),
    strikerId: z.string().min(1, "Select striker."),
    nonStrikerId: z.string().min(1, "Select non-striker."),
    bowlerId: z.string().min(1, "Select opening bowler."),
  })
  .superRefine((values, ctx) => {
    if (values.strikerId === values.nonStrikerId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["nonStrikerId"],
        message: "Striker and non-striker must be different.",
      });
    }
  });

export type StartMatchValues = z.infer<typeof startMatchSchema>;
