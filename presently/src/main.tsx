import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import PopoutView from "./components/PopoutView";
import { initDB } from "./lib/db";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

const label = getCurrentWebviewWindow().label;

if (label !== "popout") {
  initDB()
    .then(() => console.log("Database initialized"))
    .catch((error) => console.error("Error initializing database:", error));
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    {label === "popout" ? <PopoutView /> : <App />}
  </React.StrictMode>,
);
