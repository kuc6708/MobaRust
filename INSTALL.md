# Installation — MobaRust 0.1.31 (release candidate, unsigned)

**Status: release candidate, not a stable release.** Artifacts are unsigned and
were **not published**. Do not install over an existing MobaXterm/MobaRust
installation without explicit authorization; back up sessions/configuration
first. The currently installed application was not modified during this work.

## Verified artifact: Linux x64

Files and checksums (also in `SHA256SUMS-linux-x64.txt`):

```
59c01c09194b167df067e06f0625951e2a6f13a80653560a3ac21c68055423db  MobaRust-0.1.31-linux-x64.AppImage
a214f39399d8d8d1a70ac5e90ea0442e7a7881734671347115ae0774a4260bea  MobaRust-0.1.31-linux-x64.deb
b1af997872709dd2ecb49436e6496793941f7d388b58a8df67de75250dc8405b  MobaRust-0.1.31-linux-x64.rpm
```

Verify first:

```bash
sha256sum -c SHA256SUMS-linux-x64.txt
```

### Debian/Ubuntu (DEB)

```bash
sudo apt install ./MobaRust-0.1.31-linux-x64.deb
# uninstall
sudo apt remove mobarust
```

### Fedora/RHEL (RPM)

```bash
sudo dnf install ./MobaRust-0.1.31-linux-x64.rpm
# or: sudo rpm -i ./MobaRust-0.1.31-linux-x64.rpm
# uninstall: sudo dnf remove MobaRust
```

### AppImage (no install)

```bash
chmod +x MobaRust-0.1.31-linux-x64.AppImage
./MobaRust-0.1.31-linux-x64.AppImage
# systems without FUSE:
APPIMAGE_EXTRACT_AND_RUN=1 ./MobaRust-0.1.31-linux-x64.AppImage
```

## Windows x64 / Windows ARM64 / Linux ARM64 / macOS

No verified installers were produced in this session. Do **not** use unverified
packages. See `RELEASE_READINESS.md` for the exact blockers (missing `workflow`
scope/release-workflow registration, macOS arm64 runner cancellation, and the
dependency exception decision). When packages exist they will be NSIS (`.exe`)
on Windows, DEB/RPM on Linux ARM64, and DMG on macOS.

## Signing and trust

- Builds are **unsigned**: Windows SmartScreen and macOS Gatekeeper will warn;
  Linux packages have no repository signature.
- Always verify the SHA-256 checksum before running an unsigned artifact.

## Data and rollback

- Default data directory (Linux):
  `~/.local/share/com.othmane.mobarust` (sessions, settings, vault metadata).
  Back it up before testing; a new install may migrate or rewrite it.
- The AppImage is self-contained; removing the file removes the application.
- For RC testing, prefer a disposable VM or a separate user account.
