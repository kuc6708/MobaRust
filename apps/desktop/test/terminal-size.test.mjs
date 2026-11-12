import assert from "node:assert/strict";
import {
  clampSidebarWidth,
  clampTerminalSize,
  shouldSendTerminalResize,
  terminalSizeFromLayout,
} from "../src/terminal-size.ts";

assert.deepEqual(clampTerminalSize(74, 20), { cols: 74, rows: 20 });
assert.deepEqual(clampTerminalSize(0, -3), { cols: 1, rows: 1 });
assert.deepEqual(clampTerminalSize(Number.NaN, 24), { cols: 1, rows: 24 });
assert.deepEqual(clampTerminalSize(5000, 5000), { cols: 1000, rows: 1000 });

const sizes = new Map([
  ["local", { cols: 74, rows: 20 }],
  ["ssh", { cols: 90, rows: 30 }],
]);
const pane = (terminalId) => ({ kind: "pane", terminalId });

// Actual viewport wins; 80x24 is never invented for a smaller pane.
assert.deepEqual(terminalSizeFromLayout(pane("local"), sizes), { cols: 74, rows: 20 });
assert.equal(terminalSizeFromLayout(pane("missing"), sizes), null);

assert.deepEqual(
  terminalSizeFromLayout({ kind: "split", direction: "right", first: pane("local"), second: pane("ssh") }, sizes),
  { cols: 165, rows: 30 },
);
assert.deepEqual(
  terminalSizeFromLayout({ kind: "split", direction: "down", first: pane("local"), second: pane("ssh") }, sizes),
  { cols: 90, rows: 51 },
);
assert.equal(
  terminalSizeFromLayout(
    { kind: "split", direction: "right", first: pane("missing"), second: pane("ssh") },
    sizes,
  ),
  null,
);

assert.equal(shouldSendTerminalResize(null, { cols: 74, rows: 20 }), true);
assert.equal(shouldSendTerminalResize({ cols: 74, rows: 20 }, { cols: 74, rows: 20 }), false);
assert.equal(shouldSendTerminalResize({ cols: 74, rows: 20 }, { cols: 75, rows: 20 }), true);
assert.equal(shouldSendTerminalResize({ cols: 74, rows: 20 }, { cols: 74, rows: 21 }), true);

assert.equal(clampSidebarWidth(247), 247);
assert.equal(clampSidebarWidth(10), 190);
assert.equal(clampSidebarWidth(1000), 380);
assert.equal(clampSidebarWidth(Number.NaN), 247);

