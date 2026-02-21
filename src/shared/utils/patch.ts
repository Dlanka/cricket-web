import type { FieldNamesMarkedBoolean, FieldValues } from "react-hook-form";

type DirtyFieldMap<T extends FieldValues> = FieldNamesMarkedBoolean<T>;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const buildPatchPayload = <T extends FieldValues>(
  values: T,
  dirtyFields: DirtyFieldMap<T>,
): Partial<T> => {
  const payload: Partial<T> = {};

  Object.keys(dirtyFields).forEach((key) => {
    const dirtyValue = dirtyFields[key as keyof DirtyFieldMap<T>];
    if (!dirtyValue) return;

    const value = values[key as keyof T];

    if (isObject(dirtyValue) && isObject(value)) {
      (payload as Record<string, unknown>)[key] = buildPatchPayload(
        value as FieldValues,
        dirtyValue as DirtyFieldMap<FieldValues>,
      );
      return;
    }

    (payload as Record<string, unknown>)[key] = value;
  });

  return payload;
};

export const isEmptyPatch = (payload: Record<string, unknown>) =>
  Object.keys(payload).length === 0;
