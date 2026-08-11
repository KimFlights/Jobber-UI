import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { ResumePage } from "@/pages/ResumePage";
import { ScrapePage } from "@/pages/ScrapePage";
import { SearchPage } from "@/pages/SearchPage";
import { SavedPage } from "@/pages/SavedPage";

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/resume" replace />} />
        <Route path="/resume" element={<ResumePage />} />
        <Route path="/scrape" element={<ScrapePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/saved" element={<SavedPage />} />
        <Route path="*" element={<Navigate to="/resume" replace />} />
      </Route>
    </Routes>
  );
}
