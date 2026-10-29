import { useCallback, useEffect, useRef, useState } from "react";
import type {
  Contact,
  ContactListQuery,
} from "../../../shared/src";
import {
  getApiErrorMessage,
  isRequestCanceled,
} from "../services/apiClient";
import { contactService } from "../services/contactService";

export function useContacts(query: ContactListQuery) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [totalContacts, setTotalContacts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const requestController = useRef<AbortController | null>(null);
  const pendingRequestTimer = useRef<number | null>(null);
  const {
    company,
    limit,
    page,
    search,
    sortBy,
    sortOrder,
    tag,
  } = query;

  const load = useCallback(async (listQuery: ContactListQuery) => {
    if (pendingRequestTimer.current !== null) {
      window.clearTimeout(pendingRequestTimer.current);
      pendingRequestTimer.current = null;
    }
    requestController.current?.abort();
    const controller = new AbortController();
    requestController.current = controller;
    setLoading(true);
    setError("");

    try {
      const response = await contactService.list(listQuery, controller.signal);
      if (controller.signal.aborted) return;
      setContacts(response.contacts);
      setTotalPages(response.pages);
      setTotalContacts(response.total);
    } catch (requestError) {
      if (controller.signal.aborted || isRequestCanceled(requestError)) return;
      const message = navigator.onLine
        ? getApiErrorMessage(
            requestError,
            "Failed to load contacts. Please try again.",
          )
        : "You are offline. Reconnect to load the latest contacts.";
      setError(message);
    } finally {
      if (requestController.current === controller) {
        requestController.current = null;
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    pendingRequestTimer.current = window.setTimeout(() => {
      pendingRequestTimer.current = null;
      void load({ company, limit, page, search, sortBy, sortOrder, tag });
    }, 250);
    return () => {
      if (pendingRequestTimer.current !== null) {
        window.clearTimeout(pendingRequestTimer.current);
        pendingRequestTimer.current = null;
      }
      const activeController = requestController.current;
      activeController?.abort();
      if (requestController.current === activeController) {
        requestController.current = null;
      }
    };
  }, [
    load,
    company,
    limit,
    page,
    search,
    sortBy,
    sortOrder,
    tag,
  ]);

  useEffect(
    () => () => requestController.current?.abort(),
    [],
  );

  const refresh = useCallback(
    () =>
      load({
        page,
        limit,
        search,
        tag,
        company,
        sortBy,
        sortOrder,
      }),
    [
      company,
      limit,
      load,
      page,
      search,
      sortBy,
      sortOrder,
      tag,
    ],
  );
  const beginLoading = useCallback(() => {
    setLoading(true);
    setError("");
  }, []);

  return {
    contacts,
    totalContacts,
    totalPages,
    loading,
    error,
    refresh,
    beginLoading,
  };
}
