use mobarust_core::{SessionRecord, SessionTerminalPreferences, SessionValidationError};

fn preferences(
    font_size: u16,
    scrollback_lines: u32,
    cursor_blink: bool,
) -> SessionTerminalPreferences {
    SessionTerminalPreferences {
        font_family: Some("Consolas, monospace".into()),
        font_size,
        letter_spacing: Some(5),
        line_height: Some(120),
        scrollback_lines,
        cursor_blink,
    }
}

#[test]
fn bounds_accept_only_supported_ranges() {
    for (font_size, scrollback_lines) in [(8, 100), (13, 5_000), (32, 100_000)] {
        let mut session = SessionRecord::local_terminal("preferences");
        session.terminal_preferences = Some(preferences(font_size, scrollback_lines, true));
        session.validate().expect("documented bounds must validate");
    }

    for (font_size, scrollback_lines) in
        [(0, 5_000), (7, 5_000), (33, 5_000), (13, 99), (13, 100_001)]
    {
        let mut session = SessionRecord::local_terminal("preferences");
        session.terminal_preferences = Some(preferences(font_size, scrollback_lines, true));
        assert_eq!(
            session.validate(),
            Err(SessionValidationError::InvalidTerminalPreferences),
            "font={font_size} scrollback={scrollback_lines} must be rejected"
        );
    }

    for mutate in [
        |preferences: &mut SessionTerminalPreferences| {
            preferences.font_family = Some("bad;font".into())
        },
        |preferences: &mut SessionTerminalPreferences| preferences.letter_spacing = Some(51),
        |preferences: &mut SessionTerminalPreferences| preferences.line_height = Some(99),
        |preferences: &mut SessionTerminalPreferences| preferences.line_height = Some(201),
    ] {
        let mut session = SessionRecord::local_terminal("preferences");
        let mut invalid = preferences(13, 5_000, true);
        mutate(&mut invalid);
        session.terminal_preferences = Some(invalid);
        assert_eq!(
            session.validate(),
            Err(SessionValidationError::InvalidTerminalPreferences)
        );
    }
}

#[test]
fn legacy_preferences_without_typography_fields_load_with_inherited_defaults() {
    let mut session = SessionRecord::local_terminal("preferences");
    session.terminal_preferences = Some(preferences(13, 5_000, true));
    let mut value = serde_json::to_value(&session).expect("serialize session");
    let preferences = value["terminal_preferences"]
        .as_object_mut()
        .expect("preferences object");
    preferences.remove("fontFamily");
    preferences.remove("letterSpacing");
    preferences.remove("lineHeight");

    let restored: SessionRecord =
        serde_json::from_value(value).expect("legacy preferences must load");
    let restored = restored.terminal_preferences.expect("preferences");
    assert_eq!(restored.font_family, None);
    assert_eq!(restored.letter_spacing, None);
    assert_eq!(restored.line_height, None);
}

#[test]
fn serde_uses_camel_case_and_is_optional() {
    let mut session = SessionRecord::local_terminal("preferences");
    session.terminal_preferences = Some(preferences(20, 10_000, false));

    let value = serde_json::to_value(&session).expect("serialize session");
    assert_eq!(
        value["terminal_preferences"]["fontFamily"],
        "Consolas, monospace"
    );
    assert_eq!(value["terminal_preferences"]["fontSize"], 20);
    assert_eq!(value["terminal_preferences"]["letterSpacing"], 5);
    assert_eq!(value["terminal_preferences"]["lineHeight"], 120);
    assert_eq!(value["terminal_preferences"]["scrollbackLines"], 10_000);
    assert_eq!(value["terminal_preferences"]["cursorBlink"], false);

    let round_tripped: SessionRecord =
        serde_json::from_value(value.clone()).expect("deserialize session");
    assert_eq!(
        round_tripped.terminal_preferences,
        session.terminal_preferences
    );

    session.terminal_preferences = None;
    let without = serde_json::to_value(&session).expect("serialize session without preferences");
    assert!(
        without.get("terminal_preferences").is_none(),
        "unset preferences must be omitted so older readers and files stay compatible"
    );
}

#[test]
fn legacy_json_without_the_field_loads_as_none() {
    let session = SessionRecord::local_terminal("legacy");
    let mut value = serde_json::to_value(&session).expect("serialize legacy session");
    value
        .as_object_mut()
        .expect("session is an object")
        .remove("terminal_preferences");

    let restored: SessionRecord = serde_json::from_value(value).expect("legacy JSON must load");
    assert_eq!(restored.terminal_preferences, None);
}

#[test]
fn unknown_preference_fields_are_rejected() {
    let mut session = SessionRecord::local_terminal("preferences");
    session.terminal_preferences = Some(preferences(13, 5_000, true));
    let mut value = serde_json::to_value(&session).expect("serialize session");
    value["terminal_preferences"]["unexpected"] = serde_json::json!(1);

    assert!(
        serde_json::from_value::<SessionRecord>(value).is_err(),
        "unknown fields must be refused rather than silently ignored"
    );
}
