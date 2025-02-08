import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EditProfile from "./pages/EditProfile";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Search from "./pages/Search";
import MovieDetail from "./pages/MovieDetail";
import MovieListPage from "./pages/MovieListPage";
import Comments from "./pages/Comments";
import Lists from "./pages/Lists";
import ListDetail from "./pages/ListDetail";
import CreateList from "./pages/CreateList";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

import "./App.css";
import "./styles/Lists.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-profile"
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />
        <Route path="/search" element={<Search />} />
        <Route path="/movie/:tmdbId" element={<MovieDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/movies/:type" element={<MovieListPage />} />
        <Route path="/movie/:movieId/comments" element={<Comments />} />

        <Route path="lists" element={<Lists />} />
        <Route path="lists/:id" element={<ListDetail />} />
        <Route
          path="lists/create"
          element={
            <ProtectedRoute>
              <CreateList />
            </ProtectedRoute>
          }
        />
        <Route
          path="lists/:id/edit"
          element={
            <ProtectedRoute>
              <CreateList isEditing />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <ToastContainer />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
