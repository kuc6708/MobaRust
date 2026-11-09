import assert from 'node:assert/strict';
import { describeLocalMachine } from '../src/local-machine.ts';

assert.deepEqual(describeLocalMachine('linux', 'x86_64'), { name: 'This Linux host', detail: 'x64 · local' });
assert.deepEqual(describeLocalMachine('linux', 'aarch64'), { name: 'This Linux host', detail: 'ARM64 · local' });
assert.deepEqual(describeLocalMachine('macos', 'aarch64'), { name: 'This Mac', detail: 'Apple Silicon · local' });
assert.deepEqual(describeLocalMachine('macos', 'x86_64'), { name: 'This Mac', detail: 'Intel · local' });
assert.deepEqual(describeLocalMachine('windows', 'x86_64'), { name: 'This PC', detail: 'x64 · local' });
assert.deepEqual(describeLocalMachine('windows', 'aarch64'), { name: 'This PC', detail: 'ARM64 · local' });
assert.deepEqual(describeLocalMachine('freebsd', 'riscv64'), { name: 'This Linux host', detail: 'Local · local' });
assert.deepEqual(describeLocalMachine('linux', 'arm'), { name: 'This Linux host', detail: 'ARM · local' });
