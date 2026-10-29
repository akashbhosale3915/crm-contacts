export class RequestValidationError extends Error {}

export const isRecord = (
  value: unknown,
): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const rejectUnknownFields = (
  value: Record<string, unknown>,
  allowedFields: readonly string[],
): void => {
  const unexpectedField = Object.keys(value).find(
    (field) => !allowedFields.includes(field),
  );
  if (unexpectedField) {
    throw new RequestValidationError(
      `${unexpectedField} is not an allowed field`,
    );
  }
};
