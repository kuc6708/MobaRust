//! Explicit, append-only trust persistence. This module never opens a network connection.
use std::fs::{self, OpenOptions};
use std::io::{Read, Write};
use std::path::Path;

use russh::keys::{HashAlg, PublicKey};

/// Call only after the operator confirms the displayed host, port, algorithm
/// and SHA256 fingerprint through an independent channel. Existing conflicting
/// trust is never replaced. A subsequent connection must verify this file again.
pub fn trust_unknown_host_key(
    host: &str,
    port: u16,
    public_key: &str,
    confirmed_fingerprint: &str,
    path: &Path,
) -> Result<(), String> {
    if host.is_empty()
        || host.len() > 255
        || port == 0
        || host
            .chars()
            .any(|c| c.is_whitespace() || c.is_control() || ",*!?|[]".contains(c))
        || public_key.len() > 16_384
        || public_key.contains(['\n', '\r'])
    {
        return Err("Invalid host-key trust request".into());
    }
    let key = PublicKey::from_openssh(public_key).map_err(|_| "Invalid SSH public key")?;
    if key.fingerprint(HashAlg::Sha256).to_string() != confirmed_fingerprint {
        return Err("Confirmed fingerprint does not match the public key".into());
    }
    // Create the user's .ssh directory when trusting the default OpenSSH
    // store; keep the directory private on Unix.
    if let Some(parent) = path
        .parent()
        .filter(|parent| !parent.as_os_str().is_empty())
    {
        match fs::symlink_metadata(parent) {
            Ok(metadata) if metadata.is_dir() => {}
            Ok(_) => return Err("Trust file directory is not a directory".into()),
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => {
                fs::create_dir_all(parent)
                    .map_err(|_| "Cannot create trust directory".to_owned())?;
                #[cfg(unix)]
                {
                    use std::os::unix::fs::PermissionsExt;
                    let _ = fs::set_permissions(parent, fs::Permissions::from_mode(0o700));
                }
            }
            Err(_) => return Err("Cannot inspect trust directory".into()),
        }
    }
    let mut lock_name = path.as_os_str().to_os_string();
    lock_name.push(".mobarust-lock");
    let lock_path = std::path::PathBuf::from(lock_name);
    let mut options = OpenOptions::new();
    options.write(true).create_new(true);
    #[cfg(unix)]
    {
        use std::os::unix::fs::OpenOptionsExt;
        options.mode(0o600);
    }
    let _lock = options
        .open(&lock_path)
        .map_err(|_| "Trust file is locked or its directory is unavailable")?;
    struct Lock<'a>(&'a Path);
    impl Drop for Lock<'_> {
        fn drop(&mut self) {
            let _ = fs::remove_file(self.0);
        }
    }
    let _guard = Lock(&lock_path);
    if let Ok(metadata) = fs::symlink_metadata(path) {
        if !metadata.is_file() || metadata.len() > 4 * 1024 * 1024 {
            return Err("Trust file must be a regular file smaller than 4 MiB".into());
        }
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            if metadata.permissions().mode() & 0o022 != 0 {
                return Err("Trust file must not be writable by other users".into());
            }
        }
    }
    match russh::keys::check_known_hosts_path(host, port, &key, path) {
        Ok(true) => return Ok(()),
        Err(_) => return Err("Existing host trust conflicts or cannot be read; verify with the administrator. Nothing was changed".into()),
        Ok(false) => {},
    }
    // A different algorithm at an existing host is a trust change too. It must
    // go through manual administrator review rather than the unknown-key flow.
    if !russh::keys::known_hosts::known_host_keys_path(host, port, path)
        .map_err(|_| "Cannot read existing trust")?
        .is_empty()
    {
        return Err("Host already has a different trusted key; nothing was changed".into());
    }
    let mut options = OpenOptions::new();
    options.read(true).append(true).create(true);
    #[cfg(unix)]
    {
        use std::os::unix::fs::OpenOptionsExt;
        options.mode(0o600).custom_flags(libc::O_NOFOLLOW);
    }
    let mut file = options
        .open(path)
        .map_err(|_| "Cannot open trust file securely")?;
    let mut contents = String::new();
    (&mut file)
        .take(4 * 1024 * 1024 + 1)
        .read_to_string(&mut contents)
        .map_err(|_| "Cannot read trust file")?;
    if contents.len() > 4 * 1024 * 1024 {
        return Err("Trust file exceeds 4 MiB".into());
    }
    let endpoint = if port == 22 {
        host.to_owned()
    } else {
        format!("[{host}]:{port}")
    };
    let separator = if contents.is_empty() || contents.ends_with('\n') {
        ""
    } else {
        "\n"
    };
    let record = format!(
        "{separator}{endpoint} {}\n",
        key.to_openssh().map_err(|_| "Invalid public key")?
    );
    file.write_all(record.as_bytes())
        .and_then(|_| file.sync_all())
        .map_err(|_| "Cannot persist host trust".to_owned())
}

#[cfg(test)]
mod tests {
    use super::*;
    const KEY: &str =
        "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAILagOJFgwaMNhBWQINinKOXmqS4Gh5NgxgriXwdOoINJ";
    const OTHER: &str =
        "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAILIG2T/B0l0gaqj3puu510tu9N1OkQ4znY3LYuEm5zCF";
    fn fingerprint() -> String {
        PublicKey::from_openssh(KEY)
            .unwrap()
            .fingerprint(HashAlg::Sha256)
            .to_string()
    }
    #[test]
    fn persists_idempotently_and_rejects_conflicts_without_mutating() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("known_hosts");
        trust_unknown_host_key("example.test", 2222, KEY, &fingerprint(), &path).unwrap();
        let before = fs::read(&path).unwrap();
        trust_unknown_host_key("example.test", 2222, KEY, &fingerprint(), &path).unwrap();
        assert_eq!(before, fs::read(&path).unwrap());
        let other_fp = PublicKey::from_openssh(OTHER)
            .unwrap()
            .fingerprint(HashAlg::Sha256)
            .to_string();
        assert!(trust_unknown_host_key("example.test", 2222, OTHER, &other_fp, &path).is_err());
        assert_eq!(before, fs::read(&path).unwrap());
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            assert_eq!(
                fs::metadata(&path).unwrap().permissions().mode() & 0o777,
                0o600
            );
        }
    }
    #[test]
    fn rejects_bad_confirmation_and_host_injection() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("known_hosts");
        assert!(trust_unknown_host_key("example.test", 22, KEY, "SHA256:wrong", &path).is_err());
        for host in ["*", "host\nother", "host,other", "!host", "[::1]"] {
            assert!(trust_unknown_host_key(host, 22, KEY, &fingerprint(), &path).is_err());
        }
        assert!(!path.exists());
    }
    #[test]
    fn known_hosts_rejects_devices_directories_and_oversized_files() {
        let dir = tempfile::tempdir().unwrap();
        let key = PublicKey::from_openssh(KEY).unwrap();
        assert!(russh::keys::check_known_hosts_path("example.test", 22, &key, dir.path()).is_err());
        let oversized = dir.path().join("oversized");
        fs::File::create(&oversized)
            .unwrap()
            .set_len(4 * 1024 * 1024 + 1)
            .unwrap();
        assert!(russh::keys::check_known_hosts_path("example.test", 22, &key, &oversized).is_err());
        #[cfg(unix)]
        assert!(
            russh::keys::check_known_hosts_path("example.test", 22, &key, Path::new("/dev/zero"))
                .is_err()
        );
    }
    #[test]
    fn openssh_whitespace_hashes_patterns_and_revocations() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("known_hosts");
        let key = PublicKey::from_openssh(KEY).unwrap();
        fs::write(&path, format!("example.test {OTHER}\nexample.test {KEY}\n")).unwrap();
        assert!(russh::keys::check_known_hosts_path("example.test", 22, &key, &path).unwrap());
        fs::write(&path, format!("  # comment\n\texample.test\t  {KEY}\n")).unwrap();
        assert!(russh::keys::check_known_hosts_path("EXAMPLE.test", 22, &key, &path).unwrap());
        fs::write(&path, format!("*.test,!excluded.test {KEY}\n")).unwrap();
        assert!(russh::keys::check_known_hosts_path("example.test", 22, &key, &path).unwrap());
        assert!(!russh::keys::check_known_hosts_path("excluded.test", 22, &key, &path).unwrap());
        fs::write(
            &path,
            format!("|1|bW9iYXJ1c3QtdGVzdC1zYWx0|f8C1Ukn99N5m50Rm+RCNjCNyzQM= {KEY}\n"),
        )
        .unwrap();
        assert!(russh::keys::check_known_hosts_path("example.test", 2222, &key, &path).unwrap());
        assert!(!russh::keys::check_known_hosts_path("example.test", 22, &key, &path).unwrap());
        fs::write(
            &path,
            format!("@revoked example.test {KEY}\nexample.test {KEY}\n"),
        )
        .unwrap();
        assert!(russh::keys::check_known_hosts_path("example.test", 22, &key, &path).is_err());
        fs::write(
            &path,
            format!("|1|O33ESRMWPVkMYIwJ1Uw+n877jTo=|nuuC5vEqXlEZ/8BXQR7m619W6Ak= {OTHER}\n"),
        )
        .unwrap();
        assert!(
            russh::keys::check_known_hosts_path(
                "example.com",
                22,
                &PublicKey::from_openssh(OTHER).unwrap(),
                &path
            )
            .unwrap()
        );
    }
    #[test]
    fn creates_missing_ssh_directory_and_accepts_crlf_or_missing_files() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join(".ssh").join("known_hosts");
        trust_unknown_host_key("example.test", 22, KEY, &fingerprint(), &path).unwrap();
        assert!(path.is_file());
        let key = PublicKey::from_openssh(KEY).unwrap();
        fs::write(&path, format!("example.test {KEY}\r\n")).unwrap();
        assert!(
            russh::keys::check_known_hosts_path("example.test", 22, &key, &path).unwrap(),
            "Windows/CRLF known_hosts must match"
        );
        let missing = dir.path().join("missing").join("known_hosts");
        assert!(
            !russh::keys::check_known_hosts_path("example.test", 22, &key, &missing).unwrap(),
            "a missing known_hosts must be treated as no known keys"
        );
    }

    #[cfg(unix)]
    #[test]
    fn rejects_symlink_trust_destination() {
        let dir = tempfile::tempdir().unwrap();
        let real = dir.path().join("real");
        fs::write(&real, "").unwrap();
        let link = dir.path().join("link");
        std::os::unix::fs::symlink(&real, &link).unwrap();
        assert!(trust_unknown_host_key("example.test", 22, KEY, &fingerprint(), &link).is_err());
        assert_eq!(fs::read(&real).unwrap(), b"");
    }
}
