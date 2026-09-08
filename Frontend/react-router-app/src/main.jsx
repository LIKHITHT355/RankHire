import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

// This is the starting point of the app.
// It finds the empty box in index.html and draws the
// whole application inside it, along with the stylesheet.
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
