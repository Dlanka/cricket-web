import type { BattingStyle, BowlingStyle } from "../types/players.types";

export const BATTING_STYLE_OPTIONS: { value: BattingStyle; label: string }[] = [
  { value: "RIGHT_HAND_BAT", label: "Right-hand bat" },
  { value: "LEFT_HAND_BAT", label: "Left-hand bat" },
];

export const BOWLING_STYLE_OPTIONS: { value: BowlingStyle; label: string }[] = [
  { value: "RIGHT_ARM_FAST", label: "Right-arm fast" },
  { value: "RIGHT_ARM_FAST_MEDIUM", label: "Right-arm fast-medium" },
  { value: "RIGHT_ARM_MEDIUM", label: "Right-arm medium" },
  { value: "RIGHT_ARM_OFF_BREAK", label: "Right-arm off-break" },
  { value: "RIGHT_ARM_LEG_BREAK", label: "Right-arm leg-break" },
  { value: "LEFT_ARM_FAST", label: "Left-arm fast" },
  { value: "LEFT_ARM_FAST_MEDIUM", label: "Left-arm fast-medium" },
  { value: "LEFT_ARM_MEDIUM", label: "Left-arm medium" },
  { value: "LEFT_ARM_ORTHODOX", label: "Left-arm orthodox" },
  { value: "LEFT_ARM_WRIST_SPIN", label: "Left-arm wrist spin" },
];

const buildLabelMap = <T extends string>(
  options: { value: T; label: string }[],
) => new Map<T, string>(options.map((option) => [option.value, option.label]));

const battingStyleLabels = buildLabelMap(BATTING_STYLE_OPTIONS);
const bowlingStyleLabels = buildLabelMap(BOWLING_STYLE_OPTIONS);

export const getBattingStyleLabel = (value?: BattingStyle | null) =>
  value ? battingStyleLabels.get(value) ?? value : undefined;

export const getBowlingStyleLabel = (value?: BowlingStyle | null) =>
  value ? bowlingStyleLabels.get(value) ?? value : undefined;
