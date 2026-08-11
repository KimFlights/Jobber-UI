import { Outlet } from "react-router-dom";
import { NavBar } from "./NavBar";

/** App shell: persistent nav + routed page content. */
export function Layout() {
  return (
    <div className="app">
      <NavBar />
      <main className="app__main">
        <Outlet />
      </main>
      <footer className="app__footer">
        Jobber UI · talks to the gateway via the Vite dev-proxy (<code>/gw</code>,{" "}
        <code>/scraper</code>)
      </footer>
    </div>
  );
}
