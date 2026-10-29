import type { ContactInput } from "../../../shared/src";
import {
  isRecord,
  rejectUnknownFields,
  RequestValidationError,
} from "./common";

const readText = (
  value: unknown,
  field: string,
  maxLength: number,
  optional = true,
): string | undefined => {
  if (value === undefined && optional) return undefined;
  if (typeof value !== "string") {
    throw new RequestValidationError(`${field} must be a string`);
  }
  const text = value.trim();
  if ((!optional && text.length === 0) || text.length > maxLength) {
    throw new RequestValidationError(
      `${field} must be ${optional ? "at most" : "between 1 and"} ${maxLength} characters`,
    );
  }
  return text;
};

const readTags = (value: unknown): string[] | undefined => {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.length > 50) {
    throw new RequestValidationError(
      "tags must be an array of up to 50 non-empty strings",
    );
  }
  const tags: unknown[] = value;
  if (
    !tags.every(
      (tag): tag is string =>
        typeof tag === "string" &&
        tag.trim().length > 0 &&
        tag.trim().length <= 50,
    )
  ) {
    throw new RequestValidationError(
      "tags must be an array of up to 50 non-empty strings",
    );
  }
  return [...new Set(tags.map((tag) => tag.trim()))];
};

export function parseContactInput(value: unknown): ContactInput;
export function parseContactInput(
  value: unknown,
  partial: true,
): Partial<ContactInput>;
export function parseContactInput(
  value: unknown,
  partial = false,
): ContactInput | Partial<ContactInput> {
  if (!isRecord(value)) {
    throw new RequestValidationError("Request body must be an object");
  }
  rejectUnknownFields(
    value,
    partial
      ? ["firstName", "lastName", "email", "phone", "company", "tags", "__v"]
      : ["firstName", "lastName", "email", "phone", "company", "tags"],
  );
  const input: Partial<ContactInput> = {};
  const fields: Array<
    "firstName" | "lastName" | "email" | "phone" | "company"
  > = ["firstName", "lastName", "email", "phone", "company"];

  for (const field of fields) {
    if (!partial || value[field] !== undefined) {
      const required = field === "firstName" || field === "lastName";
      const text = readText(
        value[field],
        field,
        field === "email" ? 254 : 100,
        !required,
      );
      if (text !== undefined) input[field] = text;
    }
  }

  if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    throw new RequestValidationError("email must be a valid email address");
  }
  if (!partial || value.tags !== undefined) {
    input.tags = readTags(value.tags) ?? [];
  }
  if (partial && Object.keys(input).length === 0) {
    throw new RequestValidationError(
      "At least one contact field must be provided",
    );
  }
  if (partial) return input;
  if (input.firstName === undefined || input.lastName === undefined) {
    throw new RequestValidationError("firstName and lastName are required");
  }
  return {
    ...input,
    firstName: input.firstName,
    lastName: input.lastName,
  };
}
