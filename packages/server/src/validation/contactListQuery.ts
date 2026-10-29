import type { ContactListQuery } from "../../../shared/src";
import { rejectUnknownFields, RequestValidationError } from "./common";

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
