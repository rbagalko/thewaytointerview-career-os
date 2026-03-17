import { LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/app/auth/AuthProvider";
import { Button } from "@/components/Button";
import { mainNavigation, secondaryNavigation } from "@/app/layout/navigation";
import { env } from "@/lib/env";

function NavigationGroup({
  label,
  items
}: {
  label: string;
  items: typeof mainNavigation;
}) {
  return (
    <section className="nav-group">
      <p className="nav-label">{label}</p>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
          >
            <Icon />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </section>
  );
}

export function Sidebar() {
  const { isConfigured, user, signOut } = useAuth();

  return (
    <aside className="sidebar">
      <div className="brand-lockup">
        <span className="brand-chip">Career OS</span>
        <h1 className="brand-title">{env.appName}</h1>
        <p className="brand-subtitle">
          Skill gap, learning, proof of work, applications, and interview prep in one cockpit.
        </p>
      </div>
      <NavigationGroup label="Operate" items={mainNavigation} />
      <NavigationGroup label="Setup" items={secondaryNavigation} />
      {isConfigured && user ? (
        <div className="insight-block" style={{ marginTop: "auto" }}>
          <h3>Signed in</h3>
          <p className="muted-copy">{user.email}</p>
          <Button variant="ghost" onClick={() => void signOut()}>
            <LogOut size={16} />
            Sign out
          </Button>
        </div>
      ) : null}
      <div className="footer-note">
        Live Career OS workspace.
        <br />
        Supabase-backed product with Cloudflare deployment.
      </div>
    </aside>
  );
}
