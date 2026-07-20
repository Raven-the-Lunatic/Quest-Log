import React from "react";
import ReactDOM from "react-dom/client";
import QuestLog from "./QuestLog.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QuestLog />
  </React.StrictMode>
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // offline support is a progressive enhancement — ignore registration failures
    });
  });
}
