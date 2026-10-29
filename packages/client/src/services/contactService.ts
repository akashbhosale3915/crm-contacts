import type {
  Activity,
  BulkTagsInput,
  Contact,
  ContactInput,
  ContactListQuery,
  ContactListResponse,
  ContactUpdateInput,
} from "../../../shared/src";
import apiClient from "./apiClient";

export const contactService = {
  async list(query: ContactListQuery, signal?: AbortSignal) {
    const params = new URLSearchParams({
      page: String(query.page),
      limit: String(query.limit),
      search: query.search,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
    if (query.tag) params.set("tag", query.tag);
    if (query.company) params.set("company", query.company);
    const response = await apiClient.get<ContactListResponse>(
      `/contacts?${params.toString()}`,
      { signal },
    );
    return response.data;
  },

  async listTags(): Promise<string[]> {
    const response = await apiClient.get<string[]>("/contacts/tags");
    return response.data;
  },

  async get(id: string, signal?: AbortSignal): Promise<Contact> {
    const response = await apiClient.get<Contact>(`/contacts/${id}`, { signal });
    return response.data;
  },

  async getActivities(
    id: string,
    signal?: AbortSignal,
  ): Promise<Activity[]> {
    const response = await apiClient.get<Activity[]>(
      `/contacts/${id}/activities`,
      { signal },
    );
    return response.data;
  },

  async create(input: ContactInput): Promise<Contact> {
    const response = await apiClient.post<Contact>("/contacts", input);
    return response.data;
  },

  async update(id: string, input: ContactUpdateInput): Promise<Contact> {
    const response = await apiClient.put<Contact>(`/contacts/${id}`, input);
    return response.data;
  },

  async assignTags(input: BulkTagsInput): Promise<void> {
    await apiClient.post("/contacts/bulk-tags", input);
  },
};
