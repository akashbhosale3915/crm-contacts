import type { ContactListQuery } from "../../../shared/src";

export interface ContactListUrlState {
  search: string;
  tag: string;
  company: string;
  sortBy: ContactListQuery["sortBy"];
  sortOrder: ContactListQuery["sortOrder"];
  page: number;
}

export const readContactListUrl = (): ContactListUrlState => {
  const params = new URLSearchParams(window.location.search);
  const page = Number(params.get("page"));
  const sortBy = params.get("sortBy");
  const sortOrder = params.get("sortOrder");

  return {
    search: params.get("search") ?? "",
    tag: params.get("tag") ?? "",
    company: params.get("company") ?? "",
    sortBy:
      sortBy === "name" || sortBy === "createdDate"
        ? sortBy
        : "createdDate",
    sortOrder: sortOrder === "asc" || sortOrder === "desc" ? sortOrder : "desc",
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
  };
};

export const writeContactListUrl = (
  state: ContactListUrlState,
  mode: "push" | "replace",
): void => {
  const params = new URLSearchParams();
  if (state.search) params.set("search", state.search);
  if (state.tag) params.set("tag", state.tag);
  if (state.company) params.set("company", state.company);
  if (state.page > 1) params.set("page", String(state.page));
  if (state.sortBy !== "createdDate") params.set("sortBy", state.sortBy);
  if (state.sortOrder !== "desc") params.set("sortOrder", state.sortOrder);

  const query = params.toString();
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
  if (mode === "push") {
    window.history.pushState(null, "", nextUrl);
  } else {
    window.history.replaceState(null, "", nextUrl);
  }
};
