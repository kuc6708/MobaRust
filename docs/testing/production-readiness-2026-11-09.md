# Production readiness development cycle — 2026-11-09

This branch is development work. It is not a stable release or a claim of
cross-platform runtime acceptance. Final command results are recorded below.

## Repository and architecture

The existing repository is `https://github.com/OthmaneBlial/MobaRust`, cloned
from main at `3da2389`. Work is on `rea/production-readiness-2026-11-09`.
The connected GitHub account has pull permission but no push, maintain or admin
permission. No new repository was created and no remote branch was changed.
The installed 0.1.12 app and private imported sessions/keys are preserved outside
the source checkout, with a private backup before development.

Source version is 0.1.31. The workspace contains core, SSH, session store, vault,
network, serial, Telnet and remote-desktop crates, the Tauri desktop process,
benchmarks and xtask. RDP and VNC helpers have isolated manifests/lockfiles.
The desktop uses Tauri 2.12.1, React 19, Vite 7, TypeScript, xterm.js 5.5,
portable-pty 0.9 and Tokio. SSH/SFTP use the existing locally patched russh
0.63.3 and russh-sftp 2.4.0. Credential storage uses keyring or an explicit
Argon2/AES-GCM portable vault. No working component was replaced.

The public open-issue query returned one thank-you issue. Repository design
records, roadmap, security documents, release receipts and test sources expose
more concrete limitations than that issue list. Existing screenshots and
Operations Deck layout are retained.

## Feature audit

| Area | Source status | Limits that remain |
| --- | --- | --- |
| Local shells, PTY input/output/resize, UTF-8 | Implemented; Unix cleanup corrected | Native Windows/macOS acceptance needs runners/hardware |
| SSH password, challenges/OTP, keys, encrypted keys, agents | Implemented with isolated packet/OpenSSH tests | RSA private keys remain disabled under the existing advisory policy |
| Tabs, splits, search, copy/paste | Implemented in existing UI | Full visual/keyboard/accessibility acceptance not established here |
| Keepalives, bounded reconnect, bastions | Implemented and fixture-tested | Bastion trust is configured independently for every hop |
| Forwarding | Local, remote, SOCKS5 implemented | Native broader-platform acceptance remains separate |
| SSH compression | Existing flate2 transport support | No per-session compression selector/benchmark added |
| Host trust | Unknown/changed distinction and explicit persistence added | Direct inspection only; no SSH CA trust or automatic key replacement |
| SFTP/SCP | Browser, recursive copy, progress/cancel, metadata/mutations implemented; drag/drop upload wired with path normalization tests; resumable SFTP downloads | Resume keeps a hidden 0600 part, verifies its SHA-256 prefix against the remote before appending, and discards on cancel/mismatch; SCP and uploads restart. Covered by the real-SFTP fixture test `resumes_a_verified_sftp_download_prefix_and_rejects_unusable_parts`. |
| MobaXterm migration | Text SSH bookmarks added | No saved passwords, host trust, WSL shortcuts, macros, appearance or standalone tunnel import |
| Session management | Folders, favorites, recents, search, editing, JSON backup/export; optional per-session font size (8–32), scrollback (100–100000) and cursor-blink preferences | Installed 0.1.12 cannot read populated preference fields; native GUI acceptance pending |
| Vault | Native keyring and encrypted portable vault exist | Native keychain acceptance not exercised with personal secrets |
| UI | Existing themes, command palette, statuses, native menus retained; local machine name/architecture now derived from the native snapshot; axe-core clean across 7 views and 9 dialogs with focus trapped inside dialogs | Remaining dialogs (session editor, tunnel/WSL, remote editor), high-DPI and screen-reader acceptance still need review |
| X11 | Synthetic setup forwarding fixture passes (sshd now uses `AddressFamily inet`) | Real Xvfb acceptance still requires a safe sticky Unix socket directory |
| RDP/VNC | Existing helper boundaries and tests retained | RDP excluded from shipping; independent security/interoperability gates remain |

## Security and redistribution

The project is Apache-2.0. Both modified vendor components declare Apache-2.0
and retain their patch records. The [Linux Rust inventory](../legal/linux-x64-rust-dependencies.md)
covers 497 packages at the selected target. The missing xtask declaration was
corrected to inherit the workspace license. Reviewed declared licenses provide
permissive alternatives or MPL-2.0 terms; the dual MIT/GPL crate can use MIT.
MPL source availability, complete third-party license texts, JavaScript notices,
system WebKit/GTK library obligations and other-target graphs still require
artifact-specific review. The inventory is not blanket redistribution approval.

Initial frontend audit reported 13 findings (six high). Compatible dependency
updates and a targeted patched minimatch override reduce the final registry
report to zero. Type/lint/unit/build checks must pass after those updates.

The initial refreshed Rust audit found RUSTSEC-2026-0387 (crypto-bigint) and
RUSTSEC-2026-0385 (ctutils), plus the Tokio unsoundness warning and yanked crates.
Updates to crypto-bigint 0.7.11, ctutils 0.4.8, Tokio 1.54.1 and async-executor
1.14.1 remove those findings. The complete final workspace audit reports zero
vulnerabilities and no yanked packages, retaining these unsuppressed warnings:

- glib 0.18.5: RUSTSEC-2024-0429, unsoundness; a GTK/Tauri dependency-chain
  upgrade needs upstream compatibility work, not an unchecked override.
- proc-macro-error 1.0.4, zbus_names 4.3.4, zvariant 5.15.0 and zvariant_derive
  5.15.0: unmaintained dependency warnings.

The advisory database receipt is `d9cb059f3217db87aeccd190b81eaffe8cc29cb9`
(1,430 advisories). `cargo audit --deny warnings` intentionally blocks release
on these warnings. No ignore rules were added. Complete separate audits of the updated VNC and fuzz lockfiles report zero
vulnerabilities or warnings, including yanked-package checks. The isolated RDP
graph was reduced from ten vulnerabilities to the existing RSA advisory
RUSTSEC-2023-0071, plus three unmaintained warnings (atomic-polyfill, pin-utils,
rustls-pemfile). RDP remains excluded from all normal packages.

The source review included secret-bearing debug/log boundaries, renderer HTML
escaping, native command construction, unsafe platform FFI, imported startup
commands, host trust and transfer path guards. It is not an independent security
assessment. New import code allowlists fields and omits startup commands and
credential sections. Host trust is append-only and never accepts changed keys.

## Validation receipt

Final local validation completed on this Linux x64 host (see below). Earlier
failed runs drove the PTY cleanup, fixture-isolation, synthetic-X11 and trust
corrections; they are not counted as passes. Platform runtime acceptance,
signing and clean-install testing remain separate gates.

### Development validation (current Linux x64 host)

- `cargo test -p mobarust-core -p mobarust-store`: core 30 + 4 and store 46 + 4
  passed (including the new terminal-preference bounds/serde/legacy/store tests).
- `cargo check --workspace`: passed after `cargo xtask stage-helpers`.
- `cargo clippy --locked --workspace --all-targets -- -D warnings`: passed.
- Frontend: `pnpm check`, `pnpm lint`, `pnpm test:unit`, `pnpm build`: passed.
- `cargo test -p xtask`: 21 passed; `node --test tools/release-assets.test.mjs`:
  9 passed (including AppDir-symlink and symlinked-installer regressions).
- `APPIMAGE_EXTRACT_AND_RUN=1 cargo xtask package-check`: exit 0.
- `cargo xtask check-vnc-helper`, `check-rdp-helper` and `check-fuzz`: passed
  (format/tests/clippy for the isolated workspaces).
- `cargo xtask package-layout-check`: verified unsigned runtime package layouts
  for macOS, Windows and Linux.
- `cargo test -p mobarust` 117 passed; `cargo test -p mobarust-ssh --lib` 48 passed;
  the end-to-end `local_sshd` resume test passes (verified prefix append, corrupt/complete
  part rejection, symlink refusal, offset download).
- Accessibility (headless Chrome + axe-core 4.10.2 over CDP): **0 violations**
  across the Terminal, Files, Tunnels, Diagnostics, Transfers and Audit views and
  the Command palette, Macros, Broadcast, Settings, Help, Credential vault,
  Snippets, Quick connect and WSL dialogs. Focus moves inside every dialog and
  Tab/Shift+Tab wraps within it (`useDialogAutoFocus`, applied to all dialogs).
  Fixes included brighter `--faint` and macro-note text (contrast), InfoCard and
  diagnostics headings `h3`→`h2` (heading order), right rail `aside`→labelled
  `section`, and dialog roles moved from `<form>` onto the overlay. Static DOM
  checks showed 0 missing accessible names/`alt`, 0 unnamed dialogs and 0
  duplicate ids. The session editor, tunnel and remote-editor dialogs need an
  SSH/session context to open; high-DPI and screen-reader acceptance remain.
- `cargo xtask check` and `cargo xtask check-rust` under `umask 022`: **exit 0**
  (formatting, full workspace tests, Clippy, frontend install/test/check/lint/
  build, release-asset tests, RDP/VNC helper checks, package layouts and fuzz).
  The OpenSSH `local_sshd` fixture passes 26 tests (1 ignored) after adding
  `AddressFamily inet` to the fixture sshd config: the host's default
  address-family selection could not allocate the X11 display socket (ports
  6010-6012 were occupied). The host default umask 0002 makes the trust fixture
  group-writable, which the new trust guard correctly refuses; `umask 022` is
  used for the gate.

### Packaging validation (Linux x64)

The checksum-scope defect is fixed: only the final regular installer files are
copied to `target/debug/verified-installers/` and hashed into
`SHA256SUMS.txt`; intermediate AppImage `.AppDir` symlinks are ignored and
symlinked installer inputs are refused. Unsigned development packages assembled:

- `target/debug/bundle/deb/MobaRust_0.1.31_amd64.deb` (~82.33 MiB)
- `target/debug/bundle/rpm/MobaRust-0.1.31-1.x86_64.rpm` (~82.33 MiB)
- `target/debug/bundle/appimage/MobaRust_0.1.31_amd64.AppImage` (~147.84 MiB)

The `--version` startup benchmark passed. These packages are unsigned
development artifacts; they were not installed over the user's app and GUI
native-window behavior remains untested here.

### Not yet run on this host

Remaining accessibility review (session editor/tunnel/WSL/remote-editor dialogs,
high-DPI, screen-reader), Windows/macOS runtime runners, clean-install testing,
signing and notarization.

## Release gates

CI recipes cover Windows/Linux x64 and ARM64 and both Mac architectures, using
native hosted runners. Artifact collection tests validate canonical names,
architecture labels, exact counts and SHA256 checksums. Downloads are checked
again before a draft prerelease can be created. Workflow changes have not run
on GitHub from this read-only checkout.

No final release, remote tag, installer upload or production connection was
performed. Owner write access and enabled Actions are required for platform
builds/publication. Signing/notarization require owner-held credentials. Universal Mac packages, production portable archives and broad clean-install/
GUI acceptance remain unvalidated. These are recorded limitations, not shipped
or tested features. Existing installation/CONTRIBUTING/SECURITY documents remain
in place; the changelog, trust documentation and migration instructions cover
this development work.
