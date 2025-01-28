import { useState, useEffect } from "react";
import {
  Home as HomeIcon,
  Search,
  List,
  User,
  Edit2,
  Settings,
  ChevronRight,
} from "lucide-react";
import sampleData from "../data/sample.json"; // You'll need to create this

function StatBox({ label, value, onPress }) {
  return (
    <button onClick={onPress} className="stat-box">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </button>
  );
}

function MovieList({ title, count, movies, onSeeAll }) {
  return (
    <div className="movie-list">
      <div className="movie-list-header">
        <h2>{title}</h2>
        <button onClick={onSeeAll} className="see-all-btn">
          <span>See all {count}</span>
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="movies-scroll">
        {movies?.map((movie) => (
          <div key={movie.id} className="movie-card">
            <div className="movie-poster">
              <img src={movie.poster} alt={movie.title} />
            </div>
            <span className="movie-title">{movie.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileContent() {
  // You'll need to replace this with actual data
  const mockUser = {
    firstName: "John",
    lastName: "Doe",
    username: "johndoe",
    avatar: "https://picsum.photos/200",
    banner: "https://picsum.photos/1600/900",
    stats: {
      moviesWatched: 142,
      following: 234,
      followers: 567,
    },
  };

  const mockMovies = {
    recentlyWatched: [],
    watchlist: [],
    favorites: [],
  };

  return (
    <div className="profile-content">
      <div className="profile-header">
        <div className="profile-cover">
          <img src={mockUser.banner} alt="Profile Banner" />
          <div className="profile-avatar-wrapper">
            <img
              src={mockUser.avatar}
              alt="Profile"
              className="profile-avatar"
            />
          </div>
        </div>

        <div className="profile-info">
          <div className="profile-text">
            <h1>{`${mockUser.firstName} ${mockUser.lastName}`}</h1>
            <span className="username">@{mockUser.username}</span>
          </div>
          <div className="profile-actions">
            <button className="edit-profile">
              <Edit2 size={16} />
              Edit Profile
            </button>
            <button className="icon-only">
              <Settings size={16} />
            </button>
          </div>
        </div>

        <div className="stats-row">
          <StatBox
            label="Movies Watched"
            value={mockUser.stats.moviesWatched}
            onPress={() => {}}
          />
          <StatBox
            label="Following"
            value={mockUser.stats.following}
            onPress={() => {}}
          />
          <StatBox
            label="Followers"
            value={mockUser.stats.followers}
            onPress={() => {}}
          />
        </div>
      </div>

      <div className="profile-content-lists">
        <MovieList
          title="Recently Watched"
          count={mockMovies.recentlyWatched.length}
          movies={mockMovies.recentlyWatched}
          onSeeAll={() => {}}
        />
        <MovieList
          title="Want to Watch"
          count={mockMovies.watchlist.length}
          movies={mockMovies.watchlist}
          onSeeAll={() => {}}
        />
        <MovieList
          title="Favorites"
          count={mockMovies.favorites.length}
          movies={mockMovies.favorites}
          onSeeAll={() => {}}
        />
      </div>
    </div>
  );
}

function Home() {
  const [activeTab, setActiveTab] = useState("home");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <div className="content">
            <h1>Home</h1>
          </div>
        );
      case "search":
        return (
          <div className="content">
            <h1>Search</h1>
          </div>
        );
      case "lists":
        return (
          <div className="content">
            <h1>Lists</h1>
          </div>
        );
      case "profile":
        return <ProfileContent />;
      default:
        return null;
    }
  };

  const NavItems = () => (
    <>
      <button
        className={`nav-item ${activeTab === "home" ? "active" : ""}`}
        onClick={() => setActiveTab("home")}
      >
        <HomeIcon size={24} />
        <span>Home</span>
      </button>
      <button
        className={`nav-item ${activeTab === "search" ? "active" : ""}`}
        onClick={() => setActiveTab("search")}
      >
        <Search size={24} />
        <span>Search</span>
      </button>
      <button
        className={`nav-item ${activeTab === "lists" ? "active" : ""}`}
        onClick={() => setActiveTab("lists")}
      >
        <List size={24} />
        <span>Lists</span>
      </button>
      <button
        className={`nav-item ${activeTab === "profile" ? "active" : ""}`}
        onClick={() => setActiveTab("profile")}
      >
        <User size={24} />
        <span>Profile</span>
      </button>
    </>
  );

  return (
    <div className="home-container">
      {!isMobile && (
        <nav className="side-nav">
          <div className="logo">
            <h1>MovieApp</h1>
          </div>
          <NavItems />
        </nav>
      )}
      <main className="main-content">{renderContent()}</main>
      {isMobile && (
        <nav className="bottom-nav">
          <NavItems />
        </nav>
      )}
    </div>
  );
}

export default Home;
