import type { RequestHandler } from "express";
import {
  assignTagToContacts,
  createContact,
  getContact,
  isValidContactId,
  listContactActivities,
  listContacts,
  listTags,
  updateContact,
} from "../services/contactService";
import {
  parseContactIds,
  parseContactInput,
  parseContactListQuery,
  parseTag,
  RequestValidationError,
} from "../validation";

const requireContactId = (value: string | string[]): string => {
  if (typeof value !== "string" || !isValidContactId(value)) {
    throw new RequestValidationError("Invalid contact ID");
  }
  return value;
};

export const getContacts: RequestHandler = async (req, res) => {
  const query = parseContactListQuery(req.query);
  res.json(await listContacts(query));
};

export const getTags: RequestHandler = async (_req, res) => {
  res.json(await listTags());
};

export const getContactById: RequestHandler = async (req, res) => {
  const id = requireContactId(req.params.id);
  res.json(await getContact(id));
};

export const getContactActivities: RequestHandler = async (req, res) => {
  const id = requireContactId(req.params.id);
  res.json(await listContactActivities(id));
};

export const postContact: RequestHandler = async (req, res) => {
  const input = parseContactInput(req.body);
  res.status(201).json(await createContact(input));
};

export const putContact: RequestHandler = async (req, res) => {
  const id = requireContactId(req.params.id);
  const body: unknown = req.body;
  if (
    typeof body !== "object" ||
    body === null ||
    Array.isArray(body) ||
    !("__v" in body) ||
    !Number.isInteger(body.__v) ||
    Number(body.__v) < 0
  ) {
    throw new RequestValidationError("A valid contact version (__v) is required");
  }

  const input = parseContactInput(body, true);
  res.json(await updateContact(id, Number(body.__v), input));
};

export const postBulkTags: RequestHandler = async (req, res) => {
  if (
    typeof req.body !== "object" ||
    req.body === null ||
    Array.isArray(req.body)
  ) {
    throw new RequestValidationError("Request body must be an object");
  }
  const body = req.body as Record<string, unknown>;
  const unexpectedField = Object.keys(body).find(
    (field) => field !== "contactIds" && field !== "tag",
  );
  if (unexpectedField) {
    throw new RequestValidationError(
      `${unexpectedField} is not an allowed field`,
    );
  }
  const contactIds = parseContactIds(body.contactIds);
  const tag = parseTag(body.tag);
  await assignTagToContacts(contactIds, tag);
  res.json({ message: "Tags assigned successfully" });
};
