import { z } from "zod";
import type { BattingStyle, BowlingStyle } from "../types/players.types";

const optionalNumber = z.number().int().min(0).optional();

const battingStyles = ["RIGHT_HAND_BAT", "LEFT_HAND_BAT"] as const;
const bowlingStyles = [
  "RIGHT_ARM_FAST",
  "RIGHT_ARM_FAST_MEDIUM",
  "RIGHT_ARM_MEDIUM",
  "RIGHT_ARM_OFF_BREAK",
  "RIGHT_ARM_LEG_BREAK",
  "LEFT_ARM_FAST",
  "LEFT_ARM_FAST_MEDIUM",
  "LEFT_ARM_MEDIUM",
  "LEFT_ARM_ORTHODOX",
  "LEFT_ARM_WRIST_SPIN",
] as const;

const optionalBattingStyle = z.enum(battingStyles).optional();
const optionalBowlingStyle = z.enum(bowlingStyles).optional();

export const playerCreateSchema = z.object({
  fullName: z.string().min(2, "Enter a player name"),
  jerseyNumber: optionalNumber,
  battingStyle: optionalBattingStyle,
  bowlingStyle: optionalBowlingStyle,
  isWicketKeeper: z.boolean().optional(),
});

export const playerUpdateSchema = z
  .object({
    fullName: z.string().min(2, "Enter a player name").optional(),
    jerseyNumber: optionalNumber,
    battingStyle: optionalBattingStyle,
    bowlingStyle: optionalBowlingStyle,
    isWicketKeeper: z.boolean().optional(),
  })
  .refine((values) => Object.values(values).some((value) => value !== undefined), {
    message: "Update at least one field.",
  });

export type PlayerCreateFormValues = z.input<typeof playerCreateSchema>;
export type PlayerCreateValues = z.output<typeof playerCreateSchema>;
export type PlayerUpdateFormValues = z.input<typeof playerUpdateSchema>;
export type PlayerUpdateValues = z.output<typeof playerUpdateSchema>;
export type PlayerCreateBattingStyle = BattingStyle;
export type PlayerCreateBowlingStyle = BowlingStyle;
