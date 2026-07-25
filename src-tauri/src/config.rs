use directories::ProjectDirs;
use std::fs;
use std::io;
use std::path::PathBuf;

#[cfg(target_os = "macos")]
const DEFAULT_LAYOUTS: &str = include_str!("../templates/default_layouts_mac.json");

#[cfg(target_os = "windows")]
const DEFAULT_LAYOUTS: &str = include_str!("../templates/default_layouts_win.json");

fn get_config_dir() -> PathBuf {
    if let Some(proj_dirs) = ProjectDirs::from("com", "cmdRelay", "app") {
        proj_dirs.config_dir().to_path_buf()
    } else {
        PathBuf::from(".")
    }
}

pub fn initialize_layouts() -> io::Result<PathBuf> {
    let config_dir = get_config_dir();

    if !config_dir.exists() {
        fs::create_dir_all(&config_dir)?;
        log::info!("Created config directory at {:?}", config_dir);
    }

    let layouts_path = config_dir.join("layouts.json");

    if !layouts_path.exists() {
        fs::write(&layouts_path, DEFAULT_LAYOUTS)?;
        log::info!("Initialized default layouts at {:?}", layouts_path);
    }

    Ok(layouts_path)
}


pub fn read_layouts() -> io::Result<String> {
    let layouts_path = get_config_dir().join("layouts.json");
    fs::read_to_string(layouts_path)
}

pub fn save_layouts(new_json: &str) -> io::Result<()> {
    let layouts_path = get_config_dir().join("layouts.json");
    fs::write(layouts_path, new_json)
}

pub fn read_settings() -> io::Result<String> {
    let settings_path = get_config_dir().join("settings.json");
    fs::read_to_string(settings_path)
}

pub fn save_settings(new_json: &str) -> io::Result<()> {
    let settings_path = get_config_dir().join("settings.json");
    fs::write(settings_path, new_json)
}