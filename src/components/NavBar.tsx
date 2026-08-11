import { NavLink } from "react-router-dom";
import { IdentityWidget } from "./IdentityWidget";

const LINKS = [
  { to: "/resume", label: "Résumé" },
  { to: "/scrape", label: "Scrape" },
  { to: "/search", label: "Search" },
  { to: "/saved", label: "Saved" },
];

export function NavBar() {
  return (
    <header className="nav">
      <div className="nav__brand">
        <span className="nav__logo" aria-hidden="true">
          ◆
        </span>
        Jobber
      </div>
      <nav className="nav__links">
        {LINKS.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) => `nav__link${isActive ? " nav__link--active" : ""}`}
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
      <IdentityWidget />
    </header>
  );
}
