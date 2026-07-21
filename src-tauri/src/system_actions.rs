use enigo::{Enigo, Key, KeyboardControllable, MouseButton, MouseControllable};
use log::{info, error};
use std::process::Command;

use crate::types::KeyAction;



pub fn parse_key(key_id: &str) -> Option<Key> {
    match key_id {
        "Digit0" => Some(Key::Raw(29)),
        "Digit1" => Some(Key::Raw(18)),
        "Digit2" => Some(Key::Raw(19)),
        "Digit3" => Some(Key::Raw(20)),
        "Digit4" => Some(Key::Raw(21)),
        "Digit5" => Some(Key::Raw(23)),
        "Digit6" => Some(Key::Raw(22)),
        "Digit7" => Some(Key::Raw(26)),
        "Digit8" => Some(Key::Raw(28)),
        "Digit9" => Some(Key::Raw(25)),

        "Numpad0" => Some(Key::Raw(82)),
        "Numpad1" => Some(Key::Raw(83)),
        "Numpad2" => Some(Key::Raw(84)),
        "Numpad3" => Some(Key::Raw(85)),
        "Numpad4" => Some(Key::Raw(86)),
        "Numpad5" => Some(Key::Raw(87)),
        "Numpad6" => Some(Key::Raw(88)),
        "Numpad7" => Some(Key::Raw(89)),
        "Numpad8" => Some(Key::Raw(91)),
        "Numpad9" => Some(Key::Raw(92)),

        "MetaLeft" | "MetaRight" | "Meta" => Some(Key::Meta),
        "ShiftLeft" | "ShiftRight" | "Shift" => Some(Key::Shift),
        "ControlLeft" | "ControlRight" | "Control" => Some(Key::Control),
        "AltLeft" | "AltRight" | "Alt" => Some(Key::Alt),


        "Escape" => Some(Key::Escape),
        "Backspace" => Some(Key::Backspace),
        "Enter" => Some(Key::Return),
        "Space" => Some(Key::Space),
        "Tab" => Some(Key::Tab),
        "CapsLock" => Some(Key::CapsLock),
        "ArrowUp" => Some(Key::UpArrow),
        "ArrowDown" => Some(Key::DownArrow),
        "ArrowLeft" => Some(Key::LeftArrow),
        "ArrowRight" => Some(Key::RightArrow),
        "F1" => Some(Key::F1),
        "F2" => Some(Key::F2),
        "F3" => Some(Key::F3),
        "F4" => Some(Key::F4),

        // --- 5. Dynamic Fallback (KeyA -> 'A', KeyZ -> 'Z') ---
        id if id.starts_with("Key") => {
            id.chars().last().map(|c| Key::Layout(c))
        },

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



pub fn execute_terminal_command(command: &str, in_background: bool) {
    if in_background {
        info!("Executing background shell command: {}", command);

        // Spawn a non-blocking background child process on macOS/Linux
        if let Err(e) = Command::new("sh")
            .arg("-c")
            .arg(command)
            .spawn()
        {
            error!("Failed to run background command: {}", e);
        }
    } else {
        info!("Launching Terminal.app with command: {}", command);

        // Sanitize double quotes and backslashes so AppleScript doesn't break
        let escaped_cmd = command.replace('\\', "\\\\").replace('"', "\\\"");

        // AppleScript to open Terminal, execute command, and bring window to front
        let script = format!(
            "tell application \"Terminal\"\n do script \"{}\"\n activate\nend tell",
            escaped_cmd
        );

        if let Err(e) = Command::new("osascript")
            .arg("-e")
            .arg(&script)
            .spawn()
        {
            error!("Failed to launch Terminal via osascript: {}", e);
        }
    }
}