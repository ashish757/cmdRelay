use tokio::net::TcpListener;
use tokio::sync::mpsc;
use std::thread;
use tokio_tungstenite::accept_async;
use tokio_tungstenite::tungstenite::Message;
use futures_util::StreamExt;
use log::{error, info};
use enigo::Enigo;
use std::path::Path;
use std::fs;
use futures_util::SinkExt;
use tokio::sync::broadcast;

use crate::types::ClientPayload;
use crate::router::route_action;

fn parse_payload(txt: &str) -> Option<ClientPayload> {
    match serde_json::from_str::<ClientPayload>(txt) {
        Ok(data) => Some(data),
        Err(e) => {
            error!("JSON Parse Error: {}", e);
            None
        }
    }
}

pub async fn run_server(telemetry_tx: broadcast::Sender<String>) {
    // 1. Separate the input broadcast channel from the Enigo action queue
    let (action_tx, mut action_rx) = mpsc::unbounded_channel::<ClientPayload>();

    thread::spawn(move || {
        let mut e = Enigo::new();
        while let Some(payload) = action_rx.blocking_recv() {
            route_action(&mut e, payload);
        }
    });

    let listener = TcpListener::bind("0.0.0.0:3000").await.unwrap();
    info!("Server listening on port 3000");

    while let Ok((stream, _)) = listener.accept().await {
        let action_tx_clone = action_tx.clone();

        // 2. Each unique connected device gets its own independent telemetry subscription
        let mut current_telemetry_rx = telemetry_tx.subscribe();

        match accept_async(stream).await {
            Ok(ws) => {
                info!("New WebSocket connection established");

                tauri::async_runtime::spawn(async move {
                    // 3. Split socket into distinct Write and Read streams
                    let (mut ws_writer, mut ws_reader) = ws.split();

                    // Instantly push layout context synchronization state
                    if Path::new("master_layout.json").exists() {
                        if let Ok(data) = fs::read_to_string("master_layout.json") {
                            let sync_msg = format!(
                                r#"{{"actionType": "syncLayout", "payload": {}}}"#,
                                data
                            );
                            let _ = ws_writer.send(Message::Text(sync_msg)).await;
                        }
                    }

                    // Concurrent connection loop for this specific client
                    loop {
                        tokio::select! {
                            // Branch A: Catch active app telemetry changes and write to phone
                            telemetry_res = current_telemetry_rx.recv() => {
                                match telemetry_res {
                                    Ok(app_data) => {
                                        if let Err(e) = ws_writer.send(Message::Text(app_data)).await {
                                            error!("Failed to send telemetry event: {}", e);
                                            break;
                                        }
                                    }
                                    Err(e) => {
                                        error!("Telemetry receiver channel lag error: {}", e);
                                    }
                                }
                            }

                            // Branch B: Catch incoming command controls sent from phone
                            incoming_msg = ws_reader.next() => {
                                match incoming_msg {
                                    Some(Ok(Message::Text(txt))) => {
                                        if txt.trim().is_empty() {
                                            continue;
                                        }
                                        if let Some(pld) = parse_payload(&txt) {
                                            let _ = action_tx_clone.send(pld);
                                        }
                                    }
                                    Some(Ok(Message::Close(_))) => {
                                        info!("WebSocket connection closed cleanly by client");
                                        break;
                                    }
                                    Some(Ok(_)) => continue, // Disregard binary/ping frames safely
                                    Some(Err(e)) => {
                                        error!("WebSocket read error: {}", e);
                                        break;
                                    }
                                    None => {
                                        break; // Stream terminated cleanly
                                    }
                                }
                            }
                        }
                    }
                });
            }
            Err(e) => error!("WebSocket handshake connection error: {}", e),
        }
    }
}