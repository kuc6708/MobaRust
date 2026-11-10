# Dependency warnings and exception request

Policy: warnings are **not** suppressed and audit rules are **not** modified.
The release gate remains `cargo audit --deny warnings`, which is currently red.
This document records the investigation and requests an owner decision.

## Audit snapshot

- Command: `cargo audit` (RustSec database; current checkout, 2026-11-10)
- Vulnerabilities: **0**
- Yanked packages: **0**
- Warnings: **5** (one unsound, four unmaintained)

## Warning detail and disposition

### 1. `glib 0.18.5` — RUSTSEC-2024-0429 (unsound)

- **Issue**: unsound `Iterator`/`DoubleEndedIterator` impls for
  `glib::VariantStrIter`.
- **Patched**: `>=0.20.0` only.
- **Dependency path**: `tauri 2.12.5` → `tauri-runtime-wry` / `muda` / `tao` →
  `gtk 0.18.2` → `atk`/`glib 0.18.5` (also `glib-macros 0.18.5`).
- **Upstream situation**: gtk-rs `0.19` uses `glib ^0.22`, but **Tauri 2.12.5
  (latest stable) and Tauri 3.0.0-alpha.6 both pin `gtk ^0.18`**. No released
  Tauri depends on a fixed glib.
- **Compatible stable release?** No.
- **Disposition**: **Deferred** — requires an upstream wry/tao/muda/Tauri GTK
  upgrade (or a maintained fork). Out of scope for this phase by owner directive.
- **Regression risk if forced**: high (whole GUI framework).

### 2. `proc-macro-error 1.0.4` — RUSTSEC-2024-0370 (unmaintained)

- **Patched**: none (crate unmaintained).
- **Dependency path**: `glib 0.18.5` → `glib-macros 0.18.5` →
  `proc-macro-error 1.0.4`.
- **Upstream situation**: newer glib-macros (gtk-rs 0.19+) no longer uses
  proc-macro-error, so it clears with the same gtk-rs/Tauri upgrade.
- **Compatible stable release?** Not within gtk 0.18.
- **Disposition**: **Deferred** with the glib/Tauri chain.
- **Regression risk if forced**: build-time proc macro only; the chain upgrade is
  the real risk.

### 3. `zbus_names 4.3.5` — RUSTSEC-2026-0371 (unmaintained)

- **Patched**: none (crate deprecated and merged into zbus 6).
- **Dependency path**: `zbus 5.19.0` → `secret-service 5.1.0` →
  `zbus-secret-service-keyring-store 1.0.1` → `keyring 4.1.6`
  (`mobarust-vault`); and `zbus 5.19.0` → `ashpd 0.11.1` → `rfd 0.15.4`
  (desktop file dialogs).
- **Upstream situation**: `zbus 6.2.1` exists and merges these crates, but
  `keyring 4.2.0` still selects `zbus-secret-service-keyring-store 1.0.1`
  (`zbus ^5`, `secret-service ^5`); `secret-service 6.0.0-rc.1` is a release
  candidate. `rfd 0.18.0` drops `ashpd`/`zbus`, but keyring keeps zbus 5, so no
  warning is cleared by that upgrade alone.
- **Compatible stable release?** No complete stable path today.
- **Disposition**: **Deferred** — replacing keyring is explicitly out of scope
  for this phase; a zbus 6 / secret-service 6 / keyring-5 chain is not stable.
- **Regression risk if forced**: high (credential storage and file dialogs).

### 4. `zvariant 5.15.1` — RUSTSEC-2026-0370 (unmaintained)

- **Patched**: none (merged into zbus 6).
- **Path**: same zbus 5 → secret-service/ashpd path as above.
- **Disposition**: **Deferred** with zbus_names.
- **Regression risk if forced**: high (D-Bus value encoding for credentials and
  portals).

### 5. `zvariant_derive 5.15.1` — RUSTSEC-2026-0372 (unmaintained)

- **Patched**: none (merged into zbus 6).
- **Path**: same as `zvariant`.
- **Disposition**: **Deferred** with zbus_names.
- **Regression risk if forced**: high.

## What was tried / ruled out

- Patch-level bumps: `zbus_names 4.3.4→4.3.5`, `zvariant/zvariant_derive
  5.15.0→5.15.1`, `tauri 2.12.1→2.12.5` — warnings remain (advisories cover the
  crates/chain).
- `rfd 0.18` removes `ashpd` from the dialog path but keyring still pins zbus 5;
  no warning cleared, so not adopted now.
- `cargo update` cannot move gtk to 0.19 or keyring to a zbus-6 store because
  upstream Tauri/keyring releases do not depend on them yet.
- No `[patch]`, vendor override, or audit `ignore` was added.

## Formal exception request (owner decision)

We request the owner choose **one** of the following for a future release:

1. **Authorize the dependency-chain upgrade project** (preferred):
   - gtk-rs/glib 0.19+/0.20+ via a Tauri/wry/tao/muda release that supports it;
   - zbus 6 / secret-service 6 stable / keyring with a maintained store.
   This clears the warnings legitimately and requires re-validation of the GUI,
   credential vault, and file dialogs on all platforms.
2. **Accept a documented exception** for these five warnings for a specific
   release, with an explicit risk statement and a remediation timeline. This
   document is not an exception grant; only the owner can accept it.
3. **Hold the stable release** until upstream releases exist.

No exception is granted by the agent. The strict audit gate remains red.

Owner sign-off (to be completed by the owner):

- [ ] Option 1 — authorize upgrade project (owner: ________, date: ________)
- [ ] Option 2 — accept exception (owner: ________, date: ________,
      remediation by: ________)
- [ ] Option 3 — hold release
