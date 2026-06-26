use tokio::net::TcpListener;
use tokio_tungstenite::accept_async;
use futures_util::StreamExt;
use log::{error, info};

use crate::types::ClientPayload;
use crate::input::{execute_keypress, execute_trackpad_move};


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

                                    // route to the correct action
                                    if pld.actionType == "keyPress" {
                                        if let Some(key) = pld.payload.keyId {
                                            execute_keypress(&key);
                                        }
                                    } else if pld.actionType == "mouseMove" {
                                        if let (Some(dx), Some(dy)) = (pld.payload.dx, pld.payload.dy) {
                                            execute_trackpad_move(dx, dy);
                                        }
                                    } else {
                                        error!("Unknown actionType: {}", pld.actionType);
                                    }
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