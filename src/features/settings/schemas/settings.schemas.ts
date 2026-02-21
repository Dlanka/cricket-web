import { z } from "zod";

export const organizationSettingsSchema = z.object({
  tenantName: z.string().trim().min(1, "Tenant name is required."),
  timezone: z.string().trim().min(1, "Timezone is required."),
  locale: z.string().trim().min(1, "Locale is required."),
  dateFormat: z.string().trim().min(1, "Date format is required."),
  logoUrl: z
    .string()
    .trim()
    .refine((value) => value.length === 0 || z.string().url().safeParse(value).success, {
      message: "Logo URL must be a valid URL.",
    }),
});

export const tournamentDefaultsSettingsSchema = z.object({
  defaultType: z.enum(["LEAGUE", "KNOCKOUT", "LEAGUE_KNOCKOUT"]),
  defaultOversPerInnings: z
    .number()
    .int("Overs must be a whole number.")
    .min(1, "Overs must be at least 1."),
  defaultBallsPerOver: z
    .number()
    .int("Balls per over must be a whole number.")
    .min(1, "Balls per over must be at least 1."),
  defaultQualificationCount: z
    .number()
    .int("Qualification count must be a whole number.")
    .min(2, "Qualification count must be at least 2."),
  pointsWin: z.number().min(0, "Points must be zero or higher."),
  pointsTie: z.number().min(0, "Points must be zero or higher."),
  pointsNoResult: z.number().min(0, "Points must be zero or higher."),
  pointsLoss: z.number().min(0, "Points must be zero or higher."),
});

export const matchRulesSettingsSchema = z.object({
  allowUndo: z.boolean(),
  maxUndoWindowSec: z
    .number()
    .int("Max undo window must be a whole number.")
    .min(0, "Max undo window must be zero or higher."),
  lockRosterAfterStart: z.boolean(),
  lockMatchConfigAfterStart: z.boolean(),
  requireBothRostersBeforeStart: z.boolean(),
});

export const permissionsSettingsSchema = z.object({
  permissionsAdmin: z.array(
    z.enum([
      "*",
      "tournament.manage",
      "fixture.generate",
      "roster.manage",
      "match.start",
      "score.write",
      "bowler.change",
    ]),
  ),
  permissionsScorer: z.array(
    z.enum([
      "*",
      "tournament.manage",
      "fixture.generate",
      "roster.manage",
      "match.start",
      "score.write",
      "bowler.change",
    ]),
  ),
  permissionsViewer: z.array(
    z.enum([
      "*",
      "tournament.manage",
      "fixture.generate",
      "roster.manage",
      "match.start",
      "score.write",
      "bowler.change",
    ]),
  ),
});

const memberRoleSchema = z.enum(["ADMIN", "SCORER", "VIEWER"]);
const memberStatusSchema = z.enum(["ACTIVE", "DISABLED"]);

export const assignTenantMemberSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  role: memberRoleSchema,
  status: memberStatusSchema.default("ACTIVE"),
});

export const editTenantMemberSchema = z.object({
  role: memberRoleSchema,
  status: memberStatusSchema,
});
