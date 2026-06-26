use serde::{Deserialize, Serialize};
use std::fs;

#[derive(Serialize, Deserialize)]
pub struct SaveFileRequest {
    pub content: String,
    pub default_name: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct ScreenshotRegion {
    pub x: Option<u32>,
    pub y: Option<u32>,
    pub width: Option<u32>,
    pub height: Option<u32>,
}

#[tauri::command]
pub async fn save_file(request: SaveFileRequest) -> Result<String, String> {
    let file_name = request.default_name.unwrap_or_else(|| "untitled.txt".into());
    let file_path = std::env::temp_dir().join(&file_name);

    fs::write(&file_path, &request.content).map_err(|e| e.to_string())?;

    Ok(file_path.to_string_lossy().to_string())
}

#[tauri::command]
pub async fn capture_screenshot(region: Option<ScreenshotRegion>) -> Result<String, String> {
    let monitors = xcap::Monitor::all().map_err(|e| format!("Failed to list monitors: {}", e))?;

    let monitor = monitors
        .into_iter()
        .next()
        .ok_or("No monitor found".to_string())?;

    let image = if let Some(r) = region {
        let x = r.x.unwrap_or(0);
        let y = r.y.unwrap_or(0);
        let w = r.width.unwrap_or(monitor.width().map_err(|e| format!("Width error: {}", e))?);
        let h = r.height.unwrap_or(monitor.height().map_err(|e| format!("Height error: {}", e))?);
        monitor
            .capture_region(x, y, w, h)
            .map_err(|e| format!("Region capture failed: {}", e))?
    } else {
        monitor
            .capture_image()
            .map_err(|e| format!("Capture failed: {}", e))?
    };

    let temp_dir = std::env::temp_dir();
    let file_name = format!(
        "devtoolkit-screenshot-{}.png",
        chrono::Utc::now().timestamp_millis()
    );
    let file_path = temp_dir.join(&file_name);

    image
        .save(&file_path)
        .map_err(|e| format!("Save failed: {}", e))?;

    Ok(file_path.to_string_lossy().to_string())
}

/// Read a text file and return its contents
#[tauri::command]
pub async fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| format!("Read failed: {}", e))
}
