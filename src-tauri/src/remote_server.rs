use axum::{
    extract::ws::{Message, WebSocket, WebSocketUpgrade},
    response::{Html, IntoResponse},
    routing::get,
    Router,
};
use tauri::{AppHandle, Emitter};

const MOBILE_UI: &str = r#"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Present.ly Remote</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #000; color: white; display: flex; flex-direction: column; height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; flex: 1; margin-top: 10px; }
        button { background: #222; color: white; border: 1px solid #444; border-radius: 12px; font-size: 20px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; touch-action: manipulation; transition: background 0.1s; }
        button:active { background: #444; }
        .full-width { grid-column: 1 / -1; background: #e65100; font-size: 28px; border: none; }
        .full-width:active { background: #ff9800; border: none; }
        .status { text-align: center; padding: 5px; color: #aaa; font-size: 14px; height: 20px; }
    </style>
</head>
<body>
    <div class="status" id="status">Connecting...</div>
    <div class="grid">
        <button class="full-width" onclick="send('play_pause')">Play / Pause</button>
        <button onclick="send('speed_up')">Speed +</button>
        <button onclick="send('speed_down')">Speed -</button>
        <button onclick="send('font_up')">Font +</button>
        <button onclick="send('font_down')">Font -</button>
        <button onclick="send('scroll_up')">Scroll Up</button>
        <button onclick="send('scroll_down')">Scroll Down</button>
    </div>
    <script>
        const statusEl = document.getElementById('status');
        let ws;
        function connect() {
            const proto = location.protocol === 'https:' ? 'wss' : 'ws';
            ws = new WebSocket(`${proto}://${location.host}/ws`);
            ws.onopen = () => statusEl.innerText = 'Connected to Present.ly';
            ws.onclose = () => { statusEl.innerText = 'Disconnected - Reconnecting...'; setTimeout(connect, 1000); };
            ws.onerror = () => statusEl.innerText = 'Error connecting';
        }
        function send(cmd) {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(cmd);
                if (navigator.vibrate) navigator.vibrate(50);
            }
        }
        connect();
    </script>
</body>
</html>
"#;

async fn handler() -> Html<&'static str> {
    Html(MOBILE_UI)
}

async fn ws_handler(
    ws: WebSocketUpgrade,
    axum::extract::State(app_handle): axum::extract::State<AppHandle>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_socket(socket, app_handle))
}

async fn handle_socket(mut socket: WebSocket, app_handle: AppHandle) {
    while let Some(Ok(Message::Text(text))) = socket.recv().await {
        // Emit the event to the frontend. E.g., remote-play_pause
        let event_name = format!("remote-{}", text);
        let _ = app_handle.emit(&event_name, ());
    }
}

pub async fn start_server(app_handle: AppHandle) -> u16 {
    let app = Router::new()
        .route("/", get(handler))
        .route("/ws", get(ws_handler))
        .with_state(app_handle);

    // Bind to 0.0.0.0 on a random available port
    let listener = tokio::net::TcpListener::bind("0.0.0.0:0").await.unwrap();
    let port = listener.local_addr().unwrap().port();

    tokio::spawn(async move {
        axum::serve(listener, app).await.unwrap();
    });

    port
}
