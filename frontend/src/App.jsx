import "./App.css";
import { ToastProvider } from "./context/ToastContext";
import Router from "./routes/Router";

function App() {
  return (
    <ToastProvider>
      <div className="flex flex-col min-h-screen">
        <Router />
      </div>
    </ToastProvider>
  )
}

export default App;
