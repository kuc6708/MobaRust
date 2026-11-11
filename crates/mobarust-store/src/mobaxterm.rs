//! Independent parser for user-supplied textual MobaXterm bookmark exports.
//! Only allowlisted connection fields enter the session store.
use mobarust_core::{AuthMethod, JumpHostRecord, Protocol, SessionRecord};

pub(super) fn parse(contents: &str) -> (Vec<SessionRecord>, Vec<String>, Vec<String>) {
    let mut sessions = Vec::new();
    let mut skipped = Vec::new();
    let mut warnings = Vec::new();
    let mut bookmarks = false;
    let mut folder = String::from("Imported / MobaXterm");
    for (index, line) in contents.trim_start_matches('\u{feff}').lines().enumerate() {
        let line = line.trim();
        if line.starts_with('[') {
            bookmarks = line.strip_prefix("[Bookmarks").is_some_and(|tail| {
                tail == "]"
                    || tail.strip_suffix(']').is_some_and(|n| {
                        let n = n.strip_prefix('_').unwrap_or(n);
                        !n.is_empty() && n.bytes().all(|b| b.is_ascii_digit())
                    })
            });
            folder = "Imported / MobaXterm".into();
            continue;
        }
        if !bookmarks {
            continue;
        }
        let Some((name, value)) = line.split_once('=') else {
            continue;
        };
        if name == "SubRep" {
            if !value.chars().any(char::is_control) {
                folder = if value.is_empty() {
                    "Imported / MobaXterm".into()
                } else {
                    format!("Imported / MobaXterm/{}", value.replace('\\', "/"))
                };
            }
            continue;
        }
        if name == "ImgNum" {
            continue;
        }
        // Do not echo arbitrary input values: non-bookmark sections may contain secrets.
        let location = format!("bookmark line {}", index + 1);
        let parts: Vec<_> = value.split('#').collect();
        let Some(connection) = parts.get(2) else {
            skipped.push(format!("{location}: malformed record"));
            continue;
        };
        let f: Vec<_> = connection.split('%').collect();
        if f.len() < 16 || f[0] != "0" {
            skipped.push(format!("{location}: unsupported or malformed protocol"));
            continue;
        }
        let Ok(port) = f[2].parse::<u16>() else {
            skipped.push(format!("{location}: invalid port"));
            continue;
        };
        let mut session = SessionRecord::local_terminal(name);
        session.protocol = Protocol::Ssh;
        session.hostname = f[1].into();
        session.port = port;
        session.username = (!f[3].is_empty()).then(|| f[3].to_owned());
        if session.username.is_none()
            && let Some((username, hostname)) = f[1].rsplit_once('@')
        {
            session.username = Some(username.to_owned());
            session.hostname = hostname.to_owned();
        }
        session.auth = AuthMethod::KeyboardInteractivePrompt;
        session.folder = Some(folder.clone());
        session.tags = vec!["imported".into(), "mobaxterm".into()];
        session.favorite = false;
        session.notes = Some("Imported text bookmarks. Verify usernames, key paths, host trust and bastion authentication before connecting. Authentication defaults to an interactive prompt; select SSH agent or a private key if your OpenSSH profile uses one. Passwords, macros, terminal settings and forwarding rules are not imported.".into());
        if !f[15].is_empty() {
            // A reference only: do not expand Windows paths or read private keys.
            session.auth = AuthMethod::PrivateKey {
                key_ref: f[15].into(),
                credential_ref: None,
            };
            warnings.push(format!("{location}: private-key path requires review; PuTTY keys may require OpenSSH conversion"));
        }
        if session
            .username
            .as_ref()
            .is_some_and(|u| u.starts_with('['))
        {
            warnings.push(format!(
                "{location}: credential alias retained; replace with the actual username"
            ));
        }
        if !f[8].is_empty() {
            let Ok(jump_port) = f[9].parse::<u16>() else {
                skipped.push(format!("{location}: invalid gateway port"));
                continue;
            };
            if jump_port == 0 || f[10].is_empty() {
                skipped.push(format!("{location}: incomplete gateway"));
                continue;
            }
            session.jump_host_profiles.push(JumpHostRecord {
                host: f[8].into(),
                port: jump_port,
                username: f[10].into(),
                auth: AuthMethod::KeyboardInteractivePrompt,
                known_hosts_path: None,
                pinned_fingerprint: None,
                server_alive_interval: None,
            });
        }
        if session
            .hostname
            .chars()
            .any(|c| c.is_control() || c.is_whitespace())
            || session
                .username
                .as_ref()
                .is_some_and(|u| u.chars().any(char::is_control))
            || session.jump_host_profiles.iter().any(|j| {
                j.host.chars().any(|c| c.is_control() || c.is_whitespace())
                    || j.username.chars().any(char::is_control)
            })
            || session.validate().is_err()
        {
            skipped.push(format!("{location}: invalid connection fields"));
            continue;
        }
        sessions.push(session);
    }
    warnings.push("Only SSH bookmarks are supported. Authentication preferences, credentials, host trust, macros, WSL shortcuts, appearance and standalone tunnels are not imported; review each session's auth method.".into());
    (sessions, skipped, warnings)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn imports_folders_keys_and_bastions_without_secrets_or_startup_commands() {
        let text = "[Passwords]\nsecret=NEVER_EXPORT\n[Bookmarks_1]\nSubRep=Ops\\Linux\nserver=#109#0%host.test%2222%alice%%-1%-1%%bastion.test%22%bob%0%-1%0%%key.ppk%#font#evil-command\n";
        let (sessions, skipped, warnings) = parse(text);
        assert!(skipped.is_empty());
        assert!(!warnings.is_empty());
        let session = &sessions[0];
        assert_eq!(session.hostname, "host.test");
        assert_eq!(session.port, 2222);
        assert_eq!(session.username.as_deref(), Some("alice"));
        assert_eq!(
            session.folder.as_deref(),
            Some("Imported / MobaXterm/Ops/Linux")
        );
        assert_eq!(session.jump_host_profiles[0].username, "bob");
        assert!(session.startup_command.is_none());
        let json = serde_json::to_string(session).unwrap();
        assert!(!json.contains("NEVER_EXPORT"));
        assert!(!json.contains("evil-command"));
    }
    #[test]
    fn preserves_username_and_key_path_and_flags_default_interactive_auth() {
        let text = "[Bookmarks]\nplain=#109#0%host.test%22%alice%%-1%-1%%%%%0%-1%0%%%#\nkeyed=#109#0%host.test%22%alice%%-1%-1%%%%%0%-1%0%%key.ppk%#\n";
        let (sessions, skipped, warnings) = parse(text);
        assert!(skipped.is_empty());
        assert_eq!(sessions.len(), 2);
        assert_eq!(sessions[0].username.as_deref(), Some("alice"));
        assert!(matches!(
            sessions[0].auth,
            AuthMethod::KeyboardInteractivePrompt
        ));
        assert_eq!(sessions[1].username.as_deref(), Some("alice"));
        assert!(matches!(
            &sessions[1].auth,
            AuthMethod::PrivateKey {
                key_ref,
                credential_ref: None
            } if key_ref == "key.ppk"
        ));
        assert!(
            warnings
                .iter()
                .any(|warning| warning.contains("Authentication"))
        );
    }

    #[test]
    fn malformed_and_unsupported_records_are_reported() {
        let (sessions, skipped, _) = parse(
            "[Bookmarks]\nmalformed=bad\nwsl=#149#14%Debian%\nzero=#109#0%host%0%user%%-1%-1%%%%%0%-1%0%%%#\n",
        );
        assert!(sessions.is_empty());
        assert_eq!(skipped.len(), 3);
    }
}
