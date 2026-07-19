use active_win_pos_rs::get_active_window;
use tokio::time::{sleep, Duration};
use tokio::sync::broadcast;
use std::fs;

use crate::types::AppSettings;
use crate::scan_installed_apps::scan_installed_apps;

const SETTINGS_FILE: &str = "settings.json";

fn load_or_init_settings() -> AppSettings {
    let mut settings: AppSettings = fs::read_to_string(SETTINGS_FILE)
        .ok()
        .and_then(|data| serde_json::from_str(&data).ok())
        .unwrap_or_default();

    if settings.discovery.known_apps.is_empty() {
        settings.discovery.known_apps = scan_installed_apps();
        if let Ok(json) = serde_json::to_string_pretty(&settings) {
            let _ = fs::write(SETTINGS_FILE, json);
        }
    }

    settings
}

pub async fn watch_active_window(tx: broadcast::Sender<String>) {
    let mut last_app_name = String::new();

    loop {
        if let Ok(active_window) = get_active_window() {
            if active_window.app_name != last_app_name {
                last_app_name = active_window.app_name.clone();

                let switch_payload = format!(
                    r#"{{"actionType": "APP_SWITCHED", "payload": {{"appId": "{}"}}}}"#,
                    last_app_name
                );
                let _ = tx.send(switch_payload);

                let mut settings = load_or_init_settings();

                if !settings.discovery.known_apps.contains(&last_app_name) {
                    settings.discovery.known_apps.push(last_app_name.clone());
                    settings.discovery.known_apps.sort();

                    if let Ok(json_string) = serde_json::to_string_pretty(&settings) {
                        let _ = fs::write(SETTINGS_FILE, &json_string);

                        if let Ok(apps_array_json) = serde_json::to_string(&settings.discovery.known_apps) {
                            let sync_payload = format!(
                                r#"{{"actionType": "syncAppList", "payload": {{"apps": {}}}}}"#,
                                apps_array_json
                            );
                            let _ = tx.send(sync_payload);
                        }
                    }
                }
            }
        }

        sleep(Duration::from_millis(1000)).await;
    }
}