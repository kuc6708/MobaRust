# Installation — MobaRust 0.1.32-rc.1 (release candidate, unsigned)

**Release candidate — unpublished and unsigned.** No GitHub release exists.
Verify checksums before use and prefer a disposable VM/account. Do not install
over an existing MobaXterm/MobaRust installation without explicit authorization;
the installed application was not modified during this work.

Artifacts are preserved in
`/home/shood/MobaRust-review/artifacts/release-0.1.32-rc.1/` with
`SHA256SUMS-all.txt` and per-platform manifests. Full hashes are in
`RELEASE_NOTES.md`.

## Verify first

```bash
sha256sum -c SHA256SUMS-all.txt
```

(Paths in the aggregate file are relative to the artifact directory.)

## Linux x64 / ARM64

DEB:

```bash
sudo apt install ./MobaRust-0.1.32-linux-x64.deb
# ARM64: ./MobaRust-0.1.32-linux-arm64.deb
# uninstall: sudo apt remove moba-rust
```

RPM:

```bash
sudo dnf install ./MobaRust-0.1.32-linux-x64.rpm
# ARM64: ./MobaRust-0.1.32-linux-arm64.rpm
# uninstall: sudo dnf remove moba-rust
```

AppImage (no install):

```bash
chmod +x MobaRust-0.1.32-linux-x64.AppImage
./MobaRust-0.1.32-linux-x64.AppImage
# without FUSE:
APPIMAGE_EXTRACT_AND_RUN=1 ./MobaRust-0.1.32-linux-x64.AppImage
```

## Windows x64 / ARM64 (NSIS)

Run `MobaRust-0.1.32-windows-x64.exe` or
`MobaRust-0.1.32-windows-arm64.exe`. The installer is unsigned, so SmartScreen
will warn. Uninstall via Settings → Apps.

## macOS Intel / ARM64 (DMG)

Open `MobaRust-0.1.32-macos-x64.dmg` or `MobaRust-0.1.32-macos-arm64.dmg` and
drag the app to Applications. The build is unsigned and not notarized, so
Gatekeeper will warn; use System Settings → Privacy & Security to allow it only
after verifying the checksum.

## Data and rollback

- Linux data directory: `~/.local/share/com.othmane.mobarust` (sessions,
  settings, vault metadata). Back it up before testing.
- Windows/macOS use the platform app-data directory.
- AppImage is self-contained; deleting the file removes it.
- Prefer a disposable VM or separate user for RC testing.
