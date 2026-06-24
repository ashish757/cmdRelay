use tauri::{menu::{Menu, MenuItem}, tray::TrayIconBuilder};
use tokio::net::TcpListener;
use tokio_tungstenite::accept_async;
use futures_util::StreamExt;
use log::{error, info};
use serde::Deserialize;
use enigo::{Enigo, Key, KeyboardControllable};


#[allow(non_snake_case)]
#[derive(Deserialize, Debug)]
pub struct PldData {
    pub keyId: String,
}

#[allow(non_snake_case)]
#[derive(Deserialize, Debug)]
pub struct ClientPayload {
    pub actionType: String,
    pub payload: PldData,
}

pub async fn run_server() {
    let listener = TcpListener::bind("0.0.0.0:3000").await.unwrap();

    while let Ok((stream, _)) = listener.accept().await {
        match accept_async(stream).await {
            Ok(mut ws) => {
                info!("new websocket connection");

                tauri::async_runtime::spawn(async move {

                    while let Some(msg) = ws.next().await {
                        if let Ok(m) = msg {
                            if let Ok(txt) = m.into_text() {
                                if let Ok(pld) = serde_json::from_str::<ClientPayload>(&txt) {
                                    if pld.actionType == "keyPress" {
                                        info!("received keyPress");

                                        let mut engo = Enigo::new();

                                        match pld.payload.keyId.as_str() {
                                            "UP" => engo.key_click(Key::UpArrow),
                                            "DOWN" => engo.key_click(Key::DownArrow),
                                            "LEFT" => engo.key_click(Key::LeftArrow),
                                            "RIGHT" => engo.key_click(Key::RightArrow),
                                            _ => {}
                                        }
                                    }
                                }
                            }
                        }
                    }
                });

            }
            Err(e) => {
                error!("websocket connection error: {}", e);
            }
        }
    }
}



#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
        let quit_btn = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
        let menu = Menu::with_items(app, &[&quit_btn])?;

        TrayIconBuilder::new()
            .icon(app.default_window_icon().unwrap().clone())
            .menu(&menu)
            .on_menu_event(|app, event| {
                if event.id.as_ref() == "quit" {
                    std::process::exit(0);
                }
            })
            .build(app)?;

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
      .expect("err");

}
