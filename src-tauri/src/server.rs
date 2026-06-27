use tokio::net::TcpListener;
use tokio::sync::mpsc;
use std::thread;
use tokio_tungstenite::accept_async;
use futures_util::StreamExt;
use log::{error, info};
use enigo::Enigo;

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