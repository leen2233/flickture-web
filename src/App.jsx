import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EditProfile from "./pages/EditProfile";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import "./App.css";

// Temporary auth check - replace with actual auth logic
const isAuthenticated = () => {
  return localStorage.getItem("isAuthenticated") === "true";
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/search" element={<div>Search Page</div>} />
          <Route path="/lists" element={<div>Lists Page</div>} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
