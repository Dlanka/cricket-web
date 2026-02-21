import { format, isSameDay, isValid, parseISO } from "date-fns";

type NullableDate = string | null | undefined;

export const formatDate = (
  value: NullableDate,
  fallback = "TBD",
  pattern = "d MMM yyyy",
) => {
  if (!value) {
    return fallback;
  }

  const parsed = parseISO(value);
  if (!isValid(parsed)) {
    return fallback;
  }

  return format(parsed, pattern);
};

export const formatDateTime = (
  value: NullableDate,
  fallback = "Scheduling pending",
) => formatDate(value, fallback, "d MMM yyyy, h:mm a");

export const formatDateRange = (
  startDate: NullableDate,
  endDate: NullableDate,
  fallback = "TBD",
) => {
  const formattedStart = formatDate(startDate, fallback);
  const formattedEnd = formatDate(endDate, fallback);

  if (
    startDate &&
    endDate &&
    formattedStart !== fallback &&
    formattedEnd !== fallback
  ) {
    const parsedStart = parseISO(startDate);
    const parsedEnd = parseISO(endDate);

    if (isValid(parsedStart) && isValid(parsedEnd) && isSameDay(parsedStart, parsedEnd)) {
      return formattedStart;
    }
  }

  return `${formattedStart} - ${formattedEnd}`;
};
