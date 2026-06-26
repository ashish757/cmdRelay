use crate::types::ClientPayload;
use crate::input::{execute_keypress, execute_trackpad_move};
use log::error;

#[allow(non_snake_case)]
pub fn route_action(pld: ClientPayload) {
    if pld.actionType == "keyPress" {
        if let Some(key) = pld.payload.keyId {
            execute_keypress(&key);
        }
    } else if pld.actionType == "mouseMove" {
        if let (Some(dx), Some(dy)) = (pld.payload.dx, pld.payload.dy) {
            execute_trackpad_move(dx, dy);
        }
    } else {
        error!("{}", pld.actionType);
    }
}