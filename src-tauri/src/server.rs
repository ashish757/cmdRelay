use tokio::net::TcpListener;
use tokio_tungstenite::accept_async;
use futures_util::StreamExt;
use log::{error, info};

use crate::types::ClientPayload;
use crate::input::{execute_keypress, execute_trackpad_move};
use crate::router::{route_action};


fn parse_payload(txt: &str) -> Option<ClientPayload> {
    match serde_json::from_str::<ClientPayload>(txt) {
        Ok(data) => Some(data),
        Err(e) => {
            error!("JSON Parse Error: {}", e);
            None
        }
    }
}

pub async fn run_server() {
    let listener = TcpListener::bind("0.0.0.0:3000").await.unwrap();

    while let Ok((stream, _)) = listener.accept().await {
        match accept_async(stream).await {
            Ok(mut ws) => {
                info!("New WebSocket connection established");

                tauri::async_runtime::spawn(async move {
                    while let Some(msg) = ws.next().await {
                        if let Ok(m) = msg {
                            if let Ok(txt) = m.into_text() {

                                // parse
                                if let Some(pld) = parse_payload(&txt) {

                                    route_action(pld);
                                }
                            }
                        }
                    }
                });
            }
            Err(e) => error!("WebSocket connection error: {}", e),
        }
    }
}