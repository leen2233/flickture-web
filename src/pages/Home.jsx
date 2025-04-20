import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../utils/axios";
import "../styles/Home.css";
import { useAuth } from "../contexts/AuthContext";
import {
  Heart,
  Star,
  MessageCircle,
  Play,
  ListPlus,
  Users,
  Globe,
  Film,
  Loader,
  UserPlus,
  Calendar,
  Clock,
  BarChart2,
  Sparkles,
} from "lucide-react";

// Sample data - Replace with API data later
const sampleActivities = [
  {
    id: 1,
    type: "like",
    user: {
      id: 1,
      name: "Sarah Johnson",
      avatar: "/default-avatar.png",
    },
    movie: {
      id: 1,
      title: "Inception",
      poster: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
      year: "2010",
      genres: ["Action", "Sci-Fi", "Thriller"],
      overview:
        'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: "inception".',
      runtime: 148,
      vote_count: 32476,
      rating: 8.8,
    },
    timestamp: "2025-04-17T10:30:00Z",
  },
  {
    id: 2,
    type: "watch",
    user: {
      id: 2,
      name: "Mike Chen",
      avatar: "/default-avatar.png",
    },
    movie: {
      id: 2,
      title: "The Shawshank Redemption",
      poster: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
      year: "1994",
      genres: ["Drama", "Crime"],
      overview:
        "Framed in the 1940s for the double murder of his wife and her lover, Andy Dufresne begins a new life at Shawshank prison, where he puts his accounting skills to work for an amoral warden.",
      runtime: 142,
      vote_count: 24596,
      rating: 9.3,
    },
    rating: 4.5,
    timestamp: "2025-04-17T09:15:00Z",
  },
  {
    id: 3,
    type: "comment",
    user: {
      id: 3,
      name: "Emily Wong",
      avatar: "/default-avatar.png",
    },
    movie: {
      id: 3,
      title: "Interstellar",
      poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
      year: "2014",
      genres: ["Adventure", "Drama", "Sci-Fi"],
      overview:
        "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
      runtime: 169,
      vote_count: 31854,
      rating: 8.6,
    },
    comment:
      "Mind-blowing visuals and an emotional story. The docking scene was intense! 🚀",
    timestamp: "2025-04-17T08:45:00Z",
  },
  {
    id: 4,
    type: "new_episode",
    user: null,
    show: {
      id: 4,
      title: "The Last of Us",
      poster: "https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg",
      year: "2023",
      genres: ["Drama", "Action", "Adventure"],
      overview:
        "Twenty years after modern civilization has been destroyed, Joel, a hardened survivor, is hired to smuggle Ellie, a 14-year-old girl, out of an oppressive quarantine zone.",
      rating: 8.7,
    },
    episode: {
      season: 2,
      episode: 5,
      title: "Endure and Survive",
    },
    timestamp: "2025-04-17T08:00:00Z",
  },
  {
    id: 5,
    type: "list_create",
    user: {
      id: 4,
      name: "Alex Turner",
      avatar: "/default-avatar.png",
    },
    list: {
      id: 1,
      title: "Best Sci-Fi Movies of All Time",
      movieCount: 15,
    },
    timestamp: "2025-04-17T07:30:00Z",
  },
  {
    id: 6,
    type: "new_movie",
    movie: {
      id: 6,
      title: "Dune: Part Two",
      poster: "https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
      year: "2024",
      genres: ["Science Fiction", "Adventure", "Drama"],
      overview:
        "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
      runtime: 166,
      vote_count: 2887,
      rating: 8.4,
    },
    timestamp: "2025-04-17T06:00:00Z",
  },
];

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = date - now;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function MoviePreview({ movie, type = "movie" }) {
  const navigate = useNavigate();

  const handleMovieClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/${type}/${movie.id}`);
  };

  return (
    <div className="movie-preview-card" onClick={handleMovieClick}>
      <div className="movie-mini-container">
        <div className="movie-poster-wrapper">
          <img src={movie.poster} alt={movie.title} className="movie-poster" />
          {movie.rating && (
            <div className="movie-rating-badge">
              <Star size={14} className="star-icon" fill="currentColor" />
              <span>{movie.rating}</span>
            </div>
          )}
        </div>
        <div className="movie-mini-info">
          <h3>{movie.title}</h3>
          <div className="movie-meta-info">
            <span className="movie-year">
              <Calendar size={14} />
              {movie.year}
            </span>
            {movie.runtime && (
              <span className="movie-runtime">
                <Clock size={14} />
                {movie.runtime}m
              </span>
            )}
          </div>
          {movie.genres && (
            <div className="movie-genres">
              {movie.genres.slice(0, 2).map((genre, index) => (
                <span key={index} className="genre-tag">
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActivityCard({ activity }) {
  return (
    <div className="activity-card">
      <div className="activity-content">
        {activity.user && (
          <div className="activity-user">
            <img
              src={activity.user.avatar}
              alt={activity.user.name}
              className="user-avatar"
            />
            <span className="user-name">{activity.user.name}</span>
          </div>
        )}

        {(activity.type === "like" ||
          activity.type === "watch" ||
          activity.type === "comment" ||
          activity.type === "new_movie") && (
          <MoviePreview
            movie={{
              id: activity.movie.id,
              title: activity.movie.title,
              poster: activity.movie.poster,
              year: activity.movie.year,
              rating: activity.rating || activity.movie.rating,
              genres: activity.movie.genres,
              overview: activity.movie.overview,
              runtime: activity.movie.runtime,
              vote_count: activity.movie.vote_count,
            }}
          />
        )}

        {activity.type === "comment" && (
          <>
            <div className="comment-box">
              <MessageCircle size={16} className="comment-icon" />
              <p className="comment-text">{activity.comment}</p>
            </div>
          </>
        )}

        {activity.type === "new_episode" && (
          <MoviePreview
            movie={{
              id: activity.show.id,
              title: activity.show.title,
              poster: activity.show.poster,
              year: activity.show.year,
              rating: activity.show.rating,
              genres: activity.show.genres,
              overview: activity.show.overview,
            }}
            type="tv"
          />
        )}

        {activity.type === "list_create" && (
          <Link to={`/lists/${activity.list.id}`} className="list-preview">
            <div className="list-info">
              <h3>
                <ListPlus size={18} className="list-icon" />
                {activity.list.title}
              </h3>
              <span className="movie-count">
                <Film size={14} />
                {activity.list.movieCount} movies
              </span>
            </div>
          </Link>
        )}
      </div>

      <div className="activity-metadata">
        <div className="activity-type">
          {activity.type === "like" && (
            <span className="activity-indicator liked">
              <Heart size={16} className="activity-icon" fill="currentColor" />
              Liked
            </span>
          )}
          {activity.type === "watch" && (
            <span className="activity-indicator watched">
              <Film size={16} className="activity-icon" />
              Watched
            </span>
          )}
          {activity.type === "comment" && (
            <span className="activity-indicator commented">
              <MessageCircle size={16} className="activity-icon" />
              Commented
            </span>
          )}
          {activity.type === "new_episode" && (
            <span className="activity-indicator new-episode">
              <Play size={16} className="activity-icon" />
              New Episode
            </span>
          )}
          {activity.type === "list_create" && (
            <span className="activity-indicator list-created">
              <ListPlus size={16} className="activity-icon" />
              Created List
            </span>
          )}
          {activity.type === "new_movie" && (
            <span className="activity-indicator new-movie">
              <Sparkles size={16} className="activity-icon" />
              New Movie
            </span>
          )}
        </div>
        <div className="activity-time">
          <Clock size={14} className="time-icon" />
          {formatTimestamp(activity.timestamp)}
        </div>
      </div>
    </div>
  );
}

function EmptyFeedMessage({ isFollowing }) {
  return (
    <div className="empty-feed">
      {isFollowing ? (
        <>
          <UserPlus size={48} className="empty-icon" />
          <h3>No Activity Yet</h3>
          <p>
            Start following other users and TV shows to see their activity here!
          </p>
        </>
      ) : (
        <>
          <Globe size={48} className="empty-icon" />
          <h3>Welcome to Flickture!</h3>
          <p>
            This is where you'll see activity from all users. Follow people to
            customize your feed!
          </p>
        </>
      )}
    </div>
  );
}

function Home() {
  const [activeTab, setActiveTab] = useState("following");
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        // Replace with actual API calls later
        if (activeTab === "following") {
          // Filter activities for followed users and shows
          const followingActivities = sampleActivities.filter((activity) => {
            // This is a placeholder - replace with actual following logic
            return (
              activity.user &&
              (activity.user.id === 1 || activity.user.id === 2)
            );
          });
          setActivities(followingActivities);
        } else {
          // Show all activities for global feed
          setActivities(sampleActivities);
        }
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="content-container">
      <div className="home-container">
        <div className="feed-header">
          <h1>Your Feed</h1>
          <div className="feed-tabs">
            <button
              className={`feed-tab ${
                activeTab === "following" ? "active" : ""
              }`}
              onClick={() => handleTabChange("following")}
            >
              <Users size={18} />
              Following
            </button>
            <button
              className={`feed-tab ${activeTab === "global" ? "active" : ""}`}
              onClick={() => handleTabChange("global")}
            >
              <Globe size={18} />
              Global
            </button>
          </div>
        </div>

        <div className="activities-feed">
          {loading ? (
            <div className="loading-more">
              <Loader className="spin" size={24} />
              <span>Loading activities...</span>
            </div>
          ) : activities.length > 0 ? (
            <>
              {activities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </>
          ) : (
            <EmptyFeedMessage isFollowing={activeTab === "following"} />
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
