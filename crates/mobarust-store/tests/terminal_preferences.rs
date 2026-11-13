use mobarust_core::{SessionRecord, SessionTerminalPreferences, SessionValidationError};
use mobarust_store::{SessionStore, StoreError};

fn preferences() -> SessionTerminalPreferences {
    SessionTerminalPreferences {
        font_family: Some("Cascadia Mono, Consolas, monospace".into()),
        font_size: 20,
        letter_spacing: Some(6),
        line_height: Some(125),
        scrollback_lines: 10_000,
        cursor_blink: false,
    }
}

fn session_with_preferences(preferences: Option<SessionTerminalPreferences>) -> SessionRecord {
    let mut session = SessionRecord::local_terminal("preferences");
    session.terminal_preferences = preferences;
    session
}

#[test]
fn preferences_round_trip_through_the_durable_store() {
    let directory = tempfile::tempdir().expect("temporary directory");
    let path = directory.path().join("sessions.json");

    let mut store = SessionStore::open(&path).expect("open store");
    let saved = store
        .save(session_with_preferences(Some(preferences())))
        .expect("save session");

    let reopened = SessionStore::open(&path).expect("reopen store");
    let loaded = reopened
        .list()
        .iter()
        .find(|session| session.id == saved.id)
        .expect("saved session must persist");
    assert_eq!(loaded.terminal_preferences, Some(preferences()));
}

#[test]
fn export_is_camel_case_and_import_preserves_preferences() {
    let source_directory = tempfile::tempdir().expect("source directory");
    let mut store =
        SessionStore::open(source_directory.path().join("sessions.json")).expect("open store");
    store
        .save(session_with_preferences(Some(preferences())))
        .expect("save session");

    let json = store.export_json().expect("export sessions");
    assert!(json.contains("\"terminal_preferences\""));
    assert!(json.contains("\"fontFamily\""));
    assert!(json.contains("\"fontSize\""));
    assert!(json.contains("\"letterSpacing\""));
    assert!(json.contains("\"lineHeight\""));
    assert!(json.contains("\"scrollbackLines\""));
    assert!(json.contains("\"cursorBlink\""));

    let target_directory = tempfile::tempdir().expect("target directory");
    let mut target =
        SessionStore::open(target_directory.path().join("sessions.json")).expect("open target");
    let report = target.import_json(&json).expect("import sessions");
    assert_eq!(report.imported_count, 1);
    assert_eq!(
        target
            .list()
            .first()
            .and_then(|session| session.terminal_preferences.clone()),
        Some(preferences())
    );
}

#[test]
fn a_legacy_store_without_the_preference_field_loads_as_none() {
    let directory = tempfile::tempdir().expect("temporary directory");
    let path = directory.path().join("sessions.json");

    let mut store = SessionStore::open(&path).expect("open store");
    let saved = store
        .save(session_with_preferences(None))
        .expect("save session without preferences");

    let raw = std::fs::read_to_string(&path).expect("read store file");
    assert!(
        !raw.contains("terminal_preferences"),
        "unset preferences must not be written"
    );

    let reopened = SessionStore::open(&path).expect("reopen store");
    let loaded = reopened
        .list()
        .iter()
        .find(|session| session.id == saved.id)
        .expect("legacy session must load");
    assert_eq!(loaded.terminal_preferences, None);
}

#[test]
fn invalid_preferences_are_rejected_before_persistence() {
    let directory = tempfile::tempdir().expect("temporary directory");
    let path = directory.path().join("sessions.json");
    let mut store = SessionStore::open(&path).expect("open store");

    let mut invalid = preferences();
    invalid.font_size = 7;
    let error = store
        .save(session_with_preferences(Some(invalid)))
        .expect_err("invalid preferences must not be saved");
    assert!(matches!(
        error,
        StoreError::InvalidSession(SessionValidationError::InvalidTerminalPreferences)
    ));
    assert!(
        store.list().is_empty(),
        "a rejected save must not mutate the store"
    );
}
