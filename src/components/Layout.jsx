import { Outlet } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { Home as HomeIcon, Search, List, User } from "lucide-react";

function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
    >
      <Icon size={24} />
      <span>{label}</span>
    </NavLink>
  );
}

function LeftSidebar() {
  return (
    <div className="left-sidebar">
      <div className="nav-items">
        <NavItem to="/" icon={HomeIcon} label="Home" />
        <NavItem to="/search" icon={Search} label="Search" />
        <NavItem to="/lists" icon={List} label="Lists" />
        <NavItem to="/profile" icon={User} label="Profile" />
      </div>
    </div>
  );
}

function Layout() {
  return (
    <div className="app-layout">
      <LeftSidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
