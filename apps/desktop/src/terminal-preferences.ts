export const DEFAULT_TERMINAL_FONT_FAMILY = '"Cascadia Mono", "Cascadia Code", Consolas, "SFMono-Regular", "JetBrains Mono", "Courier New", monospace';
export const DEFAULT_TERMINAL_FONT_SIZE = 13;
/** Tenths of a pixel. */
export const DEFAULT_TERMINAL_LETTER_SPACING = 5;
/** Percentage of the font size (120 = 1.20). */
export const DEFAULT_TERMINAL_LINE_HEIGHT = 120;

export type TerminalAppearance = {
  fontFamily: string;
  fontSize: number;
  /** Tenths of a pixel; 5 = 0.5px. */
  letterSpacing: number;
  /** Percentage; 120 = 1.20. */
  lineHeight: number;
};

export type TerminalPreferences = TerminalAppearance & {
  scrollbackLines: number;
  cursorBlink: boolean;
};

/** Saved profiles may predate typography fields; missing fields inherit global. */
export type SessionTerminalPreferences = Pick<TerminalPreferences, "fontSize" | "scrollbackLines" | "cursorBlink"> & Partial<Pick<TerminalPreferences, "fontFamily" | "letterSpacing" | "lineHeight">>;

export function parseFontFamily(value: string): string {
  const family = value.trim();
  if (!family || family.length > 200 || [...family].some((character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127 || ";{}()\\".includes(character))) {
    throw new Error("Terminal font family must be 1–200 characters without control characters, semicolons, braces, parentheses, or backslashes.");
  }
  return family;
}

export function parseTerminalAppearance(fontFamily: string, fontSize: string, letterSpacing: string, lineHeight: string): TerminalAppearance {
  const font = Number(fontSize);
  if (!Number.isInteger(font) || font < 8 || font > 32) {
    throw new Error("Terminal font size must be 8–32 whole pixels.");
  }
  const spacing = Number(letterSpacing);
  const spacingTenths = Math.round(spacing * 10);
  if (!Number.isFinite(spacing) || spacingTenths < 0 || spacingTenths > 50 || Math.abs(spacing * 10 - spacingTenths) > 1e-9) {
    throw new Error("Terminal letter spacing must be 0–5 pixels in 0.1px steps.");
  }
  const height = Number(lineHeight);
  const heightPercent = Math.round(height * 100);
  if (!Number.isFinite(height) || heightPercent < 100 || heightPercent > 200 || Math.abs(height * 100 - heightPercent) > 1e-9) {
    throw new Error("Terminal line height must be 1.00–2.00 in 0.01 steps.");
  }
  return {
    fontFamily: parseFontFamily(fontFamily),
    fontSize: font,
    letterSpacing: spacingTenths,
    lineHeight: heightPercent,
  };
}

export function parseTerminalPreferences(
  fontSize: string,
  scrollbackLines: string,
  cursorBlink: boolean,
  fontFamily = DEFAULT_TERMINAL_FONT_FAMILY,
  letterSpacing = "0.5",
  lineHeight = "1.2",
): TerminalPreferences {
  const appearance = parseTerminalAppearance(fontFamily, fontSize, letterSpacing, lineHeight);
  const scrollback = Number(scrollbackLines);
  if (!Number.isInteger(scrollback) || scrollback < 100 || scrollback > 100_000) {
    throw new Error("Terminal scrollback must be 100–100000 whole lines.");
  }
  return { ...appearance, scrollbackLines: scrollback, cursorBlink };
}

export function resolveTerminalPreferences(defaults: TerminalPreferences, profile?: SessionTerminalPreferences | null): TerminalPreferences {
  return {
    fontFamily: profile?.fontFamily?.trim() || defaults.fontFamily,
    fontSize: profile?.fontSize ?? defaults.fontSize,
    letterSpacing: profile?.letterSpacing ?? defaults.letterSpacing,
    lineHeight: profile?.lineHeight ?? defaults.lineHeight,
    scrollbackLines: profile?.scrollbackLines ?? defaults.scrollbackLines,
    cursorBlink: profile?.cursorBlink ?? defaults.cursorBlink,
  };
}

/** Convert persisted tenths/percent to the units xterm.js expects. */
export function terminalXtermOptions(appearance: TerminalAppearance) {
  return {
    fontFamily: appearance.fontFamily,
    fontSize: appearance.fontSize,
    letterSpacing: appearance.letterSpacing / 10,
    lineHeight: appearance.lineHeight / 100,
    fontWeight: "400" as const,
    fontWeightBold: "700" as const,
  };
}
