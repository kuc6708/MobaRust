# SSH host trust

Connections require an explicit known_hosts file or SHA256 pin. Leaving both
unset rejects the key. There is no accept-any authenticated connection policy.

For an unknown host, use Network Diagnostics → Inspect SSH key. The result
shows the endpoint, algorithm and SHA256 fingerprint without authenticating.
Compare that fingerprint with the administrator through an independent channel.
Only then select Review and trust unknown key and choose an absolute trust-file
path. The directory must already exist. Confirmation appends the observed public
key; inspection alone never writes trust. Select that same known_hosts file in
the session settings and reconnect. The new handshake verifies it again, so a
key swap after inspection cannot authenticate under the observed trust.

The persistence operation is idempotent. It refuses conflicting records,
revocations, unreadable files, non-regular files, symlink destinations, oversized
files and Unix files writable by other users. New Unix files have mode 0600;
writes are synced. An exclusive sibling `.mobarust-lock` serializes MobaRust
writes. If a crash leaves that lock behind, review the trust file before manually
removing the stale lock. Other tools do not participate in this application lock;
avoid simultaneous edits in OpenSSH and MobaRust.

Changed keys and pin mismatches produce a CHANGED error. Verify the change with
the administrator; this UI never replaces an existing record. Do not copy an
error's fingerprint into trust just to bypass the error.

Known-host lookup supports hashed names, comma-separated hosts, tabs, whitespace,
wildcard/negated hostname patterns and `[host]:port` records. Revocations fail
closed. `@cert-authority` records are not used to establish certificate trust;
SSH CA certificate validation remains unsupported. A host with an existing
different algorithm also requires manual administrator review before adding a
new algorithm through another trusted tool.

Jump hosts require independent trust configuration for every hop. Diagnostic
inspection is a direct connection; inspection through an authenticated bastion
is not yet exposed. Never probe production hosts as part of automated tests.
