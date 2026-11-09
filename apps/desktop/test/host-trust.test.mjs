import console from 'node:console';
import assert from 'node:assert/strict';
import { reviewUnknownHostTrust } from '../src/host-trust.ts';

const observed = { host: 'fixture.test', port: 2222, algorithm: 'ssh-ed25519', fingerprint: 'SHA256:fixture', publicKey: 'fixture-public-key' };
for (const path of [null, '', '  ']) {
  assert.equal(await reviewUnknownHostTrust(observed, {
    choosePath: async () => path,
    confirm: async () => assert.fail('cancel must not show trust confirmation'),
    persist: async () => assert.fail('cancel must not write trust'),
  }), null);
}
assert.equal(await reviewUnknownHostTrust(observed, {
  choosePath: async () => '/fixture/known_hosts', confirm: async () => false,
  persist: async () => assert.fail('declining trust must not write'),
}), null);
const snapshot = { ...observed };
let writes = 0;
assert.equal(await reviewUnknownHostTrust(snapshot, {
  choosePath: async () => { snapshot.host = 'other.test'; return '/fixture/known_hosts'; },
  confirm: async (message) => {
    assert.ok(message.includes('fixture.test:2222'));
    assert.ok(message.includes('ssh-ed25519'));
    assert.ok(message.includes('SHA256:fixture'));
    assert.ok(!message.includes('other.test'));
    return true;
  },
  persist: async (request) => {
    writes++;
    assert.deepEqual(request, { host: observed.host, port: observed.port, publicKey: observed.publicKey, confirmedFingerprint: observed.fingerprint, knownHostsPath: '/fixture/known_hosts' });
  },
}), '/fixture/known_hosts');
assert.equal(writes, 1);
console.log('Host trust: cancellation, explicit confirmation, complete identity and immutable target passed');
