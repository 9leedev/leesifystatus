"use client";

import { useMemo, useState } from "react";
import { Globe, Search, ShieldCheck } from "lucide-react";
import { StatusHeader } from "./status-header";
import { MonitorCard } from "./monitor-card";
import { IncidentFeed } from "./incident-feed";
import { UptimeBars } from "./uptime-bars";
import { StatusLegend } from "./latency-chart";
import { ProtectedPanel } from "./protected-panel";
import { SiteFooter } from "./site-footer";
import { useStatus } from "@/hooks/use-status";
import type { UpsiteConfig } from "@/lib/config";
import { cn, formatUptime } from "@/lib/format";
import type { Source } from "@/lib/source";
import type { MonitorStatus, StatusSnapshot } from "@/lib/types";

type StatusFilter = "all" | MonitorStatus;

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "up", label: "Operational" },
  { value: "degraded", label: "Degraded" },
  { value: "down", label: "Down" },
  { value: "paused", label: "Paused" },
];

export function Dashboard({
  initial,
  source,
  hasProtected,
  contact,
}: {
  initial: StatusSnapshot;
  source: Source;
  hasProtected: boolean;
  contact?: UpsiteConfig["site"]["contact"];
}) {
  const { snapshot, connection, refresh, refreshing } = useStatus(initial, source);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [tag, setTag] = useState<string | null>(null);
  const [tab, setTab] = useState<"public" | "protected">("public");

  const monitors = snapshot.monitors;

  const tags = useMemo(
    () => [...new Set(monitors.flatMap((m) => m.tags))].sort(),
    [monitors],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return monitors.filter((m) => {
      if (status !== "all" && m.state.status !== status) return false;
      if (tag && !m.tags.includes(tag)) return false;
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.target.toLowerCase().includes(q) ||
        m.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [monitors, query, status, tag]);

  const names = useMemo(
    () => Object.fromEntries(monitors.map((m) => [m.id, m.name])),
    [monitors],
  );

  const fleetUptime = useMemo(() => {
    let total = 0;
    let down = 0;
    for (const m of monitors) {
      for (const bucket of m.daily.slice(-90)) {
        total += bucket.n;
        down += bucket.down;
      }
    }
    return total === 0 ? null : (total - down) / total;
  }, [monitors]);

  const showTabs = hasProtected;

  return (
    <main
      id="main"
      className="mx-auto w-full max-w-7xl px-4 py-6 pb-10 sm:px-6 sm:py-10 lg:px-8"
    >
      <StatusHeader
        snapshot={snapshot}
        connection={connection}
        onRefresh={() => void refresh()}
        refreshing={refreshing}
      />

      {showTabs && (
        <nav
          className="mt-6 flex gap-1.5 overflow-x-auto pb-0.5 sm:mt-8"
          role="tablist"
          aria-label="Service groups"
        >
          {(
            [
              { value: "public", label: "Services", icon: Globe, count: monitors.length },
              { value: "protected", label: "Private", icon: ShieldCheck, count: null },
            ] as const
          ).map((t) => {
            const Icon = t.icon;
            const active = tab === t.value;
            return (
              <button
                key={t.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.value)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs transition sm:py-2",
                  active
                    ? "border-signal/40 bg-signal/10 text-signal"
                    : "border-edge bg-abyss/60 text-ink-dim hover:text-ink",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
                {t.count !== null && t.count > 0 && (
                  <span className="rounded-md bg-edge px-1.5 py-0.5 font-mono text-[10px] text-ink-dim">
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      )}

      {tab === "protected" && <ProtectedPanel source={source} />}

      <div hidden={tab !== "public"}>
        <section
          className={cn(
            "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center",
            showTabs ? "mt-5 sm:mt-6" : "mt-6 sm:mt-8",
          )}
        >
          <div className="relative w-full min-w-0 sm:min-w-[200px] sm:flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search services…"
              aria-label="Search services"
              className="w-full rounded-xl border border-edge bg-abyss/70 py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint focus:border-signal/50 focus:outline-none sm:py-2"
            />
          </div>

          <div
            className="flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="group"
            aria-label="Filter by status"
          >
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setStatus(filter.value)}
                aria-pressed={status === filter.value}
                className={cn(
                  "shrink-0 rounded-lg border px-2.5 py-2 text-[11px] transition sm:py-1.5",
                  status === filter.value
                    ? "border-signal/40 bg-signal/10 text-signal"
                    : "border-edge bg-abyss/60 text-ink-dim hover:text-ink",
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {tags.length > 0 && (
            <div
              className="flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              role="group"
              aria-label="Filter by tag"
            >
              {tags.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTag(tag === t ? null : t)}
                  aria-pressed={tag === t}
                  className={cn(
                    "shrink-0 rounded-lg border px-2.5 py-2 text-[11px] transition sm:py-1.5",
                    tag === t
                      ? "border-signal/40 bg-signal/10 text-signal"
                      : "border-edge bg-abyss/60 text-ink-dim hover:text-ink",
                  )}
                >
                  #{t}
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="mt-5 grid gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
          {visible.map((monitor, i) => (
            <MonitorCard key={monitor.id} monitor={monitor} index={i} />
          ))}
        </section>

        {visible.length === 0 && (
          <p className="mt-10 text-center text-sm text-ink-faint">
            {monitors.length === 0
              ? "No services configured yet."
              : "No services match this filter."}
          </p>
        )}

        <section className="mt-10 grid gap-6 sm:mt-12 lg:grid-cols-[1.15fr_1fr]">
          <div className="glass bevel rounded-2xl border border-edge p-4 sm:p-6">
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <h2 className="text-sm font-medium tracking-wide text-ink">Uptime overview</h2>
                <p className="mt-0.5 text-xs text-ink-faint">Last 90 days across all services</p>
              </div>
              <span className="font-mono text-xl text-ink sm:text-2xl">
                {formatUptime(fleetUptime)}
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {monitors.map((monitor) => (
                <div
                  key={monitor.id}
                  className="grid grid-cols-[minmax(0,5.5rem)_1fr_2.75rem] items-center gap-2 sm:grid-cols-[7rem_1fr_3.5rem] sm:gap-3"
                >
                  <span
                    className="truncate text-[11px] text-ink-dim sm:text-xs"
                    title={monitor.name}
                  >
                    {monitor.name}
                  </span>
                  <UptimeBars daily={monitor.daily} days={45} />
                  <span className="text-right font-mono text-[10px] text-ink-dim sm:text-[11px]">
                    {formatUptime(monitor.uptime.quarter ?? monitor.uptime.day)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 border-t border-edge/70 pt-4">
              <StatusLegend />
            </div>
          </div>

          <div>
            <h2 className="text-sm font-medium tracking-wide text-ink">Recent incidents</h2>
            <p className="mb-4 mt-0.5 text-xs text-ink-faint">
              Outages and degradations recorded for these services
            </p>
            <IncidentFeed incidents={snapshot.incidents} names={names} />
          </div>
        </section>
      </div>

      <SiteFooter contact={contact} siteName={snapshot.site.name} />
    </main>
  );
}
