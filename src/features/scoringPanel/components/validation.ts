import type { ExtraType } from "../types/scoringPanel.types";

export const applyExtraSelection = (
  current: ExtraType | null,
  next: ExtraType,
  wicketSelected: boolean,
) => {
  if (current === next) {
    return {
      selectedExtraType: null as ExtraType | null,
      wicketSelected,
    };
  }

  // Extras are single-select in UI; wicket can coexist with wide/noBall.
  return {
    selectedExtraType: next as ExtraType,
    wicketSelected,
  };
};

export const applyWicketToggle = (
  checked: boolean,
  selectedExtraType: ExtraType | null,
) => ({
  wicketSelected: checked,
  selectedExtraType,
});
