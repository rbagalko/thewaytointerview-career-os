import { NavLink, Outlet } from "react-router-dom";
import { InsightsPanel } from "@/app/layout/InsightsPanel";
import { mobileNavigation } from "@/app/layout/navigation";
import { Sidebar } from "@/app/layout/Sidebar";

export function AppShell() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-surface">
        <nav className="mobile-nav" aria-label="Primary navigation">
          {mobileNavigation.map((item) => (
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
