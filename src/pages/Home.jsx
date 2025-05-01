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
import { Helmet } from "react-helmet-async";

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

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
    navigate(`/${movie.type}/${movie.tmdb_id}`);
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
              {movie.genres.map((genre, index) => (
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
          <Link
            className="activity-user"
            to={`/users/${activity.user.username}`}
          >
            <img
              src={activity.user.avatar}
              alt={activity.user.name}
              className="user-avatar"
            />
            <span className="user-name">{activity.user.name}</span>
          </Link>
        )}

        {(activity.type === "like" ||
          activity.type === "watch" ||
          activity.type === "comment" ||
          activity.type === "new_movie") && (
          <MoviePreview
            movie={{
              id: activity.movie.id,
              tmdb_id: activity.movie.tmdb_id,
              title: activity.movie.title,
              poster: activity.movie.poster,
              year: activity.movie.year,
              rating: activity.rating || activity.movie.rating,
              genres: activity.movie.genres,
              overview: activity.movie.overview,
              runtime: activity.movie.runtime,
              vote_count: activity.movie.vote_count,
              type: activity.movie.type,
            }}
          />
        )}

        {activity.type === "comment" && (
          <>
            <div className="comment-box">
              <p className="comment-text">{activity.comment}</p>
            </div>
          </>
        )}

        {activity.type === "new_episode" && (
          <MoviePreview
            movie={{
              id: activity.show.id,
              tmdb_id: activity.show.tmdb_id,
              title: activity.show.title,
              poster: activity.show.poster,
              year: activity.show.year,
              rating: activity.show.rating,
              genres: activity.show.genres,
              overview: activity.show.overview,
              type: activity.show.type,
            }}
            type="tv"
          />
        )}

        {activity.type === "list_create" && (
          <Link to={`/lists/${activity.list.id}`} className="list-preview-card">
            <div className="movie-mini-container">
              <div className="movie-poster-wrapper">
                <img src={activity.list.thumbnail} className="movie-poster" />
              </div>
              <div className="list-mini-info">
                <div>
                  <h3>{activity.list.title}</h3>
                  <span className="list-description">
                    {activity.list.description}
                  </span>
                </div>
                <div className="list-meta-info">
                  <span className="movie-runtime">
                    <Film size={14} />
                    {activity.list.movie_count} movies
                  </span>
                </div>
              </div>
            </div>
            {/* <div className="list-info">
              <div className="list-title">
                <ListPlus size={18} className="list-icon" />{" "}
                <h3>{activity.list.title}</h3>
              </div>
              <span className="movie-count">
                <Film size={14} />
                {activity.list.movieCount} movies
              </span>
            </div> */}
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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Reset state when tab changes
    setActivities([]);
    setPage(1);
    setHasMore(true);
  }, [activeTab]);

  useEffect(() => {
    const fetchActivities = async () => {
      // if (!hasMore) return;

      setLoading(true);
      try {
        const endpoint =
          activeTab === "following" ? "/feed/?following=true" : "/feed/";
        const response = await axiosClient.get(endpoint, {
          params: {
            page,
          },
        });

        if (page === 1) {
          setActivities(response.data.results);
        } else {
          setActivities((prev) => [...prev, ...response.data.results]);
        }

        // Update hasMore based on whether there's a next page
        setHasMore(!!response.data.next);
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [activeTab, page]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <div className="content-container">
      <div className="home-container">
        <Helmet>
          <title>Flickture - Track Movies & TV Shows</title>
          <meta
            name="description"
            content="Flickture helps you discover, track, and share your favorite movies and TV shows. Create watchlists, rate what you've watched, and connect with other movie enthusiasts."
          />
          <meta
            name="keywords"
            content="movie tracker, TV shows, watchlist, movie ratings, movie reviews, movie community"
          />
          <meta
            property="og:title"
            content="Flickture - Track Movies & TV Shows"
          />
          <meta
            property="og:description"
            content="Discover, track, and share your favorite movies and TV shows. Join the Flickture community today!"
          />
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="Flickture" />
          <meta name="twitter:card" content="summary_large_image" />
        </Helmet>
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
          {activities.length > 0 ? (
            <>
              {activities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
              {hasMore && (
                <button
                  className="load-more-button"
                  onClick={loadMore}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader className="spin" size={24} />
                      <span>Loading more...</span>
                    </>
                  ) : (
                    "Load More"
                  )}
                </button>
              )}
            </>
          ) : loading ? (
            <div className="loading-more">
              <Loader className="spin" size={24} />
              <span>Loading activities...</span>
            </div>
          ) : (
            <EmptyFeedMessage isFollowing={activeTab === "following"} />
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
