# Release readiness — MobaRust 0.1.31 development snapshot

**Decision: HOLD.** The code and local/hosted checks are green, but a stable
release is blocked by the dependency-exception decision, missing workflow
permissions, signing/notarization, and unbuilt non-Linux packages. No tag or
release has been created.

## Repository and branch

- Repository: `https://github.com/kuc6708/MobaRust` (fork of
  `OthmaneBlial/MobaRust`, Apache-2.0)
- Branch: `rea/production-readiness-2026-11-09`
- Head at report time: `32295e8` (plus the documentation commit added with this
  report)
- Base: `3da2389`; all work is preserved on the branch and in the review bundle.

## Evidence summary

| Gate | Result | Where |
|---|---|---|
| Formatting | pass | local |
| Clippy `-D warnings` (workspace, all targets) | pass | local |
| Workspace tests (umask 022) | pass (31 suites) | local |
| Workspace release build | pass | local |
| Frontend install/test/check/lint/build | pass | local |
| `cargo audit` | 0 vulnerabilities, **5 warnings** | local |
| License check (Apache-2.0) | pass | local |
| Release-asset tooling tests | 9/9 pass | local |
| Linux x64 packages | DEB/RPM/AppImage built + checksums | local |
| Hosted Quality (5 runnable platforms) | pass | CI 42854226245 |
| `dependency-audit` job | **fail by design** | CI |
| macOS arm64 (`macos-15`) | cancelled while queued | CI runner |

### Hosted CI (run `42854226245`, commit `32295e8`)

| Job | Result |
|---|---|
| check (ubuntu-22.04) | success |
| check (ubuntu-24.04-arm) | success |
| check (windows-latest) | success |
| check (windows-11-arm) | success |
| check (macos-15-intel) | success |
| check (macos-15) | cancelled (hosted runner) |
| dependency-audit | failure (5 warnings; release gate) |

## Verified Linux x64 artifacts (unsigned, not published)

| File | Bytes | SHA-256 |
|---|---|---|
| `MobaRust-0.1.31-linux-x64.deb` | ~10.8 MB | `a214f39399d8d8d1a70ac5e90ea0442e7a7881734671347115ae0774a4260bea` |
| `MobaRust-0.1.31-linux-x64.rpm` | ~10.8 MB | `b1af997872709dd2ecb49436e6496793941f7d388b58a8df67de75250dc8405b` |
| `MobaRust-0.1.31-linux-x64.AppImage` | ~89 MB | `59c01c09194b167df067e06f0625951e2a6f13a80653560a3ac21c68055423db` |

Preserved with `SHA256SUMS-linux-x64.txt` in the review package
(`artifacts/linux-x64/`). No Windows, macOS, or Linux ARM64 installers were
produced.

## Blockers to a stable release

1. **Dependency exception/upgrade decision** (owner). 5 unsuppressed warnings;
   the strict audit gate fails. See `DEPENDENCY_EXCEPTIONS.md`. No exception is
   granted here.
2. **GitHub workflow scope.** The token still lacks `workflow` (scopes:
   `gist, read:org, repo`), so the Release workflow cannot be registered on the
   default branch or edited. Exact owner command:
   `gh auth refresh --hostname github.com --scopes workflow`
3. **Upstream write.** `OthmaneBlial/MobaRust` grants `pull` only; no collaborator
   invitation exists. Publishing/PR to the owner repo requires the owner to add
   `kuc6708` with write, or to take the bundle.
4. **Release workflow registration.** `release.yml` exists on the branch but is
   not registered because it is not on the fork's default branch (`main`). After
   the `workflow` scope is granted, push the branch (or the workflow files) to
   `main`/default, then run `gh workflow run "Release installers" --ref
   rea/production-readiness-2026-11-09` to build all five targets.
5. **macOS arm64 runner.** `macos-15` was cancelled while queued; macOS arm64
   packages need a successful hosted run or a native machine.
6. **Signing/notarization.** Unsigned builds. Authenticode (Windows) and Apple
   Developer ID + notarization credentials are owner-held.

## Exact owner actions

```bash
# 1) Workflow scope (interactive device flow)
gh auth refresh --hostname github.com --scopes workflow

# 2) If publishing from the owner repository: add kuc6708 with write,
#    or transfer/own the branch. Otherwise use the review bundle.

# 3) Register and run the release workflow (after 1)
git push origin rea/production-readiness-2026-11-09
gh workflow run "Release installers" \
  -R kuc6708/MobaRust --ref rea/production-readiness-2026-11-09

# 4) Decide DEPENDENCY_EXCEPTIONS.md (upgrade project vs accepted exception vs hold)
```

## Review package

- `/home/shood/MobaRust-review/rea-production-readiness-2026-11-09.bundle`
  (thin bundle; requires base `3da2389`)
- `/home/shood/MobaRust-review/patches/` (commit series)
- `/home/shood/MobaRust-review/artifacts/linux-x64/` (packages + checksums)
- `/home/shood/MobaRust-review/README.md`

## Release checklist

- [x] Working application preserved; no installed app overwritten
- [x] Local fmt/clippy/test/release build/frontend/audit/license
- [x] Hosted cross-platform Quality checks (except runner-cancelled macOS arm64)
- [x] Linux x64 packages + checksums
- [ ] Dependency exception/upgrade decision (owner)
- [ ] `workflow` scope + Release workflow registration (owner)
- [ ] Windows/macOS/Linux-ARM64 packages built on native runners
- [ ] Signing/notarization (owner credentials)
- [ ] Tag and publish only after all of the above
