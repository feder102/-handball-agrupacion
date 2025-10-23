import { useEffect, useState } from "react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type RealtimeRow = Record<string, unknown>;

export function useRealtimeTable<Row extends RealtimeRow = RealtimeRow>(channelName: string, tableName: string) {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function fetchRows() {
      const { data, error } = await supabase.from(tableName).select("*");
      if (error) {
        console.error(error.message);
        return;
      }
      if (data && isMounted) {
        setRows(data as Row[]);
      }
    }

    void fetchRows();

    const channel = supabase
      .channel(channelName)
      .on("postgres_changes", { event: "*", schema: "public", table: tableName }, (payload) => {
        if (!isMounted) return;
        setRows((current) => applyRealtimeChange(current, payload as RealtimePostgresChangesPayload<Row>));
      })
      .subscribe();

    return () => {
      isMounted = false;
      void channel.unsubscribe();
    };
  }, [channelName, tableName]);

  return { rows };
}

function applyRealtimeChange<Row extends RealtimeRow>(
  current: Row[],
  payload: RealtimePostgresChangesPayload<Row>
) {
  const newRow = payload.new as Row | null;
  const oldRow = payload.old as Row | null;
  const newId = getRowIdentifier(newRow);
  const oldId = getRowIdentifier(oldRow);

  switch (payload.eventType) {
    case "INSERT":
      return newRow ? [newRow, ...current] : current;
    case "UPDATE":
      if (!newRow || !newId) return current;
      return current.map((row) => (getRowIdentifier(row) === newId ? newRow : row));
    case "DELETE":
      if (!oldId) return current;
      return current.filter((row) => getRowIdentifier(row) !== oldId);
    default:
      return current;
  }
}

function getRowIdentifier(row: RealtimeRow | null): string | number | null {
  if (!row) return null;
  const candidate = row.id ?? row.label ?? null;
  if (typeof candidate === "string" || typeof candidate === "number") {
    return candidate;
  }
  return null;
}
