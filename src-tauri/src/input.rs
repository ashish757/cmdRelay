use enigo::{Enigo, Key, KeyboardControllable, MouseButton, MouseControllable};
use log::{info, error};


pub fn execute_keypress(e: &mut Enigo, key_id: &str){
    info!("Key pressed:  {}", key_id);
    match key_id {
        "ArrowLeft" => e.key_down(Key::LeftArrow),
        "ArrowRight" => e.key_down(Key::RightArrow),
        "ArrowUp" => e.key_down(Key::UpArrow),
        "ArrowDown" => e.key_down(Key::DownArrow),
        "Backspace" => e.key_click(Key::Backspace),
        "Enter" => e.key_click(Key::Return),
        "Space" => e.key_click(Key::Space),
        _ => error!("Unknown key: {}", key_id)
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