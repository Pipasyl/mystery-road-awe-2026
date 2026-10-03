import { createRoot } from "react-dom/client";
import App from "./App";

const rootElement = document.getElementById("react-root");
if (!rootElement) throw new Error("#react-root not found in react.html");

createRoot(rootElement).render(<App />);