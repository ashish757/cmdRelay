use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClientPayload {
    pub action_type: String,
    pub payload: PayloadData,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PayloadData {
    pub id: Option<String>,
    pub key_id: Option<String>,
    pub app_id: Option<String>,
    pub state: Option<String>,
    pub steps: Option<Vec<MacroStep>>,
    pub dx: Option<f64>,
    pub dy: Option<f64>,
    pub text: Option<String>,
    pub name: Option<String>,
    pub layouts: Option<serde_json::Value>,
    pub settings: Option<serde_json::Value>,
    pub command: Option<String>,
    pub in_background: Option<bool>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct MacroStep {
    pub id: String,
    pub state: String,
    pub key_id: String,
}



pub enum KeyAction {
    Down,
    Up,
    Click,
}



#[derive(Debug, Deserialize, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DiscoverySettings {
    pub known_apps: Vec<String>,
}

impl Default for DiscoverySettings {
    fn default() -> Self {
        Self {
            known_apps: Vec::new(),
        }
    }
}

#[derive(Debug, Deserialize, Serialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    #[serde(default)]
    pub discovery: DiscoverySettings,
}