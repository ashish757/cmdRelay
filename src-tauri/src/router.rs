use crate::types::ClientPayload;
use crate::types::KeyAction;
use crate::input::{double_click, drag_end, drag_start, execute_keypress, execute_text, execute_trackpad_move, scroll, secondary_click, single_click, parse_key};
use log::{error, info};
use enigo::Enigo;
use enigo::KeyboardControllable;
use std::fs;
use std::thread;
use std::time::Duration;

#[allow(non_snake_case)]
pub fn route_action(e: &mut Enigo, pld: ClientPayload) {
    if pld.actionType == "keyPress" {
        if let Some(key) = pld.payload.keyId {
            let action = match pld.payload.state.as_deref() {
                Some("down") => KeyAction::Down,
                Some("up") => KeyAction::Up,
                Some("click") => KeyAction::Click,
                _ => KeyAction::Click,
            };
            execute_keypress(e, &key, action);
        }
    }
    else if pld.actionType == "macro" {
        if let Some(steps) = pld.payload.steps {

            // Use a standard detached OS thread instead of an async tokio task
            thread::spawn(move || {
                // This Enigo instance is born here and dies here. It never crosses threads.
                let mut local_enigo = Enigo::new();

                for step in steps {
                    if step.state == "delay" {
                        let ms = step.keyId.parse::<u64>().unwrap_or(0);
                        info!("Macro Delay: {}ms", ms);

                        // Use standard blocking sleep.
                        // Because this is on its own thread, it won't block your server.
                        thread::sleep(Duration::from_millis(ms));
                    } else {
                        if let Some(enigo_key) = parse_key(&step.keyId) {
                            match step.state.as_str() {
                                "down" => {
                                    info!("Macro Hold: {}", step.keyId);
                                    local_enigo.key_down(enigo_key);
                                }
                                "up" => {
                                    info!("Macro Release: {}", step.keyId);
                                    local_enigo.key_up(enigo_key);
                                }
                                "click" => {
                                    info!("Macro Click: {}", step.keyId);
                                    local_enigo.key_click(enigo_key);
                                }
                                _ => error!("Unknown macro state: {}", step.state),
                            }
                        } else {
                            error!("Unknown key in macro: {}", step.keyId);
                        }
                    }
                }
                info!("Macro sequence completed.");
            });
        }
    }
    else if pld.actionType == "mouseMove" {
        if let (Some(dx), Some(dy)) = (pld.payload.dx, pld.payload.dy) {
            execute_trackpad_move(e, dx, dy);
        }
    } else if pld.actionType == "typing" {
        if let Some(text) = pld.payload.text {
            execute_text(e, &text);
        }
    } else if pld.actionType == "singleClick" {
        single_click(e)
    } else if pld.actionType == "doubleClick" {
        double_click(e)
    } else if pld.actionType == "secondaryClick" {
        secondary_click(e)
    } else if pld.actionType == "scroll" {
        if let (Some(dx), Some(dy)) = (pld.payload.dx, pld.payload.dy) {
            scroll(e, dx as i32, dy as i32);
        }
    } else if pld.actionType == "dragStart" {
        drag_start(e)
    } else if pld.actionType == "dragEnd" {
        drag_end(e)
    } else if pld.actionType == "saveLayout" {
        if let Some(layoutsArray) = pld.payload.layouts {
            if let Ok(jsonString) = serde_json::to_string_pretty(&layoutsArray) {
                let _ = fs::write("master_layout.json", jsonString);
                info!("Layout saved to master_layout.json");
            }
        }
    } else {
        error!("Unknown actionType: {}", pld.actionType);
    }
}