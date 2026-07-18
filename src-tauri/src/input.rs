use enigo::{Enigo, Key, KeyboardControllable, MouseButton, MouseControllable};
use log::{info, error};

use crate::types::KeyAction;



pub fn parse_key(key_id: &str) -> Option<Key> {
    let chars: Vec<char> = key_id.chars().collect();
    if chars.len() == 1 {
        return Some(Key::Layout(chars[0]));
    }

    match key_id {
        "Escape" | "Esc" => Some(Key::Escape),
        "Shift" => Some(Key::Shift),
        "Control" => Some(Key::Control),
        "Alt" => Some(Key::Alt),
        "Meta" | "OS" => Some(Key::Meta),
        "ArrowLeft" | "Left" => Some(Key::LeftArrow),
        "ArrowRight" | "Right" => Some(Key::RightArrow),
        "ArrowUp" | "Up" => Some(Key::UpArrow),
        "ArrowDown" | "Down" => Some(Key::DownArrow),
        "Backspace" => Some(Key::Backspace),
        "Enter" => Some(Key::Return),
        "Space" | " " => Some(Key::Space),
        "Tab" => Some(Key::Tab),
        "CapsLock" => Some(Key::CapsLock),
        "F1" => Some(Key::F1),
        "F2" => Some(Key::F2),

        _ => None,
    }
}

pub fn execute_keypress(e: &mut Enigo, key_id: &str, action: KeyAction) {
    if let Some(enigo_key) = parse_key(key_id) {
        match action {
            KeyAction::Down => {
                info!("Holding down: {}", key_id);
                e.key_down(enigo_key);
            }
            KeyAction::Up => {
                info!("Releasing: {}", key_id);
                e.key_up(enigo_key);
            }
            KeyAction::Click => {
                info!("Clicking: {}", key_id);
                e.key_click(enigo_key);
            }
        }
    } else {
        error!("Unknown key received from client: {}", key_id);
    }
}

pub fn execute_trackpad_move(e: &mut Enigo, dx: f64, dy: f64){
    let sensitivity =  2.5;
    let move_x = (dx * sensitivity).round() as i32;
    let move_y = (dy * sensitivity).round() as i32;

    e.mouse_move_relative(move_x, move_y);
}

pub fn execute_text(e: &mut Enigo, text: &str){

    e.key_sequence(text);
}

pub fn single_click(e: &mut Enigo, ) {
    info!("single click");
    e.mouse_click(MouseButton::Left);
}

pub fn double_click(e: &mut Enigo, ) {
    info!("double click");
    e.mouse_click(MouseButton::Left);
    e.mouse_click(MouseButton::Left);
}

pub fn secondary_click(e: &mut Enigo, ) {
    info!("secondary click");
    e.mouse_click(MouseButton::Right);
}

pub fn scroll(e: &mut Enigo, dx: i32, dy: i32) {
    info!("scroll");
    e.mouse_scroll_x(dx);
    e.mouse_scroll_y(dy);
}

pub fn drag_start(e: &mut Enigo) {
    e.mouse_down(MouseButton::Left);
}

pub fn drag_end(e: &mut Enigo) {
    e.mouse_up(MouseButton::Left);
}