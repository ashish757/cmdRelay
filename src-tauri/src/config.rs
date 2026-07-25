use directories::ProjectDirs;
use std::fs;
use std::io;
use std::path::PathBuf;

#[cfg(target_os = "macos")]
const DEFAULT_LAYOUTS: &str = include_str!("../templates/default_layouts_mac.json");

#[cfg(target_os = "windows")]
const DEFAULT_LAYOUTS: &str = include_str!("../templates/default_layouts_win.json");

fn get_config_dir() -> PathBuf {
    if let Some(proj_dirs) = ProjectDirs::from("com", "yourorg", "macropad") {
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
    } else {
        if let Err(e) = merge_missing_defaults(&layouts_path) {
            log::error!("Failed to merge missing default layouts: {}", e);
        }
    }

    Ok(layouts_path)
}

fn merge_missing_defaults(file_path: &PathBuf) -> io::Result<()> {
    let user_content = fs::read_to_string(file_path)?;

    let mut user_layouts: Vec<serde_json::Value> = serde_json::from_str(&user_content)
        .unwrap_or_else(|_| Vec::new());

    let default_layouts: Vec<serde_json::Value> = serde_json::from_str(DEFAULT_LAYOUTS)
        .unwrap_or_else(|_| Vec::new());

    let mut modified = false;

    let existing_ids: std::collections::HashSet<String> = user_layouts.iter()
        .filter_map(|l| l.get("id").and_then(|id| id.as_str()).map(String::from))
        .collect();

    for default_layout in default_layouts {
        if let Some(def_id) = default_layout.get("id").and_then(|id| id.as_str()) {
            if !existing_ids.contains(def_id) {
                log::info!("Adding missing new default layout: {}", def_id);
                user_layouts.push(default_layout);
                modified = true;
            }
        }
    }

    if modified {
        let new_json = serde_json::to_string_pretty(&user_layouts)
            .map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))?;
        fs::write(file_path, new_json)?;
        log::info!("Successfully merged new default layouts into user config");
    }

    Ok(())
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