export type TerminalSize = { cols: number; rows: number };

export type TerminalSizeLayout =
  | { kind: "pane"; terminalId: string }
  | { kind: "split"; direction: "right" | "down"; first: TerminalSizeLayout; second: TerminalSizeLayout };

/** Keep PTY geometry finite and usable without silently increasing it. */
export function clampTerminalSize(cols: number, rows: number): TerminalSize {
  const normalize = (value: number) => Number.isFinite(value) ? Math.min(1000, Math.max(1, Math.floor(value))) : 1;
  return { cols: normalize(cols), rows: normalize(rows) };
}

/**
 * The dimensions a new single-pane terminal will receive. Split panes are
 * combined because opening a saved SSH profile replaces the split with one pane.
 * A missing measurement returns null so the caller can wait instead of guessing
 * 80x24 or reusing an unrelated pane.
 */
export function terminalSizeFromLayout(
  layout: TerminalSizeLayout,
  sizes: ReadonlyMap<string, TerminalSize>,
): TerminalSize | null {
  if (layout.kind === "pane") {
    const size = sizes.get(layout.terminalId);
    return size ? clampTerminalSize(size.cols, size.rows) : null;
  }
  const first = terminalSizeFromLayout(layout.first, sizes);
  const second = terminalSizeFromLayout(layout.second, sizes);
  if (!first || !second) return null;
  return layout.direction === "right"
    ? clampTerminalSize(first.cols + second.cols + 1, Math.max(first.rows, second.rows))
    : clampTerminalSize(Math.max(first.cols, second.cols), first.rows + second.rows + 1);
}

/** Avoid duplicate ssh_resize IPC while still sending the first valid size. */
export function shouldSendTerminalResize(previous: TerminalSize | null, next: TerminalSize): boolean {
  return !previous || previous.cols !== next.cols || previous.rows !== next.rows;
}

export function clampSidebarWidth(width: number): number {
  if (!Number.isFinite(width)) return 247;
  return Math.min(380, Math.max(190, Math.round(width)));
}
