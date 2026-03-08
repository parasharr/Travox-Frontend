import { createRoot } from "react-dom/client";
import "./input.css";
import App from "./App.jsx";
import ErrorBoundary from "./ErrorBoundary.jsx";
import { LanguageProvider } from "./LanguageContext.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ErrorBoundary>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ErrorBoundary>
  </BrowserRouter>
);
