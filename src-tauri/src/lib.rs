use tauri::{menu::{Menu, MenuItem}, tray::TrayIconBuilder};

pub mod types;
pub mod input;
pub mod server;

pub mod router;

use crate::server::run_server;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let quit_btn = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&quit_btn])?;

            TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .on_menu_event(|_app, event| {
                    if event.id.as_ref() == "quit" {
                        std::process::exit(0);
                    }
                })
                .build(app)?;

            // Start the network loop we imported from server.rs
            tauri::async_runtime::spawn(run_server());

            Ok(())
        })
        .plugin(
            tauri_plugin_log::Builder::new()
                .target(tauri_plugin_log::Target::new(
                    tauri_plugin_log::TargetKind::Stdout,
                ))
                .level(log::LevelFilter::Info)
                .build()
        )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}