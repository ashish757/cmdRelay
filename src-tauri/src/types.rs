use serde::Deserialize;

#[allow(non_snake_case)]
#[derive(Debug, Deserialize)]
pub struct PayloadData{
    pub keyId: Option<String>,
    pub dx: Option<f64>,
    pub dy: Option<f64>,
}

#[allow(non_snake_case)]
#[derive(Debug, Deserialize)]
pub struct ClientPayload {
    pub actionType: String,
    pub payload: PayloadData,
}