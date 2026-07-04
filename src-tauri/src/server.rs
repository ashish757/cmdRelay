use tokio::net::TcpListener;
use tokio::sync::mpsc;
use std::thread;
use tokio_tungstenite::accept_async;
use futures_util::StreamExt;
use log::{error, info};
use enigo::Enigo;
use std::path::Path;
use std::fs;
use futures_util::SinkExt;

use crate::types::ClientPayload;
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
    let (tx, mut rx) = mpsc::unbounded_channel::<ClientPayload>();
        thread::spawn(move || {
        let mut e  = Enigo::new();
            while let Some(payload) = rx.blocking_recv() {
                route_action(&mut e, payload);
            }
    });

    let listener = TcpListener::bind("0.0.0.0:3000").await.unwrap();

    while let Ok((stream, _)) = listener.accept().await {
        let tx_c = tx.clone();
        match accept_async(stream).await {
            Ok(mut ws) => {
                // ... inside your tokio::spawn block for a new connection ...

                // 1. Immediately read the master file
                if Path::new("master_layout.json").exists() {
                    if let Ok(data) = fs::read_to_string("master_layout.json") {
                        // 2. Wrap it in your ClientPayload format and send it back
                        let sync_msg = format!(
                            r#"{{"actionType": "syncLayout", "payload": {}}}"#,
                            data
                        );
                        let _ = ws.send(tokio_tungstenite::tungstenite::Message::Text(sync_msg)).await;
                    }
                }

                info!("New WebSocket connection established");

                tauri::async_runtime::spawn(async move {
                    while let Some(msg) = ws.next().await {
                        if let Ok(m) = msg {
                            if let Ok(txt) = m.into_text() {

                                // parse
                                if let Some(pld) = parse_payload(&txt) {

                                    let _ = tx_c.send(pld);
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