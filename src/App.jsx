import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header.jsx";

const PokedexPage = lazy(() => import("./pages/PokedexPage.jsx"));
const TeamBuilderPage = lazy(() => import("./pages/TeamBuilderPage.jsx"));
const TeamDetailPage = lazy(() => import("./pages/TeamDetailPage.jsx"));
const DamageCalcPage = lazy(() => import("./pages/DamageCalcPage.jsx"));

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
            <Route path="/teambuilder/:id" element={<TeamDetailPage />} />
            <Route path="/teambuilder/:id/:slot" element={<TeamDetailPage />} />
            <Route path="/calculator" element={<DamageCalcPage />} />
            <Route path="*" element={<Navigate to="/pokedex" replace />} />
          </Routes>
        </Suspense>
      </main>
    </>
  );
}
