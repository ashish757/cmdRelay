use enigo::{Enigo, Key, KeyboardControllable};
use log::{info, error};


pub fn execute_keypress(key_id: &str){
    info!("Key pressed:  {}", key_id);
    let mut enigo = Enigo::new();
    match key_id {
        "ArrowLeft" => enigo.key_up(Key::LeftArrow),
        "ArrowRight" => enigo.key_down(Key::RightArrow),
        "ArrowUp" => enigo.key_up(Key::UpArrow),
        "ArrowDown" => enigo.key_down(Key::DownArrow),
        _ => error!("Unknown key: {}", key_id)
    }
}

pub fn execute_trackpad_move(dx: f64, dy: f64){

    info!("Trackpad move:  {}, {}", dx, dy);

}