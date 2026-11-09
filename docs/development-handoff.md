# Development handoff — WIP

Branch: `rea/production-readiness-2026-11-09`.
This branch is a development snapshot, not a stable release. Do not interpret
the package version 0.1.31 as an upstream release containing these changes.

Completed commits harden SSH trust, fix Unix terminal cleanup, isolate SSH test
shells, and add explicit host-trust review and MobaXterm text bookmark import.
The full sanitized check passed before the latest terminal-preference work.
Security audits retain five main-workspace warnings and the excluded RDP RSA
advisory. No stable release should be published by bypassing those gates.

## Resume here

1. Finish per-session terminal preferences. Core/store library tests passed
   (30/46), but the new frontend propagation, editor controls, live resize and
   pane-specific zoom need type/lint/unit/build and full workspace checks.
   Add native preference bounds/roundtrip/import tests before calling it complete.
2. Fix local package verification to hash final regular installer files rather
   than intermediate AppDir trees. Linux DEB, RPM and AppImage assembled, but
   checksum traversal rejects the legitimate intermediate `.DirIcon` symlink.
   Preserve strict symlink rejection for actual installer inputs.
3. Run `cargo xtask check`, then `cargo xtask pre-push-check`. Real Xvfb and
   manual native acceptance skips must remain visible; compilation and CLI
   startup are not GUI or clean-install acceptance.
4. Finish the validation receipt in
   [the readiness report](testing/production-readiness-2026-11-09.md); its pending
   receipt and per-session-preference status are not yet final.
5. Continue remaining scoped functionality, cross-platform runtime validation,
   redistribution review and signing requirements. Publish only after gates pass.

Use generated loopback fixtures and isolated runtime homes. Never use personal
profiles/keys or production servers as test fixtures. Existing RSA private keys
remain unsupported by current source under the upstream security policy.

Build products, package caches, node_modules and private configuration are not
tracked. GitHub should contain source, tests and documentation only. The local
working directory can be much larger than its Git history because Rust debug
and helper builds occupy many gigabytes.
