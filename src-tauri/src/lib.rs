use tauri::{menu::{Menu, MenuItem}, tray::TrayIconBuilder, Manager};
use local_ip_address::local_ip;
use std::sync::atomic::AtomicBool;
use std::sync::Arc;

pub mod types;
pub mod system_actions;
pub mod server;
pub mod telemetry_service;
pub mod controllers;
pub mod scan_installed_apps;
pub mod config;

use crate::telemetry_service::watch_system_state;
use crate::server::run_server;

#[tauri::command]
fn get_server_url() -> Result<String, String> {
    match local_ip() {
        Ok(ip) => Ok(format!("http://{}:3000", ip)),
        Err(e) => Err(format!("Failed to get local IP: {}", e)),
    }
}

#[tauri::command]
fn get_layouts() -> Result<String, String> {
    crate::config::read_layouts().map_err(|e| e.to_string())
}

#[tauri::command]
fn save_layouts(new_json: String) -> Result<(), String> {
    crate::config::save_layouts(&new_json).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(target_os = "macos")]
            let _ = app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            match crate::config::initialize_layouts() {
                Ok(path) => log::info!("Layouts initialized successfully at {:?}", path),
                Err(e) => log::error!("Failed to initialize layouts: {}", e),
            }

            let (tx, _rx) = tokio::sync::broadcast::channel::<String>(16);

            let tx_clone_server = tx.clone();
            let tx_clone_telemetry = tx.clone();

            let telemetry_active = Arc::new(AtomicBool::new(false));
            let active_clone_server = telemetry_active.clone();
            let active_clone_telemetry = telemetry_active.clone();

            let show_btn = MenuItem::with_id(app, "show", "Show QR Code", true, None::<&str>)?;
            let quit_btn = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_btn, &quit_btn])?;

            TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .on_menu_event(|app, event| {
                    match event.id.as_ref() {
                        "show" => {
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                        "quit" => {
                            std::process::exit(0);
                        }
                        _ => {}
                    }
                })
                .build(app)?;

            tauri::async_runtime::spawn(run_server(tx_clone_server, active_clone_server));
            tauri::async_runtime::spawn(watch_system_state(tx_clone_telemetry, active_clone_telemetry));


            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                let _ = window.hide();
                api.prevent_close();
            }
        })
        .plugin(
            tauri_plugin_log::Builder::new()
                .target(tauri_plugin_log::Target::new(
                    tauri_plugin_log::TargetKind::Stdout,
                ))
                .level(log::LevelFilter::Info)
                .build()
        )
        .invoke_handler(tauri::generate_handler![get_server_url, get_layouts, save_layouts])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}