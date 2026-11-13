import assert from "node:assert/strict";
import {
  DEFAULT_TERMINAL_FONT_FAMILY,
  parseTerminalPreferences,
  resolveTerminalPreferences,
  terminalXtermOptions,
} from "../src/terminal-preferences.ts";

const defaults = {
  fontFamily: DEFAULT_TERMINAL_FONT_FAMILY,
  fontSize: 13,
  letterSpacing: 5,
  lineHeight: 120,
  scrollbackLines: 5000,
  cursorBlink: true,
};
const profile = parseTerminalPreferences("20", "10000", false);
assert.deepEqual(resolveTerminalPreferences(defaults), defaults);
assert.deepEqual(resolveTerminalPreferences(defaults, profile), profile);
const pane = resolveTerminalPreferences(defaults, profile);
pane.fontSize = 8;
assert.equal(profile.fontSize, 20, "pane settings cannot mutate the saved profile");
assert.equal(defaults.fontSize, 13, "profile settings cannot mutate global defaults");
assert.equal(resolveTerminalPreferences({ ...defaults, fontSize: 16 }).fontSize, 16);
assert.equal(resolveTerminalPreferences({ ...defaults, fontSize: 16 }, profile).fontSize, 20);

// Older saved profiles inherit global typography for fields they do not have.
const inherited = resolveTerminalPreferences(defaults, {
  fontSize: 18,
  scrollbackLines: 2000,
  cursorBlink: false,
});
assert.equal(inherited.fontFamily, defaults.fontFamily);
assert.equal(inherited.letterSpacing, defaults.letterSpacing);
assert.equal(inherited.lineHeight, defaults.lineHeight);
assert.equal(inherited.fontSize, 18);

for (const [font, scrollback] of [["7", "5000"], ["33", "5000"], ["13.5", "5000"], ["NaN", "5000"], ["13", "99"], ["13", "100001"], ["13", "Infinity"]]) {
  assert.throws(() => parseTerminalPreferences(font, scrollback, true));
}
assert.equal(parseTerminalPreferences("8", "100", true).fontSize, 8);
assert.equal(parseTerminalPreferences("32", "100000", false).scrollbackLines, 100000);

for (const spacing of ["-0.1", "5.1", "0.55", "NaN"]) {
  assert.throws(() =>
    parseTerminalPreferences("13", "5000", true, DEFAULT_TERMINAL_FONT_FAMILY, spacing, "1.2"),
  );
}
for (const height of ["0.99", "2.01", "1.205", "NaN"]) {
  assert.throws(() =>
    parseTerminalPreferences("13", "5000", true, DEFAULT_TERMINAL_FONT_FAMILY, "0.5", height),
  );
}
for (const family of ["", "  ", "Bad;Font", "A\\B", "A{B}", "A(B)", "x".repeat(201)]) {
  assert.throws(() => parseTerminalPreferences("13", "5000", true, family, "0.5", "1.2"));
}
assert.equal(
  parseTerminalPreferences("13", "5000", true, '"Noto Sans Mono", "等宽", monospace', "0", "2.0").fontFamily,
  '"Noto Sans Mono", "等宽", monospace',
);

const appearance = parseTerminalPreferences("14", "5000", true, "Consolas, monospace", "0.8", "1.25");
assert.deepEqual(terminalXtermOptions(appearance), {
  fontFamily: "Consolas, monospace",
  fontSize: 14,
  letterSpacing: 0.8,
  lineHeight: 1.25,
  fontWeight: "400",
  fontWeightBold: "700",
});
