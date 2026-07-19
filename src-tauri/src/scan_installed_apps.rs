use std::fs;

pub fn scan_installed_apps() -> Vec<String> {
    let mut apps = Vec::new();

    let paths = ["/Applications", "/System/Applications"];

    for path in paths.iter() {
        if let Ok(entries) = fs::read_dir(path) {
            for entry in entries.flatten() {
                let file_name = entry.file_name().into_string().unwrap_or_default();
                // Only grab actual application bundles
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