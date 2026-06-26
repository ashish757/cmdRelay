use enigo::{Enigo, Key, KeyboardControllable, MouseControllable};
use log::{info, error};


pub fn execute_keypress(key_id: &str){
    info!("Key pressed:  {}", key_id);
    let mut enigo = Enigo::new();
    match key_id {
        "ArrowLeft" => enigo.key_down(Key::LeftArrow),
        "ArrowRight" => enigo.key_down(Key::RightArrow),
        "ArrowUp" => enigo.key_down(Key::UpArrow),
        "ArrowDown" => enigo.key_down(Key::DownArrow),
        "Backspace" => enigo.key_click(Key::Backspace),
        "Enter" => enigo.key_click(Key::Return),
        "Space" => enigo.key_click(Key::Space),
        _ => error!("Unknown key: {}", key_id)
    }
}

pub fn execute_trackpad_move(dx: f64, dy: f64){
    let mut enigo = Enigo::new();

    let sensitivity =  2.5;
    let move_x = (dx * sensitivity).round() as i32;
    let move_y = (dy * sensitivity).round() as i32;

    enigo.mouse_move_relative(move_x, move_y);
}

pub fn execute_text(text: &str){
    let mut enigo = Enigo::new();

    enigo.key_sequence(text);
}