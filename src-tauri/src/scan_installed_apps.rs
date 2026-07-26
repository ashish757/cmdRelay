use std::fs;

#[cfg(target_os = "macos")]
pub fn scan_installed_apps() -> Vec<String> {
    let mut apps = Vec::new();
    let paths = ["/Applications", "/System/Applications"];
    for path in paths.iter() {
        if let Ok(entries) = fs::read_dir(path) {
            for entry in entries.flatten() {
                let file_name = entry.file_name().into_string().unwrap_or_default();
                if file_name.ends_with(".app") {
                    apps.push(file_name.replace(".app", ""));
                }
            }
        }
    }
    apps.sort();
    apps.dedup();
    apps
}

#[cfg(target_os = "windows")]
pub fn scan_installed_apps() -> Vec<String> {
    let mut apps = Vec::new();
    let paths = ["C:\\Program Files", "C:\\Program Files (x86)"];
    for path in paths.iter() {
        if let Ok(entries) = fs::read_dir(path) {
            for entry in entries.flatten() {
                if let Ok(file_type) = entry.file_type() {
                    if file_type.is_dir() {
                        apps.push(entry.file_name().into_string().unwrap_or_default());
                    }
                }
            }
        }
    }
    apps.sort();
    apps.dedup();
    apps
}

#[cfg(target_os = "linux")]
pub fn scan_installed_apps() -> Vec<String> {
    let mut apps = Vec::new();
    let paths = ["/usr/share/applications", "/usr/local/share/applications"];
    for path in paths.iter() {
        if let Ok(entries) = fs::read_dir(path) {
            for entry in entries.flatten() {
                let file_name = entry.file_name().into_string().unwrap_or_default();
                if file_name.ends_with(".desktop") {
                    apps.push(file_name.replace(".desktop", ""));
                }
            }
        }
    }
    apps.sort();
    apps.dedup();
    apps
}