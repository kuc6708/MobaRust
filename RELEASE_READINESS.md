# Release readiness — MobaRust 0.1.33-rc.1 test build

## Latest: SSH trust-fix test build (0.1.33-rc.1)

- Commit `4a0b2b0`; local tag `v0.1.33-rc.1` (not pushed); no release published.
- Fixes the Windows trust workflow: defaults to the user's OpenSSH known_hosts,
  adds an explicit in-warning **Review & trust host key…** action, keeps
  unknown/changed keys fail-closed, persists trust across restarts, reports
  handshake errors distinctly, and corrects local shell labels (`cmd.exe`).
- Verification: local SSH library 50, desktop 118, authentication 16,
  local-sshd 26; fmt/clippy clean; frontend checks pass.
- Quality CI `42920573667`: all six platforms success (audit gate red by design).
- Release CI `42920592534`: all six builds success; publish skipped.
- Verified Windows x64 test installer:
  `MobaRust-0.1.33-windows-x64.exe` (6,209,025 bytes),
  SHA-256 `f507e25aa6a2131a0dfc8daea478e5d182127f0400278c0f2e86eb58b701e5ba`.
  Unsigned; do not overwrite an existing install without authorization.

The previous 0.1.32-rc.1 section below remains valid for that candidate.

---

# Release readiness — MobaRust 0.1.32-rc.1

**Decision: release candidate prepared and verified; publication HOLD.**
No GitHub release exists and the tag is local only. Stable release is not
approved while the five documented dependency warnings lack an owner decision.

## Repository and branch

- `https://github.com/kuc6708/MobaRust` (fork; Apache-2.0)
- Branch: `rea/production-readiness-2026-11-09`
- Commit: `1049c0d`; base `3da2389`
- Tag: `v0.1.32-rc.1` (local, annotated, **not pushed**)
- `main` on the fork was fast-forwarded to `1049c0d` (fork only; upstream
  untouched) so the Release workflow is registered on the default branch.

## Evidence

| Gate | Result | Reference |
|---|---|---|
| Format / Clippy `-D warnings` | pass | local |
| Workspace tests (umask 022) | pass (31 suites) | local |
| Workspace release build | pass | local |
| Frontend install/test/check/lint/build | pass | local |
| `cargo audit` | 0 vulnerabilities, 5 warnings | local |
| License check | pass | local |
| Release-asset tests | 11/11 | local |
| Quality CI (all 6 platforms) | success | run `42909861636` |
| Release CI (all 6 builds) | success; publish skipped | run `42912570453` |
| Installer checksums | verified per platform | local + CI |

Quality platform jobs: ubuntu-22.04, ubuntu-24.04-arm, windows-latest,
windows-11-arm, macos-15-intel, macos-15 — all pass. Only `dependency-audit`
fails, intentionally.

## Verified artifacts (unsigned, unpublished)

Six platforms, ten files; full sizes and SHA-256 are in
[RELEASE_NOTES.md](RELEASE_NOTES.md) and `SHA256SUMS-all.txt`.

| Platform | Files |
|---|---|
| Windows x64 | NSIS `.exe` |
| Windows ARM64 | NSIS `.exe` |
| Linux x64 | `.deb`, `.rpm`, `.AppImage` |
| Linux ARM64 | `.deb`, `.rpm`, `.AppImage` |
| macOS Intel | `.dmg` |
| macOS ARM64 | `.dmg` |

Preserved in `/home/shood/MobaRust-review/artifacts/release-0.1.32-rc.1/`.
The Linux x64 DEB extracts and reports `MobaRust 0.1.32` (no install performed).

## Blockers to publication

1. **Dependency exceptions (owner decision).** Five unsuppressed warnings remain;
   no exception is granted by the agent. See `DEPENDENCY_EXCEPTIONS.md`.
2. **Owner approval to publish.** The publish job is gated behind
   `workflow_dispatch` with `publish=true` and a tag ref; a tag push alone never
   publishes. The tag is not pushed.
3. **Signing/notarization** credentials are owner-held; current artifacts are
   unsigned.
4. **Upstream write** is still unavailable (fetch fork only); publishing to the
   owner repository needs collaborator write or a bundle handoff.

## Exact owner actions

```bash
# After deciding the dependency exception/upgrade track and approving the RC:
git push origin v0.1.32-rc.1

# Optional: build + create a draft prerelease through the gated workflow
gh workflow run "Release installers" -R kuc6708/MobaRust \
  --ref v0.1.32-rc.1 -f publish=true

# Then publish the draft (or create a release from the verified local artifacts).
```

If the token lacks the workflow scope in a future environment:
`gh auth refresh --hostname github.com --scopes workflow`.

## Release checklist

- [x] Existing application preserved; nothing installed over it
- [x] Local format/clippy/tests/release build/frontend/audit/license
- [x] Quality green on all six hosted platforms (audit gate red by design)
- [x] Release builds green on all six platforms
- [x] Installers + SHA-256 verified
- [ ] Owner dependency-exception decision
- [ ] Owner approval to publish
- [ ] Signing/notarization (optional/owner)
- [ ] Push RC tag and create/publish release
