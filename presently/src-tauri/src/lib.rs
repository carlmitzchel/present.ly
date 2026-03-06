// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri_plugin_sql::Builder as SqlBuilder;

use tauri::{Manager, State};

mod remote_server;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_remote_url(port: State<'_, u16>) -> Result<String, String> {
    match local_ip_address::local_ip() {
        Ok(ip) => Ok(format!("http://{}:{}", ip, *port)),
        Err(e) => Err(e.to_string()),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let handle = app.handle().clone();
            let port = tauri::async_runtime::block_on(async {
                remote_server::start_server(handle).await
            });
            app.manage(port);
            Ok(())
        })
        .plugin(tauri_plugin_dialog::init()) 
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(SqlBuilder::default().build())
        .invoke_handler(tauri::generate_handler![greet, get_remote_url])
        .on_window_event(|window, event| match event {
            tauri::WindowEvent::CloseRequested { api, .. } => {
                if window.label() == "popout" {
                    window.hide().unwrap();
                    api.prevent_close();
                }
            }
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
