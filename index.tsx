import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { LanguageProvider } from "./LanguageContext";

const rootElement = document.getElementById("root");

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <LanguageProvider>
      <App />
    </LanguageProvider>
  );
} else {
  console.error("Failed to find the root element. App cannot mount.");
}