use axum::{
    extract::{
        ws::{Message as AxumMessage, WebSocket, WebSocketUpgrade},
        State,
    },
    http::{header, StatusCode, Uri},
    response::{IntoResponse},
    routing::get,
    Router,
};
use rust_embed::RustEmbed;
use tokio::sync::{broadcast, mpsc};
use std::thread;
use log::{error, info};
use enigo::Enigo;
use std::sync::Arc;
use std::path::Path;
use std::fs;

use crate::types::ClientPayload;
use crate::controllers::route_action;

#[derive(RustEmbed)]
#[folder = "../client/dist"]
struct Assets;

struct AppState {
    action_tx: mpsc::UnboundedSender<ClientPayload>,
    telemetry_tx: broadcast::Sender<String>,
}

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
    let (action_tx, mut action_rx) = mpsc::unbounded_channel::<ClientPayload>();

    thread::spawn(move || {
        let mut e = Enigo::new();
        while let Some(payload) = action_rx.blocking_recv() {
            route_action(&mut e, payload);
        }
    });

    let state = Arc::new(AppState {
        action_tx,
        telemetry_tx,
    });

    let app = Router::new()
        .route("/ws", get(ws_handler))
        .fallback(static_handler)
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    info!("HTTP and WebSocket Server listening on 0.0.0.0:3000");

    axum::serve(listener, app).await.unwrap();
}

async fn static_handler(uri: Uri) -> impl IntoResponse {
    let mut path = uri.path().trim_start_matches('/');
    if path.is_empty() {
        path = "index.html";
    }

    match Assets::get(path) {
        Some(content) => {
            let mime = mime_guess::from_path(path).first_or_octet_stream();
            ([(header::CONTENT_TYPE, mime.as_ref())], content.data).into_response()
        }
        None => (StatusCode::NOT_FOUND, "404 Not Found").into_response(),
    }
}

async fn ws_handler(
    ws: WebSocketUpgrade,
    State(state): State<Arc<AppState>>,
) -> impl IntoResponse {
    ws.on_upgrade(|socket| handle_socket(socket, state))
}

async fn handle_socket(mut socket: WebSocket, state: Arc<AppState>) {
    info!("New WebSocket connection established");
    let mut current_telemetry_rx = state.telemetry_tx.subscribe();

    if Path::new("layouts.json").exists() {
        if let Ok(data) = fs::read_to_string("layouts.json") {
            let sync_msg = format!(
                r#"{{"actionType": "syncLayout", "payload": {}}}"#,
                data
            );
            let _ = socket.send(AxumMessage::Text(sync_msg.into())).await;
            info!("Layout sync sent to client");
        }
    }

    if Path::new("settings.json").exists() {
        if let Ok(settings_data) = fs::read_to_string("settings.json") {
            let sync_msg = format!(r#"{{"actionType": "syncApps", "payload": {}}}"#, settings_data);
            let _ = socket.send(AxumMessage::Text(sync_msg.into())).await;
            info!("Settings sync sent to client");
        }
    }

    loop {
        tokio::select! {
            telemetry_res = current_telemetry_rx.recv() => {
                if let Ok(app_data) = telemetry_res {
                    if socket.send(AxumMessage::Text(app_data.into())).await.is_err() {
                        break;
                    }
                }
            }

            incoming_msg = socket.recv() => {
                match incoming_msg {
                    Some(Ok(AxumMessage::Text(txt))) => {
                        if !txt.trim().is_empty() {
                            if let Some(pld) = parse_payload(&txt) {
                                let _ = state.action_tx.send(pld);
                            }
                        }
                    }
                    Some(Ok(AxumMessage::Close(_))) | None => {
                        info!("WebSocket connection closed cleanly by client");
                        break;
                    }
                    _ => continue,
                }
            }
        }
    }
}