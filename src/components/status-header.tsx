"use client";

import { motion } from "framer-motion";
import { Activity, Github, RefreshCw, TriangleAlert, WifiOff } from "lucide-react";
import { StatusDot } from "./status-dot";
import { cn, formatClock, STATUS_STYLE } from "@/lib/format";
import { repoUrl, type Source } from "@/lib/source";
import type { StatusSnapshot } from "@/lib/types";
import type { Connection } from "@/hooks/use-status";

/**
 * The masthead. The overall state is the hero — one number-sized statement,
 * with the per-status counts as supporting figures rather than a chart.
 */

const OVERALL_HEADLINE: Record<StatusSnapshot["overall"], string> = {
  up: "All systems operational",
  degraded: "Degraded performance",
  down: "Active outage",
  paused: "Monitoring paused",
  pending: "Awaiting first checks",
};

function ConnectionPill({ connection }: { connection: Connection }) {
  if (connection === "offline") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-down/30 bg-down/10 px-2.5 py-1 text-[11px] text-down">
        <WifiOff className="h-3 w-3" />
        <span className="sm:hidden">Offline</span>
        <span className="hidden sm:inline">Cannot reach GitHub</span>
      </span>
    );
  }

  if (connection === "stale") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-degraded/30 bg-degraded/10 px-2.5 py-1 text-[11px] text-degraded">
        <TriangleAlert className="h-3 w-3" />
        Data is behind
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px]",
        connection === "live"
          ? "border-signal/30 bg-signal/10 text-signal"
          : "border-edge bg-abyss text-ink-faint",
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        {connection === "live" && (
          <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-signal" />
        )}
        <span
          className={cn(
            "relative inline-flex h-1.5 w-1.5 rounded-full",
            connection === "live" ? "bg-signal" : "bg-ink-faint",
          )}
        />
      </span>
      {connection === "live" ? "Up to date" : "Loading"}
    </span>
  );
}

export function StatusHeader({
  snapshot,
  connection,
  onRefresh,
  refreshing,
  source,
}: {
  snapshot: StatusSnapshot;
  connection: Connection;
  onRefresh: () => void;
  refreshing: boolean;
  source: Source;
}) {
  const style = STATUS_STYLE[snapshot.overall];

  const figures = [
    { label: "Operational", value: snapshot.counts.up, tone: "text-up" },
    { label: "Degraded", value: snapshot.counts.degraded, tone: "text-degraded" },
    { label: "Down", value: snapshot.counts.down, tone: "text-down" },
    { label: "Paused", value: snapshot.counts.paused, tone: "text-paused" },
  ];

  return (
    <header className="relative">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <Activity className="h-5 w-5 shrink-0 text-signal" />
            <span className="text-sm font-semibold tracking-[0.18em] text-ink uppercase sm:tracking-[0.2em]">
              {snapshot.site.name}
            </span>
          </div>
          {snapshot.site.tagline && (
            <p className="mt-1 pl-[1.875rem] text-xs text-ink-faint">{snapshot.site.tagline}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 pl-[1.875rem] sm:pl-0">
          <ConnectionPill connection={connection} />
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            aria-label={refreshing ? "Refreshing" : "Refresh"}
            className="inline-flex items-center gap-1.5 rounded-full border border-edge bg-abyss px-3 py-1.5 text-[11px] text-ink-dim transition hover:border-signal/40 hover:text-signal disabled:opacity-50 sm:py-1"
          >
            <RefreshCw className={cn("h-3 w-3", refreshing && "animate-spin")} />
            <span className="hidden sm:inline">{refreshing ? "Refreshing…" : "Refresh"}</span>
          </button>
          <a
            href={repoUrl(source)}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="Source data on GitHub"
            className="inline-flex items-center gap-1.5 rounded-full border border-edge bg-abyss px-3 py-1.5 text-[11px] text-ink-dim transition hover:border-signal/40 hover:text-signal sm:py-1"
          >
            <Github className="h-3 w-3" />
            <span className="hidden sm:inline">Source data</span>
          </a>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="glass bevel relative mt-5 overflow-hidden rounded-2xl border border-edge p-5 sm:mt-6 sm:rounded-3xl sm:p-8"
      >
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px overflow-hidden">
          <div className="animate-sweep h-px w-1/3 bg-gradient-to-r from-transparent via-signal to-transparent" />
        </div>

        <div className="flex flex-col gap-6 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-8">
          <div className="min-w-0">
            <div className="flex items-start gap-3 sm:items-center">
              <StatusDot status={snapshot.overall} size="lg" />
              <h1
                className={cn(
                  "text-xl font-semibold tracking-tight sm:text-2xl md:text-3xl",
                  style.text,
                  style.glow,
                )}
              >
                {OVERALL_HEADLINE[snapshot.overall]}
              </h1>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-ink-dim sm:text-sm">
              Monitoring {snapshot.monitors.length} endpoint
              {snapshot.monitors.length === 1 ? "" : "s"} · last check{" "}
              <span className="font-mono">{formatClock(snapshot.generatedAt)}</span>
            </p>
          </div>

          <dl className="grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto sm:gap-8">
            {figures.map((figure) => (
              <div
                key={figure.label}
                className="rounded-xl border border-edge/60 bg-abyss/40 px-3 py-2.5 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0"
              >
                <dd
                  className={cn(
                    "font-mono text-xl sm:text-2xl",
                    figure.value > 0 ? figure.tone : "text-ink-faint",
                  )}
                >
                  {figure.value}
                </dd>
                <dt className="mt-0.5 text-[10px] uppercase tracking-wider text-ink-faint">
                  {figure.label}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </motion.div>
    </header>
  );
}
