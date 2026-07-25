use active_win_pos_rs::get_active_window;
use tokio::time::{sleep, Duration};
use tokio::sync::broadcast;
use sysinfo::System;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use serde_json::json;
use crate::types::{ProcessInfo};

use crate::types::AppSettings;
use crate::scan_installed_apps::scan_installed_apps;


fn load_or_init_settings() -> AppSettings {
    let mut settings: AppSettings = crate::config::read_settings()
        .ok()
        .and_then(|data| serde_json::from_str(&data).ok())
        .unwrap_or_default();

    if settings.discovery.known_apps.is_empty() {
        settings.discovery.known_apps = scan_installed_apps();
        if let Ok(json) = serde_json::to_string_pretty(&settings) {
            let _ = crate::config::save_settings(&json);
        }
    }

    settings
}

pub async fn watch_system_state(tx: broadcast::Sender<String>, is_active: Arc<AtomicBool>) {
    let mut last_app_name = String::new();

    let mut sys = System::new_all();
    sys.refresh_all();

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
                        let _ = crate::config::save_settings(&json_string);

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

        if is_active.load(Ordering::Relaxed) {
            sys.refresh_cpu_all();
            sys.refresh_memory();
            sys.refresh_processes(sysinfo::ProcessesToUpdate::All, true);

            let cpu_usage = sys.global_cpu_usage();
            let bytes_to_gb = 1_073_741_824.0;
            let ram_used = sys.used_memory() as f64 / bytes_to_gb;
            let ram_total = sys.total_memory() as f64 / bytes_to_gb;

            let mut processes: Vec<ProcessInfo> = sys.processes()
                .values()
                .map(|p| ProcessInfo {
                    name: p.name().to_string_lossy().into_owned(),
                    cpu_usage: p.cpu_usage(),
                    ram_used: p.memory() as f64 / bytes_to_gb,
                })
                .collect();

            processes.sort_by(|a, b| b.ram_used.partial_cmp(&a.ram_used).unwrap_or(std::cmp::Ordering::Equal));
            let top_processes: Vec<ProcessInfo> = processes.into_iter().take(5).collect();

            let telemetry_payload = json!({
                            "actionType": "systemTelemetry",
                            "payload": {
                            "cpuUsage": cpu_usage,
                            "ramUsed": ram_used,
                            "ramTotal": ram_total,
                            "processes": top_processes
                        }
                        }).to_string();

            let _ = tx.send(telemetry_payload);
        }


        sleep(Duration::from_millis(1000)).await;
    }
}