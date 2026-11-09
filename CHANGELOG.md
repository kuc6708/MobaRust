# Changelog

## Unreleased — production readiness work

- Distinguish changed known-host keys and pinned-fingerprint mismatches from
  unknown keys. Never replace existing trust through the unknown-key flow.
- Add explicit host-key trust review to Network Diagnostics, including host,
  port, algorithm, SHA256 fingerprint and operator-selected trust file.
- Parse OpenSSH tabs, repeated whitespace, hostname patterns and negations;
  reject revoked host records and propagate trust-file read failures.
- Import user-selected MobaXterm SSH text bookmarks without credentials or
  network activity. Preserve folders, endpoints, key references and bastions;
  report unsupported fields and credential aliases requiring review.
- Add Windows/Linux ARM64 build recipes and artifact checksum tests. Restore
  push/PR validation and gate draft prereleases on checks and dependency audits.
- Make Unix PTY input cancellable and prevent dependency-owned final EOF writes
  from hanging terminal cleanup after a non-reading child exits.
- Isolate SSH fixture shells from personal startup files and use valid X11 setup
  packets in the synthetic forwarding test.
- Patch Rust cryptographic timing/Tokio dependencies and frontend advisories;
  retain unsuppressed upstream dependency warnings as release blockers.

These changes are development work, not a stable release. Platform runtime,
installer, signing and independent security acceptance remain separate gates.
Existing released versions are documented in `docs/release/`.
