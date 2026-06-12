mod code_runner;
pub mod pdf_parser;

use code_runner::{run_code as do_run_code, RunResult};
use pdf_parser::{parse_pdf, Course};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

#[derive(Serialize, Deserialize, Clone, Debug, Default)]
pub struct ProgressData {
    pub completed_concepts: Vec<String>,
    pub passed_exercises: Vec<String>,
    pub quiz_scores: Vec<(String, u32)>,
}

fn find_pdf(app: &tauri::AppHandle, id: usize) -> PathBuf {
    let filename = format!("Course-{id}.pdf");

    // Production: resources are bundled next to the binary
    if let Ok(rd) = app.path().resource_dir() {
        let p = rd.join(&filename);
        if p.exists() {
            return p;
        }
    }

    // Development: PDFs sit two directories above src-tauri/
    // CARGO_MANIFEST_DIR is the absolute path to src-tauri/ at compile time
    let dev_path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../..")
        .join(&filename);
    if dev_path.exists() {
        return dev_path;
    }

    PathBuf::from(format!("../../{filename}"))
}

#[tauri::command]
async fn parse_courses(app: tauri::AppHandle) -> Result<Vec<Course>, String> {
    tauri::async_runtime::spawn_blocking(move || {
        (1..=12)
            .map(|i| {
                let pdf_path = find_pdf(&app, i);
                parse_pdf(&pdf_path, i)
            })
            .collect()
    })
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
fn run_code(user_code: String, test_harness: String) -> RunResult {
    do_run_code(&user_code, &test_harness)
}

#[tauri::command]
fn save_progress(app: tauri::AppHandle, progress: ProgressData) -> Result<(), String> {
    let data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;
    fs::create_dir_all(&data_dir).map_err(|e| e.to_string())?;
    let path = data_dir.join("progress.json");
    let json = serde_json::to_string_pretty(&progress).map_err(|e| e.to_string())?;
    fs::write(path, json).map_err(|e| e.to_string())
}

#[tauri::command]
fn load_progress(app: tauri::AppHandle) -> ProgressData {
    let Ok(data_dir) = app.path().app_data_dir() else {
        return ProgressData::default();
    };
    let path = data_dir.join("progress.json");
    let Ok(contents) = fs::read_to_string(path) else {
        return ProgressData::default();
    };
    serde_json::from_str(&contents).unwrap_or_default()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            parse_courses,
            run_code,
            save_progress,
            load_progress
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
