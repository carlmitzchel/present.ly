import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import PopoutView from "@/features/teleprompter/components/PopoutView";
import { initDB } from "./lib/db";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { ThemeProvider } from "./components/theme-provider";

const init = async () => {
  const label = getCurrentWebviewWindow().label;

  if (label !== "popout") {
    try {
      await initDB();
      console.log("Database initialized");
    } catch (error) {
      console.error("Error initializing database:", error);
    }
  }

  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <ThemeProvider attribute="class" defaultTheme="dark">
        {label === "popout" ? <PopoutView /> : <App />}
      </ThemeProvider>
    </React.StrictMode>,
  );
};

init();
