import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header.jsx";

const PokedexPage = lazy(() => import("./pages/PokedexPage.jsx"));
const TeamBuilderPage = lazy(() => import("./pages/TeamBuilderPage.jsx"));

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Suspense fallback={<div className="loading-text">Loading…</div>}>
          <Routes>
            <Route path="/" element={<Navigate to="/pokedex" replace />} />
            <Route path="/pokedex" element={<PokedexPage />} />
            <Route path="/teambuilder" element={<TeamBuilderPage />} />
            <Route path="*" element={<Navigate to="/pokedex" replace />} />
          </Routes>
        </Suspense>
      </main>
    </>
  );
}
