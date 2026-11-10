import console from 'node:console';
import assert from 'node:assert/strict';
import { localShellDisplayName } from '../src/shell-label.ts';

assert.equal(localShellDisplayName({ type: 'default' }, 'Win32'), 'cmd.exe');
assert.equal(localShellDisplayName({ type: 'default' }, 'Linux x86_64'), 'local shell');
assert.equal(localShellDisplayName({ type: 'default', shell: 'cmd' }, 'Win32'), 'cmd.exe');
assert.equal(localShellDisplayName({ type: 'default', shell: 'powershell' }, 'Win32'), 'PowerShell');
assert.equal(localShellDisplayName({ type: 'default', shell: 'zsh' }, 'Linux x86_64'), 'zsh');
assert.equal(localShellDisplayName({ type: 'default', shell: 'fish' }, 'Linux x86_64'), 'fish');
assert.equal(localShellDisplayName({ type: 'wsl', distribution: 'Ubuntu' }, 'Win32'), 'WSL · Ubuntu');
console.log('Shell labels: Windows default is cmd.exe and explicit shells are preserved');
