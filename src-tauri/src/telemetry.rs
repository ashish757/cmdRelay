use active_win_pos_rs::get_active_window;
use tokio::time::{sleep, Duration};
use tokio::sync::broadcast;

pub async fn watch_active_window(tx: broadcast::Sender<String>) {
    let mut last_app_name = String::new();

    loop {
        if let Ok(active_window) = get_active_window() {
            if active_window.app_name != last_app_name {
                last_app_name = active_window.app_name.clone();

                // Construct the JSON payload
                let payload = format!(r#"{{"type": "APP_SWITCHED", "app": "{}"}}"#, last_app_name);

                // Send it into the broadcast channel
                let _ = tx.send(payload);
            }
        }
        // Poll every 1 second
        sleep(Duration::from_millis(1000)).await;
    }
}