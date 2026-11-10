# Build instructions — MobaRust 0.1.31 (development snapshot)

These instructions build and validate the branch locally on Linux. Artifacts are
unsigned; do not publish them as a stable release.

## Prerequisites

- Rust stable (edition 2024; the workspace declares MSRV 1.90). Current CI/local
  toolchain: 1.99.x.
- Node.js 24 and pnpm 10.15 (`corepack` or `npm i -g pnpm@10.15.0`).
- Linux build dependencies: `libwebkit2gtk-4.1-dev`, `build-essential`,
  `libxdo-dev`, `libssl-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev`,
  `patchelf`, `file`, `cmake`, `nasm`, `dpkg-deb`.
  (RPM bundling is done by the Tauri bundler; `rpmbuild` is not required for the
  current bundler.)
- For AppImage builds on hosts without FUSE: `APPIMAGE_EXTRACT_AND_RUN=1`.
- For the SSH fixture tests: OpenSSH `sshd`, `ssh-keygen`, `xauth`, and an
  available IPv6 loopback for the IPv6 fixtures (they skip when `::1` is
  unavailable). Run the suite with `umask 022` so the trust fixture is not
  group-writable.

## Local build and checks

```bash
# From the repository root
cargo fmt --all -- --check
cargo clippy --locked --workspace --all-targets -- -D warnings
(umask 022; cargo test --locked --workspace)
cargo build --locked --workspace --release

cd apps/desktop
pnpm install --frozen-lockfile
pnpm test:unit
pnpm check
pnpm lint
pnpm build
cd ../..

cargo audit            # expect 0 vulnerabilities and the 5 documented warnings
cargo xtask license-check
node --test tools/release-assets.test.mjs
```

Helpers used by the desktop bundle are generated, not committed:

```bash
cargo xtask stage-helpers   # stages the shippable VNC helper
```

If you run the desktop app in a headless container, WebKitGTK needs a session
bus and software rendering; the test environment used
`dbus-run-session`, `GTK_USE_PORTAL=0`,
`WEBKIT_DISABLE_SANDBOX_THIS_IS_DANGEROUS=1`,
`WEBKIT_DISABLE_COMPOSITING_MODE=1`, `WEBKIT_DISABLE_DMABUF_RENDERER=1`, and
`Xvfb` (see `docs/testing/`).

## Linux x64 release packages (local)

```bash
cd apps/desktop
APPIMAGE_EXTRACT_AND_RUN=1 pnpm tauri build \
  --bundles deb,rpm,appimage \
  --config src-tauri/tauri.release.conf.json \
  --no-sign
cd ../..

# Collect, name-check, copy installers and write SHA-256 sums
node tools/release-assets.mjs collect linux-x64 \
  target/release/bundle target/release-assets-linux-x64

(cd target/release-assets-linux-x64 && sha256sum -c SHA256SUMS-linux-x64.txt)
```

Expected outputs:

- `target/release/bundle/deb/MobaRust_0.1.31_amd64.deb`
- `target/release/bundle/rpm/MobaRust-0.1.31-1.x86_64.rpm`
- `target/release/bundle/appimage/MobaRust_0.1.31_amd64.AppImage`

The collector refuses symlinked installers and intermediate AppDir symlinks, and
verifies exactly one installer per format.

## Hosted CI

Quality (`.github/workflows/quality.yml`) is registered and runs on every push:

```bash
gh run list -R kuc6708/MobaRust --limit 5
```

It runs format/Clippy/tests, frontend checks, release-asset tests, RDP/VNC helper
checks, package layouts and fuzz on: `ubuntu-22.04`, `ubuntu-24.04-arm`,
`windows-latest`, `windows-11-arm`, `macos-15-intel`, `macos-15`. It also has a
`dependency-audit` job that intentionally fails on the five warnings.

### Release installers

`.github/workflows/release.yml` exists on the branch and builds installers for
Windows x64 (NSIS), Linux x64 (DEB/RPM/AppImage), Linux ARM64 (DEB/RPM), macOS
ARM64 and macOS Intel (DMG), uploads checksummed artifacts, and only publishes a
draft prerelease on a `v*` tag. It is **not currently registered** because it is
not on the fork's default branch and the token lacks the `workflow` scope.

Owner steps to enable it:

```bash
gh auth refresh --hostname github.com --scopes workflow
# push the branch/workflow files to the default branch with that token, then:
gh workflow run "Release installers" \
  -R kuc6708/MobaRust --ref rea/production-readiness-2026-11-09
```

Download and preserve artifacts:

```bash
gh run list -R kuc6708/MobaRust --workflow "Release installers"
gh run download <run-id> -R kuc6708/MobaRust -D release-assets
```

The `macos-15` arm64 runner was cancelled while queued during Quality; verify
each job actually ran before claiming a platform package.

## Signing and publication

- Builds are unsigned. Windows Authenticode and Apple Developer ID +
  notarization require owner-held credentials.
- Do not create a tag or publish until the dependency decision (see
  `DEPENDENCY_EXCEPTIONS.md`) and signing are complete.
- `release.yml` publishes only on `v*` tags (draft prerelease); a manual
  `workflow_dispatch` run builds and uploads artifacts without publishing.
