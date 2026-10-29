import { useCallback, useEffect } from "react";
import type { Dispatch } from "react";
import {
  readContactListUrl,
  writeContactListUrl,
} from "../utils/contactListUrl";
import type {
  ContactListAction,
  ContactListQueryUpdate,
  ContactListState,
} from "./useContactListState";

interface UseContactListNavigationOptions {
  state: ContactListState;
  dispatch: Dispatch<ContactListAction>;
  beginLoading: () => void;
}

export function useContactListNavigation({
  state,
  dispatch,
  beginLoading,
}: UseContactListNavigationOptions) {
  const { search, tag, company, sortBy, sortOrder, page } = state;

  useEffect(() => {
    writeContactListUrl(
      { search, tag, company: company.trim(), sortBy, sortOrder, page },
      "replace",
    );
  }, [company, page, search, sortBy, sortOrder, tag]);

  useEffect(() => {
    const restoreListState = () => {
      const restoredState = readContactListUrl();
      beginLoading();
      dispatch({ type: "url-restored", state: restoredState });
    };

    window.addEventListener("popstate", restoreListState);
    return () => window.removeEventListener("popstate", restoreListState);
  }, [beginLoading, dispatch]);

  const updateQuery = useCallback(
    (
      values: ContactListQueryUpdate,
      historyMode: "push" | "replace",
    ) => {
      beginLoading();
      writeContactListUrl(
        {
          search,
          tag,
          company: company.trim(),
          sortBy,
          sortOrder,
          page: 1,
          ...values,
        },
        historyMode,
      );
      dispatch({ type: "query-changed", query: values });
    },
    [beginLoading, company, dispatch, search, sortBy, sortOrder, tag],
  );

  const updatePage = useCallback(
    (nextPage: number) => {
      beginLoading();
      writeContactListUrl(
        {
          search,
          tag,
          company: company.trim(),
          sortBy,
          sortOrder,
          page: nextPage,
        },
        "push",
      );
      dispatch({ type: "page-changed", page: nextPage });
    },
    [beginLoading, company, dispatch, search, sortBy, sortOrder, tag],
  );

  return { updateQuery, updatePage };
}
