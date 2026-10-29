import type { ContactInput } from "../../../shared/src";

type ContactSnapshot = Pick<
  ContactInput,
  "firstName" | "lastName" | "email" | "phone" | "company" | "tags"
>;

const normalizeEmail = (email: string | undefined): string =>
  email?.trim().toLowerCase() ?? "";

const sameTags = (left: string[], right: string[]): boolean =>
  left.length === right.length && left.every((tag) => right.includes(tag));

export const hasContactChanges = (
  current: ContactSnapshot,
  update: Partial<ContactInput>,
): boolean => {
  for (const field of ["firstName", "lastName", "phone", "company"] as const) {
    if (update[field] !== undefined && update[field] !== current[field]) {
      return true;
    }
  }

  if (
    update.email !== undefined &&
    normalizeEmail(update.email) !== normalizeEmail(current.email)
  ) {
    return true;
  }

  if (
    update.tags !== undefined &&
    !sameTags(current.tags ?? [], update.tags)
  ) {
    return true;
  }

  return false;
};
