import { z } from "zod";

export const panelStateSchema = z.object({
  selectedExtraType: z.enum(["wide", "noBall", "byes", "legByes"]).nullable(),
  additionalRuns: z.number().int().min(0).max(6).default(0),
  wicketSelected: z.boolean().default(false),
});

export const wicketFormSchema = z
  .object({
    wicketType: z.enum([
      "bowled",
      "caught",
      "lbw",
      "stumping",
      "hitWicket",
      "runOutStriker",
      "runOutNonStriker",
      "obstructingField",
    ]),
    newBatterId: z.string().trim().optional(),
    newBatterName: z.string().trim().optional(),
    runOutBatsman: z.enum(["striker", "nonStriker"]).optional(),
    runsWithWicket: z.union([
      z.literal(0),
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(6),
    ]),
  })
  .superRefine((values, ctx) => {
    const isRunOut =
      values.wicketType === "runOutStriker" ||
      values.wicketType === "runOutNonStriker";
    if (isRunOut && !values.runOutBatsman) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["runOutBatsman"],
        message: "Select which batter is run out.",
      });
    }
  });

export const retireFormSchema = z.object({
  retiringBatter: z.enum(["striker", "nonStriker"]),
  newBatterId: z.string().trim().optional(),
  newBatterName: z.string().trim().optional(),
  reason: z.string().trim().optional(),
}).superRefine((values, ctx) => {
  const hasId = Boolean(values.newBatterId?.trim());
  const hasName = Boolean(values.newBatterName?.trim());
  if (!hasId && !hasName) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["newBatterId"],
      message: "Select next batter or enter a name.",
    });
  }
});

export type WicketFormValues = z.infer<typeof wicketFormSchema>;
export type RetireFormValues = z.infer<typeof retireFormSchema>;
