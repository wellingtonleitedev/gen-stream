import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppProvider } from "./provider";
import { Layout } from "@/components/layout";
import { HomePage } from "@/pages/home";
import { LoginPage } from "@/pages/login";

export function App() {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
}
