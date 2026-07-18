use serde::{Deserialize, Serialize};

#[allow(non_snake_case)]
#[derive(Debug, Deserialize, Serialize)]
pub struct PayloadData {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub keyId: Option<String>,
    
    #[serde(skip_serializing_if = "Option::is_none")]
    pub state: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub dx: Option<f64>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub dy: Option<f64>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub text: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub layouts: Option<serde_json::Value>,
}

#[allow(non_snake_case)]
#[derive(Debug, Deserialize)]
pub struct ClientPayload {
    pub actionType: String,
    pub payload: PayloadData,
}


pub enum KeyAction {
    Down,
    Up,
    Click,
}
