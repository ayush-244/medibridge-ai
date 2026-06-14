import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { AppRoutes } from "@/routes";

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster
          position="top-right"
          richColors
          closeButton
          expand
          duration={5000}
          visibleToasts={5}
          toastOptions={{
            classNames: {
              toast: "font-sans",
            },
          }}
        />
    </BrowserRouter>
  );
}

export default App;
