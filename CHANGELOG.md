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
- Add optional per-session terminal preferences (font size 8–32, scrollback
  100–100000, cursor blink). Serialization stays camelCase inside the field,
  omits unset values for legacy compatibility, and rejects unknown fields.
- Cover preferences with native bounds, serde/legacy-JSON and store
  round-trip/export/import tests plus frontend parser/resolver tests.
- Resume interrupted SFTP downloads: retain a hidden mode-0600 part file, verify
  its SHA-256 prefix against the remote file before appending, discard it on
  cancellation or mismatch, and drive it from the transfer retry action. SCP and
  uploads still restart from the beginning. Covered by a real-SFTP fixture test
  that resumes a verified prefix and rejects corrupt, complete and symlinked parts.
- Accessibility: axe-core over headless Chrome now reports **0 violations** for
  the default Operations Deck and the Settings, Help, Credential vault, Snippets
  and Quick connect dialogs. Raised muted-text contrast, fixed heading order,
  replaced the nested `aside` with a labelled `section`, and moved dialog roles
  off `<form>` elements.
- Report the local machine name and architecture from the native `app_snapshot`
  (`This Linux host`/`This PC`/`This Mac` plus x64/ARM64/Apple Silicon/Intel)
  instead of always claiming "This Mac / Apple Silicon". Covered by a frontend
  unit test.
- Fix `package-check` for Linux/Windows by verifying only the final regular
  installer files: intermediate AppImage `.AppDir` staging symlinks are ignored
  and symlinked installer inputs are refused. Final deliverables are copied and
  checksummed in `target/debug/verified-installers`.

These changes are development work, not a stable release. Platform runtime,
installer, signing and independent security acceptance remain separate gates.
Existing released versions are documented in `docs/release/`.
