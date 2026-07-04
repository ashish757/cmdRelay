use crate::types::ClientPayload;
use crate::input::{double_click, drag_end, drag_start, execute_keypress, execute_text, execute_trackpad_move, scroll, secondary_click, single_click};
use log::{error, info};
use enigo::Enigo;
use std::fs;

#[allow(non_snake_case)]
pub fn route_action(e: &mut Enigo, pld: ClientPayload) {
    if pld.actionType == "keyPress" {
        if let Some(key) = pld.payload.keyId {
            execute_keypress(e, &key);
        }
    } else if pld.actionType == "mouseMove" {
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