import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import PopoutView from "./components/PopoutView";
import { initDB } from "./lib/db";

const isPopout = new URLSearchParams(window.location.search).has("popout");

if (!isPopout) {
  initDB()
    .then(() => console.log("Database initialized"))
    .catch((error) => console.error("Error initializing database:", error));
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>{isPopout ? <PopoutView /> : <App />}</React.StrictMode>,
);
