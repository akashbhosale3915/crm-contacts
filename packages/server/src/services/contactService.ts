import mongoose from "mongoose";
import type {
  Activity as ActivityResponse,
  Contact as ContactResponse,
  ContactInput,
  ContactListQuery,
  ContactListResponse,
} from "../../../shared/src";
import Activity, { type ActivityType } from "../models/activity";
import Contact, { type IContact } from "../models/contact";
import { hasContactChanges } from "./contactChanges";
import AppError from "../utils/AppError";

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const isValidContactId = (id: string): boolean =>
  mongoose.isValidObjectId(id);

export const toContactResponse = (contact: IContact): ContactResponse => ({
  _id: contact.id,
  firstName: contact.firstName,
  lastName: contact.lastName,
  email: contact.email,
  phone: contact.phone,
  company: contact.company,
  tags: contact.tags,
  createdDate: contact.createdDate.toISOString(),
  updatedDate: contact.updatedDate.toISOString(),
  __v: contact.__v,
});

const logActivity = async (
  contactId: string,
  type: ActivityType,
  details?: string,
): Promise<void> => {
  await Activity.create({ contactId, type, details });
};

export async function listContacts(
  options: ContactListQuery,
): Promise<ContactListResponse> {
  const filter: Record<string, unknown> = {};
  if (options.search) {
    const search = new RegExp(escapeRegex(options.search), "i");
    filter.$or = [
      { firstName: search },
      { lastName: search },
      { email: search },
      { phone: search },
    ];
  }
  if (options.tag) filter.tags = options.tag;
  if (options.company) {
    filter.company = new RegExp(escapeRegex(options.company), "i");
  }

  const direction: 1 | -1 = options.sortOrder === "asc" ? 1 : -1;
  const sort: Record<string, 1 | -1> =
    options.sortBy === "name"
      ? { firstName: direction, lastName: direction, _id: direction }
      : { createdDate: direction, _id: direction };
  const [documents, total] = await Promise.all([
    Contact.find(filter)
      .sort(sort)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .exec(),
    Contact.countDocuments(filter).exec(),
  ]);

  return {
    contacts: documents.map(toContactResponse),
    total,
    page: options.page,
    pages: Math.ceil(total / options.limit),
  };
}

export async function listTags(): Promise<string[]> {
  const tags = await Contact.distinct("tags").exec();
  return tags.filter((tag): tag is string => typeof tag === "string");
}

export async function getContact(id: string): Promise<ContactResponse> {
  const contact = await Contact.findById(id).exec();
  if (!contact) throw new AppError(404, "Contact not found");
  return toContactResponse(contact);
}

export async function listContactActivities(
  id: string,
): Promise<ActivityResponse[]> {
  const activities = await Activity.find({ contactId: id })
    .sort({ timestamp: -1 })
    .limit(20)
    .lean()
    .exec();
  return activities.map((activity) => ({
    _id: activity._id.toString(),
    contactId: activity.contactId.toString(),
    type: activity.type,
    details: activity.details,
    timestamp: activity.timestamp.toISOString(),
  }));
}

export async function createContact(
  input: ContactInput,
): Promise<ContactResponse> {
  const contact = await Contact.create({
    ...input,
    email: input.email || undefined,
  });
  if (contact.tags.length > 0) {
    await Activity.insertMany(
      contact.tags.map((tag) => ({
        contactId: contact.id,
        type: "TAG_ADDED" as const,
        details: tag,
      })),
    );
  }
  return toContactResponse(contact);
}

export async function updateContact(
  id: string,
  expectedVersion: number,
  input: Partial<ContactInput>,
): Promise<ContactResponse> {
  const contact = await Contact.findById(id).exec();
  if (!contact) throw new AppError(404, "Contact not found");
  if (contact.__v !== expectedVersion) {
    throw new AppError(
      409,
      "Conflict: Contact was modified by another user. Please refresh.",
    );
  }
  if (!hasContactChanges(contact, input)) return toContactResponse(contact);

  const oldTags = new Set(contact.tags);
  const newTags = input.tags === undefined ? oldTags : new Set(input.tags);
  Object.assign(contact, input);
  if (input.email === "") contact.email = undefined;
  await contact.save();
  await logActivity(contact.id, "CONTACT_UPDATED");

  for (const tag of newTags) {
    if (!oldTags.has(tag)) await logActivity(contact.id, "TAG_ADDED", tag);
  }
  for (const tag of oldTags) {
    if (!newTags.has(tag)) await logActivity(contact.id, "TAG_REMOVED", tag);
  }
  return toContactResponse(contact);
}

export async function assignTagToContacts(
  contactIds: string[],
  tag: string,
): Promise<void> {
  const existingContacts = await Contact.find({
    _id: { $in: contactIds },
  })
    .select("_id")
    .exec();
  if (existingContacts.length !== contactIds.length) {
    throw new AppError(404, "One or more contacts were not found");
  }

  for (const contact of existingContacts) {
    const updated = await Contact.findOneAndUpdate(
      { _id: contact._id, tags: { $ne: tag } },
      { $addToSet: { tags: tag }, $inc: { __v: 1 } },
      { new: false },
    )
      .select("_id")
      .exec();
    if (updated) {
      await logActivity(contact.id, "TAG_ADDED", tag);
    }
  }
}
