import { useReducer } from "react";
import {
  readContactListUrl,
  type ContactListUrlState,
} from "../utils/contactListUrl";

export interface ContactListState extends ContactListUrlState {
  selectedIds: string[];
}

export type ContactListQueryUpdate = Partial<
  Pick<
    ContactListUrlState,
    "search" | "tag" | "company" | "sortBy" | "sortOrder"
  >
>;

export type ContactListAction =
  | { type: "query-changed"; query: ContactListQueryUpdate }
  | { type: "page-changed"; page: number }
  | { type: "selection-changed"; selectedIds: string[] }
  | { type: "url-restored"; state: ContactListUrlState };

export const createInitialContactListState = (): ContactListState => ({
  ...readContactListUrl(),
  selectedIds: [],
});

export const contactListReducer = (
  state: ContactListState,
  action: ContactListAction,
): ContactListState => {
  switch (action.type) {
    case "query-changed":
      return {
        ...state,
        ...action.query,
        page: 1,
        selectedIds: [],
      };
    case "page-changed":
      return { ...state, page: action.page, selectedIds: [] };
    case "selection-changed":
      return { ...state, selectedIds: action.selectedIds };
    case "url-restored":
      return { ...action.state, selectedIds: [] };
    default: {
      const exhaustiveCheck: never = action;
      return exhaustiveCheck;
    }
  }
};

export function useContactListState() {
  return useReducer(
    contactListReducer,
    undefined,
    createInitialContactListState,
  );
}
