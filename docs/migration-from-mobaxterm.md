# Migration from MobaXterm

MobaRust will prioritize migration paths that are documented, user-controlled, and based on formats users can legally access.

## Current status

The development branch also imports user-selected `.ini` and `.mxtsessions`
UTF-8 text SSH bookmarks from the session-list **MXT** button. Other text
encodings require an explicit conversion before importing. Files are limited to
1 MiB and must be regular files. Importing never opens a remote connection.
Hosts, usernames, ports, folder names, private-key references and explicit
bastion descriptors are preserved. Reimporting the same protocol/name/folder
does not overwrite existing edits. Imports use the normal durable session store
and can be exported through the existing secret-free JSON export.

Review each imported session before connecting. Windows paths and
`_MyDocuments_` key references require manual resolution on Linux/macOS. PuTTY
private keys require independent OpenSSH conversion; no key bytes enter the
importer or session exports. Credential aliases such as `[name]` are retained
and reported rather than guessed. Saved passwords, host trust, startup commands,
macros, standalone tunnels, WSL shortcuts and appearance settings are not
imported. Unsupported protocols and malformed records appear in the report.
Current source disables RSA private-key authentication under the existing
security policy; Ed25519/ECDSA remain available. Import does not override it.

Back up the session catalog before trying a newer development build. Session
schema version 1 does not imply that every authentication enum is supported by
old builds: `keyboardInteractivePrompt` is absent from 0.1.12. Do not copy a new
catalog into an older installed version without checking compatibility.

OpenSSH import is shipped for the common, secret-free connection fields. The application currently exposes a typed session model with protocol, host, port, username, tags, folder, startup settings, jump-host references, and forwarding references. Imported profiles are idempotent by protocol/name and never copy passwords or private-key material into the session store.

The desktop session list exposes an import action. It reads the user-selected config through a typed native command, reports unsupported directives and skipped malformed hosts, and keeps `IdentityFile` as a key reference. `ProxyJump` is preserved as a jump-host reference; imported profiles are not presented as reconnectable until config-alias resolution supplies the complete hop descriptors. Quick Connect can already establish an explicit agent-backed jump hop. A valid `ServerAliveInterval` is stored as a bounded native SSH keepalive setting; `0` disables keepalives and invalid values remain visible in the import note without being applied. The native importer bounds the selected config to 1 MiB and refuses non-regular paths before parsing.

## Planned order

1. OpenSSH `~/.ssh/config` — implemented for `Host`, `HostName`, `User`, `Port`, `IdentityFile`, `ProxyJump`, and `ServerAliveInterval` import boundaries. The path must be supplied explicitly; MobaRust never reads it automatically.
2. Publicly documented or user-exported formats from open-source tools such as PuTTY, Remmina, Tabby, electerm, and mRemoteNG.
3. MobaXterm migration only where the input format is publicly documented or supplied by the user; no proprietary binary dependency or unauthorized reverse engineering.

Unsupported directives must remain visible in an import report. Imports create configuration and credential references, never silently copied passwords.
