export type ActivityType = "CONTACT_UPDATED" | "TAG_ADDED" | "TAG_REMOVED";

export interface Contact {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  tags: string[];
  createdDate: string;
  updatedDate: string;
  __v: number;
}

export interface ContactInput {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  tags?: string[];
}

export interface ContactUpdateInput extends Partial<ContactInput> {
  __v: number;
}

export interface ContactListQuery {
  page: number;
  limit: number;
  search: string;
  tag?: string;
  company?: string;
  sortBy: "name" | "createdDate";
  sortOrder: "asc" | "desc";
}

export interface ContactListResponse {
  contacts: Contact[];
  total: number;
  page: number;
  pages: number;
}

export interface Activity {
  _id: string;
  contactId: string;
  type: ActivityType;
  details?: string;
  timestamp: string;
}

export interface BulkTagsInput {
  contactIds: string[];
  tag: string;
}

export interface ApiErrorResponse {
  error: string;
}
