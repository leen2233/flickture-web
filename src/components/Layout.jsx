import { Link, Outlet } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { Home as HomeIcon, Search, List, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

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
  const { isAuthenticated } = useAuth();

  return (
    <div className="left-sidebar">
      <Link to={"/"}>
        <img src="/logo-landscape.png" className="landscape-logo" />
      </Link>
      <div className="nav-items">
        <NavItem to="/" icon={HomeIcon} label="Home" />
        <NavItem to="/search" icon={Search} label="Search" />
        <NavItem to="/lists" icon={List} label="Lists" />
        {isAuthenticated && (
          <NavItem to="/profile" icon={User} label="Profile" />
        )}
      </div>
      <div className="sidebar-footer">
        {!isAuthenticated ? (
          <div className="auth-buttons">
            <NavLink to="/login" className="auth-button login">
              Log In
            </NavLink>
            <NavLink to="/register" className="auth-button signup">
              Sign Up
            </NavLink>
          </div>
        ) : null}
        <div className="footer-links">
          <NavLink to="/about" className="footer-link">
            About
          </NavLink>
          <NavLink to="/privacy" className="footer-link">
            Privacy Policy
          </NavLink>
        </div>
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
