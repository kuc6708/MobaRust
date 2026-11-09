export type TerminalPreferences = {
  fontSize: number;
  scrollbackLines: number;
  cursorBlink: boolean;
};

export function parseTerminalPreferences(fontSize: string, scrollbackLines: string, cursorBlink: boolean): TerminalPreferences {
  const font = Number(fontSize);
  const scrollback = Number(scrollbackLines);
  if (!Number.isInteger(font) || font < 8 || font > 32 || !Number.isInteger(scrollback) || scrollback < 100 || scrollback > 100_000) {
    throw new Error("Terminal font size must be 8–32 and scrollback must be 100–100000 whole lines.");
  }
  return { fontSize: font, scrollbackLines: scrollback, cursorBlink };
}

export function resolveTerminalPreferences(defaults: TerminalPreferences, profile?: TerminalPreferences | null): TerminalPreferences {
  return { ...(profile ?? defaults) };
}
