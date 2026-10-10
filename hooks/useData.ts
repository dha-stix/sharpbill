"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { watchClient, watchClients, watchInvoice, watchInvoices } from "@/lib/firebase-actions";
import type { Client, Invoice } from "@/lib/types";

type Unsub = () => void;

/**
 * Generic realtime subscription hook bound to the signed-in user.
 * `key` identifies the subscription; data is considered loading until a
 * snapshot for the current key has arrived.
 */
function useLive<T>(key: string | null, subscribe: (uid: string, set: (v: T) => void) => Unsub, initial: T) {
  const { user } = useAuth();
  const fullKey = user && key !== null ? `${user.uid}:${key}` : null;
  const [state, setState] = useState<{ key: string | null; data: T }>({ key: null, data: initial });

  useEffect(() => {
    if (!user || fullKey === null) return;
    return subscribe(user.uid, (data) => setState({ key: fullKey, data }));
    // `subscribe` is recreated every render; the key captures its inputs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullKey]);

  const ready = state.key === fullKey;
  return { data: ready ? state.data : initial, loading: !ready };
}

const NO_CLIENTS: Client[] = [];
const NO_INVOICES: Invoice[] = [];

export function useClients() {
  const { data, loading } = useLive<Client[]>("clients", (uid, set) => watchClients(uid, set), NO_CLIENTS);
  return { clients: data, loading };
}

export function useClient(id?: string) {
  const { data, loading } = useLive<Client | null>(id ? `client:${id}` : null, (uid, set) => watchClient(uid, id!, set), null);
  return { client: data, loading };
}

export function useInvoices(clientId?: string) {
  const { data, loading } = useLive<Invoice[]>(`invoices:${clientId ?? "all"}`, (uid, set) => watchInvoices(uid, set, clientId), NO_INVOICES);
  return { invoices: data, loading };
}

export function useInvoice(id?: string) {
  const { data, loading } = useLive<Invoice | null>(id ? `invoice:${id}` : null, (uid, set) => watchInvoice(uid, id!, set), null);
  return { invoice: data, loading };
}
