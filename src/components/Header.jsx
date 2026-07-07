import { useState } from "react";
import { NavLink } from "react-router-dom";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header>
      <h1>VGC tools</h1>
      <nav className="desktop-nav">
        <NavLink to="/pokedex">Pokedex</NavLink>
        <NavLink to="/teambuilder">Team Builder</NavLink>
        <NavLink to="/calculator">Calculator</NavLink>
      </nav>
      <button
        className="hamburger"
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Toggle navigation"
        aria-expanded={menuOpen}
      >
        ☰
      </button>
      {menuOpen && (
        <nav className="mobile-overlay">
          <button
            className="mobile-overlay-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation"
          >
            ✕
          </button>
          <NavLink to="/pokedex" onClick={() => setMenuOpen(false)}>
            Pokedex
          </NavLink>
          <NavLink to="/teambuilder" onClick={() => setMenuOpen(false)}>
            Team Builder
          </NavLink>
          <NavLink to="/calculator" onClick={() => setMenuOpen(false)}>
            Calculator
          </NavLink>
        </nav>
      )}
    </header>
  );
}
