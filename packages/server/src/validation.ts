import type {
  ContactInput,
  ContactListQuery,
} from "../../shared/src";

export class RequestValidationError extends Error {}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const rejectUnknownFields = (
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
  > = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "company",
  ];

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

const readQueryText = (value: unknown, field: string): string | undefined => {
  if (value === undefined) return undefined;
  if (typeof value !== "string") {
    throw new RequestValidationError(`${field} must be a string`);
  }
  return value.trim();
};

const readPositiveInteger = (
  value: unknown,
  field: string,
  defaultValue: number,
  maximum: number,
): number => {
  if (value === undefined) return defaultValue;
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    throw new RequestValidationError(`${field} must be a positive integer`);
  }
  const number = Number(value);
  if (number < 1 || number > maximum) {
    throw new RequestValidationError(`${field} must be between 1 and ${maximum}`);
  }
  return number;
};

export const parseContactListQuery = (
  value: Record<string, unknown>,
): ContactListQuery => {
  rejectUnknownFields(value, [
    "page",
    "limit",
    "search",
    "tag",
    "company",
    "sortBy",
    "sortOrder",
  ]);
  const sortBy = readQueryText(value.sortBy, "sortBy") ?? "createdDate";
  const sortOrder = readQueryText(value.sortOrder, "sortOrder") ?? "desc";
  if (sortBy !== "name" && sortBy !== "createdDate") {
    throw new RequestValidationError("sortBy must be name or createdDate");
  }
  if (sortOrder !== "asc" && sortOrder !== "desc") {
    throw new RequestValidationError("sortOrder must be asc or desc");
  }
  return {
    page: readPositiveInteger(value.page, "page", 1, Number.MAX_SAFE_INTEGER),
    limit: readPositiveInteger(value.limit, "limit", 10, 100),
    search: readQueryText(value.search, "search") ?? "",
    tag: readQueryText(value.tag, "tag"),
    company: readQueryText(value.company, "company"),
    sortBy,
    sortOrder,
  };
};

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
