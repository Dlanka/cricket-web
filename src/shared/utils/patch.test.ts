import { describe, expect, it } from "vitest";
import { buildPatchPayload, isEmptyPatch } from "./patch";

describe("buildPatchPayload", () => {
  it("returns only dirty fields", () => {
    const values = {
      name: "Tournament",
      location: "Colombo",
      oversPerInnings: 20,
    };
    const dirtyFields = {
      name: true,
      location: false,
      oversPerInnings: true,
    };

    const result = buildPatchPayload(values, dirtyFields);

    expect(result).toEqual({ name: "Tournament", oversPerInnings: 20 });
  });

  it("treats empty payload as empty", () => {
    const values = { name: "Tournament" };
    const dirtyFields = { name: false };

    const result = buildPatchPayload(values, dirtyFields);

    expect(isEmptyPatch(result)).toBe(true);
  });
});
