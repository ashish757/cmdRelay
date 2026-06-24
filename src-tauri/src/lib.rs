use tauri::{menu::{Menu, MenuItem}, tray::TrayIconBuilder, Manager, Resource};
use tokio::net::TcpListener;
use tokio_tungstenite::accept_async;
use futures_util::StreamExt;

pub async fn run_server() {
    let listener = TcpListener::bind("0.0.0.0:3000").await.unwrap();

    while let Ok((stream, _)) = listener.accept().await {
        let mut ws = accept_async(stream).await.unwrap();

        while let Some(msg) = ws.next().await {
            if let Ok(m) = msg {
                if let Ok(txt) = m.into_text() {
                    println!("{}", txt);
                }
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
      .plugin(tauri_plugin_log::Builder::new().build())
      .run(tauri::generate_context!())
      .expect("err");

}
