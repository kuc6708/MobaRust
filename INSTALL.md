# Installation — MobaRust 0.1.37 / 0.1.36 / 0.1.34 / 0.1.33 / 0.1.32 test builds (unsigned)

## Windows x64 SSH PTY sizing build (0.1.37)

`MobaRust-0.1.37-windows-x64.exe` — SHA-256
`c64ed054d14b78632294dbdb3b1edf4036fcc980ce42f8dcc97141705cf3a2db`
(6,205,792 bytes). Unsigned; use a VM or back up first. The Terminal view now
hides decorative chrome, hides the right rail at ≤1280px, supports a draggable
sidebar, and opens the SSH PTY at the measured viewport instead of 120x32. At
1024x768 the measured terminal is 96x28, meeting a remote 80x24 minimum.

## Windows x64 Windows OpenSSH agent build (0.1.36)

`MobaRust-0.1.36-windows-x64.exe` — SHA-256
`2bef40072418fab1815861e5694345a06ae036de148304f1a588fcbe591012dd`
(6,205,740 bytes). Unsigned; use a VM or back up first. This build prefers the
Windows OpenSSH agent and falls back to Pageant. Load the key with `ssh-add` or
use a private-key path; `ssh-add -l` must list the key.

## Windows x64 SSH authentication test build (0.1.34)

`MobaRust-0.1.34-windows-x64.exe` — SHA-256
`e246e5f264cf2a195288b8dfad97e38c5b47005c5eab4b0cc86c368844bbed91`
(6,202,828 bytes). Unsigned; SmartScreen will warn. It may upgrade an installed
build; back up first and prefer a disposable VM. For `cc00sw03`, edit the
imported session to use the `shood-admin` identity and **SSH agent (Pageant or
Windows OpenSSH)**, or import `%USERPROFILE%\.ssh\config`.

## Windows x64 SSH trust-fix test build (0.1.33)

`MobaRust-0.1.33-windows-x64.exe` — SHA-256
`f507e25aa6a2131a0dfc8daea478e5d182127f0400278c0f2e86eb58b701e5ba`
(6,209,025 bytes). Unsigned; SmartScreen will warn. It may upgrade an installed
0.1.32 build — back up first and prefer a disposable VM or separate user.
After launch, the Sessions warning offers **Review & trust host key…** and the
default trust file is your OpenSSH `%USERPROFILE%\.ssh\known_hosts`.

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
