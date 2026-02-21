import { describe, expect, it } from "vitest";
import { tournamentUpdateSchema } from "./tournamentUpdateSchema";

describe("tournamentUpdateSchema", () => {
  it("rejects empty payload", () => {
    const result = tournamentUpdateSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts single field update", () => {
    const result = tournamentUpdateSchema.safeParse({ name: "Summer Cup" });
    expect(result.success).toBe(true);
  });
});
