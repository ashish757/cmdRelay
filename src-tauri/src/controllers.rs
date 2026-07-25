use crate::types::{ClientPayload, KeyAction};
use crate::system_actions::{double_click, drag_end, drag_start, execute_keypress, execute_text, execute_trackpad_move, scroll, secondary_click, single_click, execute_special_function, execute_terminal_command, parse_key};
use log::{error, info};
use enigo::Enigo;
use enigo::KeyboardControllable;
use std::thread;
use std::time::Duration;
use std::process::Command;

pub fn route_action(e: &mut Enigo, pld: ClientPayload) {
    match pld.action_type.as_str() {
        "keyPress" => {
            if let Some(key) = pld.payload.key_id {
                let action = match pld.payload.state.as_deref() {
                    Some("down") => KeyAction::Down,
                    Some("up") => KeyAction::Up,
                    Some("click") => KeyAction::Click,
                    _ => KeyAction::Click,
                };
                execute_keypress(e, &key, action);
            }
        }
        "openApp" => {
            if let Some(app_id) = pld.payload.app_id {
                info!("Attempting to open/focus application: {}", app_id);
                match Command::new("open").arg("-a").arg(&app_id).status() {
                    Ok(s) if s.success() => info!("Successfully targeted {}", app_id),
                    Ok(_) => error!("Failed to target {}: command returned non-zero status", app_id),
                    Err(err) => error!("Failed to execute focus command for {}: {}", app_id, err),
                }
            }
        }
        "macro" => {
            if let Some(steps) = pld.payload.steps {
                thread::spawn(move || {
                    let mut local_enigo = Enigo::new();
                    for step in steps {
                        if step.state == "delay" {
                            let ms = step.key_id.parse::<u64>().unwrap_or(0);
                            info!("Macro Delay: {}ms", ms);
                            thread::sleep(Duration::from_millis(ms));
                        } else {
                            if let Some(enigo_key) = parse_key(&step.key_id) {
                                match step.state.as_str() {
                                    "down" => {
                                        info!("Macro Hold: {}", step.key_id);
                                        local_enigo.key_down(enigo_key);
                                    }
                                    "up" => {
                                        info!("Macro Release: {}", step.key_id);
                                        local_enigo.key_up(enigo_key);
                                    }
                                    "click" => {
                                        info!("Macro Click: {}", step.key_id);
                                        local_enigo.key_click(enigo_key);
                                    }
                                    _ => error!("Unknown macro state: {}", step.state),
                                }
                            } else {
                                error!("Unknown key in macro: {}", step.key_id);
                            }
                        }
                    }
                    info!("Macro sequence completed.");
                });
            }
        }
        "mouseMove" => {
            if let (Some(dx), Some(dy)) = (pld.payload.dx, pld.payload.dy) {
                execute_trackpad_move(e, dx, dy);
            }
        }
        "typing" => {
            if let Some(text) = pld.payload.text {
                execute_text(e, &text);
            }
        }
        "singleClick" => single_click(e),
        "doubleClick" => double_click(e),
        "secondaryClick" => secondary_click(e),
        "scroll" => {
            if let (Some(dx), Some(dy)) = (pld.payload.dx, pld.payload.dy) {
                scroll(e, dx as i32, dy as i32);
            }
        }
        "dragStart" => drag_start(e),
        "dragEnd" => drag_end(e),
        "saveLayout" => {
            if let Some(layouts_array) = pld.payload.layouts {
                if let Ok(json_string) = serde_json::to_string_pretty(&layouts_array) {
                    if let Ok(_) = crate::config::save_layouts(&json_string) {
                        info!("Layout saved via config module");
                    } else {
                        error!("Failed to save layout via config module");
                    }
                }
            }
        }
        "deleteLayout" => {
            if let Some(layout_id) = pld.payload.id {
                if let Ok(file_content) = crate::config::read_layouts() {
                    if let Ok(mut layouts) = serde_json::from_str::<Vec<serde_json::Value>>(&file_content) {
                        layouts.retain(|l| l.get("id").and_then(|id| id.as_str()) != Some(layout_id.as_str()));

                        if let Ok(json_string) = serde_json::to_string_pretty(&layouts) {
                            if let Ok(_) = crate::config::save_layouts(&json_string) {
                                info!("Layout {} successfully deleted via config module", layout_id);
                            }
                        }
                    }
                }
            }
        }
        "saveSettings" => {
            if let Some(settings_obj) = pld.payload.settings {
                if let Ok(json_string) = serde_json::to_string_pretty(&settings_obj) {
                    if let Ok(_) = crate::config::save_settings(&json_string) {
                        info!("Settings saved to disk via config module");
                    } else {
                        error!("Failed to save settings via config module");
                    }
                }
            }
        }

        "terminalCommand" => {
            if let Some(cmd) = pld.payload.command {
                let in_bg = pld.payload.in_background.unwrap_or(false);
                execute_terminal_command(&cmd, in_bg);
            } else {
                log::error!("Received terminalCommand without a command string");
            }
        }

        "specialFunction" => {
            if let Some(cmd) = pld.payload.command {
                execute_special_function(e, &cmd);
            } else {
                error!("Received special_function without a command string");
            }
        }
        _ => error!("Unknown action_type: {}", pld.action_type),
    }
}