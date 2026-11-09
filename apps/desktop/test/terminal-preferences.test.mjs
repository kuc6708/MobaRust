import assert from 'node:assert/strict';
import { parseTerminalPreferences, resolveTerminalPreferences } from '../src/terminal-preferences.ts';

const defaults = { fontSize: 13, scrollbackLines: 5000, cursorBlink: true };
const profile = parseTerminalPreferences('20', '10000', false);
assert.deepEqual(resolveTerminalPreferences(defaults), defaults);
assert.deepEqual(resolveTerminalPreferences(defaults, profile), profile);
const pane = resolveTerminalPreferences(defaults, profile);
pane.fontSize = 8;
assert.equal(profile.fontSize, 20, 'pane settings cannot mutate the saved profile');
assert.equal(defaults.fontSize, 13, 'profile settings cannot mutate global defaults');
assert.equal(resolveTerminalPreferences({ ...defaults, fontSize: 16 }).fontSize, 16);
assert.equal(resolveTerminalPreferences({ ...defaults, fontSize: 16 }, profile).fontSize, 20);
for (const [font, scrollback] of [['7', '5000'], ['33', '5000'], ['13.5', '5000'], ['NaN', '5000'], ['13', '99'], ['13', '100001'], ['13', 'Infinity']]) {
  assert.throws(() => parseTerminalPreferences(font, scrollback, true));
}
assert.equal(parseTerminalPreferences('8', '100', true).fontSize, 8);
assert.equal(parseTerminalPreferences('32', '100000', false).scrollbackLines, 100000);
