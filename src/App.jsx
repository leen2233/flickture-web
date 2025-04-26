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
import Comments from "./pages/Comments";
import Lists from "./pages/Lists";
import ListDetail from "./pages/ListDetail";
import CreateList from "./pages/CreateList";
import PersonDetail from "./pages/PersonDetail";
import CollectionDetail from "./pages/CollectionDetail";
import GenreMovies from "./pages/GenreMovies";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

import "./App.css";
import "./styles/Lists.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SeasonDetails from "./pages/SeasonDetail";
import PublicProfile from "./pages/PublicProfile";
import Settings from "./pages/Settings";

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
        <Route path="/users/:username" element={<PublicProfile />} />
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
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route path="/search" element={<Search />} />
        <Route path="/:type/:tmdbId" element={<MovieDetail />} />
        <Route path="/:type/:movieId/comments" element={<Comments />} />
        <Route path="/:type/:tmdbId/episodes/" element={<SeasonDetails />} />
        <Route path="/person/:id" element={<PersonDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
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
        <Route path="collection/:id" element={<CollectionDetail />} />
        <Route path="genre/:tmdbId" element={<GenreMovies />} />
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
