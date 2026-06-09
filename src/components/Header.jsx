import { NavLink } from "react-router-dom";

export default function Header() {
  return (
    <header>
      <h1>Pokemon Tools</h1>
      <nav>
        <NavLink to="/pokedex">Pokedex</NavLink>
        <NavLink to="/teambuilder">Team Builder</NavLink>
      </nav>
    </header>
  );
}
