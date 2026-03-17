import { NavLink, Outlet } from "react-router-dom";
import { InsightsPanel } from "@/app/layout/InsightsPanel";
import { Sidebar } from "@/app/layout/Sidebar";
import { mainNavigation } from "@/app/layout/navigation";

export function AppShell() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-surface">
        <nav className="mobile-nav" aria-label="Primary navigation">
          {mainNavigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            >
              <item.icon />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <Outlet />
      </div>
      <InsightsPanel />
    </div>
  );
}

