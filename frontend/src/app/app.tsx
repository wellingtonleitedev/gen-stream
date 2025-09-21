import { Router } from "./router";
import { AppProvider } from "./provider";

export function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}
