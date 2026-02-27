import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { initDB } from "./lib/db";

initDB()
  .then(() => {
    console.log("Database initialized");
  })
  .catch((error) => {
    console.error("Error initializing database:", error);
  });

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
