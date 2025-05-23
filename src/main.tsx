import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router"
import "./index.css"
import App from "./App"
import { Toaster } from "sonner"

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement)
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Toaster richColors position="top-right" />
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
