import { RequestValidationError } from "./common";

export const parseTag = (value: unknown): string => {
  if (
    typeof value !== "string" ||
    value.trim().length === 0 ||
    value.trim().length > 50
  ) {
    throw new RequestValidationError(
      "tag must be a non-empty string of at most 50 characters",
    );
  }
  return value.trim();
};

export const parseContactIds = (value: unknown): string[] => {
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    value.length > 100 ||
    value.some(
      (id) => typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id),
    )
  ) {
    throw new RequestValidationError(
      "contactIds must contain 1 to 100 valid contact IDs",
    );
  }
  const ids: unknown[] = value;
  return [...new Set(ids.filter((id): id is string => typeof id === "string"))];
};
