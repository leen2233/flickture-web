import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Users,
  Clock,
  Calendar,
  MessageCircle,
  Heart,
  ChevronDown,
  ChevronUp,
  Send,
  Filter,
  PenSquare,
  Trash,
} from "lucide-react";
import axiosClient from "../utils/axios";
import { toast } from "react-toastify";
import "../styles/Comments.css";

const RatingStars = ({
  rating,
  interactive = false,
  onRatingChange = null,
}) => (
  <div className={`rating-stars ${interactive ? "interactive" : ""}`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        size={interactive ? 24 : 16}
        className={i <= rating ? "star-filled" : "star-empty"}
        onClick={() => interactive && onRatingChange?.(i)}
      />
    ))}
  </div>
);

const CommentItem = ({
  id,
  user,
  rating,
  content,
  date,
  responses = [],
  likes_count: initialLikes = 0,
  is_liked: initialIsLiked = false,
  is_owner,
  movieId,
  movie,
  onDelete,
}) => {
  const [showResponses, setShowResponses] = useState(false);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likes, setLikes] = useState(initialLikes);
  const [showResponseInput, setShowResponseInput] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localResponses, setLocalResponses] = useState(responses);
  const inputRef = useRef(null);

  const handleLike = async () => {
    try {
      const response = await axiosClient.post(
        `/movies/${movieId}/comments/${id}/like/`
      );
      setIsLiked(response.data.liked);
      setLikes(response.data.likes_count);
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  const handleSubmitResponse = async () => {
    if (!responseText.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const response = await axiosClient.post(`/movies/${movieId}/comments/`, {
        content: responseText,
        parent: id,
        movie: movie.id,
        rating: 1,
      });

      setLocalResponses([...localResponses, response.data]);
      setResponseText("");
      setShowResponseInput(false);
      setShowResponses(true);
    } catch (error) {
      console.error("Failed to submit response:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const ResponseItem = ({ response }) => {
    const [showResponseInput, setShowResponseInput] = useState(false);
    const [responseText, setResponseText] = useState(
      `@${response.user.username} `
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const inputRef = useRef(null);

    const handleSubmitNestedResponse = async () => {
      if (!responseText.trim() || isSubmitting) return;

      try {
        setIsSubmitting(true);
        const newResponse = await axiosClient.post(
          `/movies/${movieId}/comments/`,
          {
            content: responseText,
            parent: id, // Use the main comment's id as parent
            movie: movie.id,
            rating: 1,
          }
        );

        setLocalResponses([...localResponses, newResponse.data]);
        setResponseText("");
        setShowResponseInput(false);
      } catch (error) {
        console.error("Failed to submit response:", error);
      } finally {
        setIsSubmitting(false);
      }
    };

    useEffect(() => {
      if (showResponseInput && inputRef.current) {
        inputRef.current.focus();
        // Place cursor at the end of the input
        inputRef.current.selectionStart = inputRef.current.value.length;
      }
    }, [showResponseInput]);

    return (
      <div className="response">
        <div className="response-header">
          <img
            src={response.user.avatar || "/default-avatar.jpg"}
            alt={response.user.username}
            className="avatar"
          />
          <div>
            <h4 className="username">{response.user.username}</h4>
            <span className="date">{response.date}</span>
          </div>
        </div>
        <p className="content">{response.content}</p>

        <div className="response-actions">
          <button
            className={`write-response-button small ${
              showResponseInput ? "active" : ""
            }`}
            onClick={() => setShowResponseInput(!showResponseInput)}
          >
            <MessageCircle size={16} />
            <span>{showResponseInput ? "Cancel" : "Reply"}</span>
          </button>
        </div>

        {showResponseInput && (
          <div className="response-input-container">
            <input
              ref={inputRef}
              type="text"
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Write your response..."
              onKeyDown={(e) =>
                e.key === "Enter" && handleSubmitNestedResponse()
              }
            />
            <button
              className="send-button"
              onClick={handleSubmitNestedResponse}
              disabled={!responseText.trim() || isSubmitting}
            >
              <Send size={20} />
            </button>
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    if (showResponseInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showResponseInput]);

  return (
    <div className="comment-card">
      <div className="comment-main">
        <div className="comment-header">
          <div className="user-info">
            <img
              src={user.avatar || "/default-avatar.jpg"}
              alt={user.username}
              className="avatar"
            />
            <div>
              <h3 className="username">{user.username}</h3>
              <div className="metadata">
                <RatingStars rating={rating} />
                <span className="date">{date}</span>
              </div>
            </div>
          </div>
          <button
            className={`like-button ${isLiked ? "liked" : ""}`}
            onClick={handleLike}
          >
            <Heart size={18} />
            <span>{likes}</span>
          </button>
        </div>

        <p className="content">{content}</p>

        <div
          className={
            !showResponseInput
              ? "comment-actions"
              : "comment-actions input-opened"
          }
        >
          <button
            className={`write-response-button ${
              showResponseInput ? "active" : ""
            }`}
            onClick={() => setShowResponseInput(!showResponseInput)}
          >
            <MessageCircle size={18} />
            <span>{showResponseInput ? "Cancel" : "Write Response"}</span>
          </button>
          {is_owner && (
            <button className="delete-button" onClick={() => onDelete(id)}>
              <Trash size={18} />
              <span>Delete</span>
            </button>
          )}
          {responses.length > 0 && (
            <button
              className="responses-toggle"
              onClick={() => setShowResponses(!showResponses)}
            >
              <MessageCircle size={18} />
              <span>
                {responses.length}{" "}
                {responses.length === 1 ? "Response" : "Responses"}
              </span>
              {showResponses ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>
          )}
        </div>

        {showResponseInput && (
          <div className="response-input-container">
            <input
              ref={inputRef}
              type="text"
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Write your response..."
              onKeyDown={(e) => e.key === "Enter" && handleSubmitResponse()}
            />
            <button
              className="send-button"
              onClick={handleSubmitResponse}
              disabled={!responseText.trim() || isSubmitting}
            >
              <Send size={20} />
            </button>
          </div>
        )}
      </div>

      {showResponses && localResponses.length > 0 && (
        <div className="responses">
          {localResponses.map((response, index) => (
            <ResponseItem key={index} response={response} />
          ))}
        </div>
      )}
    </div>
  );
};

const CommentForm = ({ onSubmit, onCancel }) => {
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim() || rating === 0 || isSubmitting) return;
    setIsSubmitting(true);
    await onSubmit(comment, rating);
    setIsSubmitting(false);
  };

  return (
    <div className="comment-form">
      <div className="rating-section">
        <span>Your Rating</span>
        <RatingStars rating={rating} interactive onRatingChange={setRating} />
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your thoughts about the movie..."
        rows={4}
        disabled={isSubmitting}
      />

      <div className="form-actions">
        <button className="cancel" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
        <button
          className="submit"
          disabled={!comment.trim() || rating === 0 || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? <div className="spinner small" /> : "Post Review"}
        </button>
      </div>
    </div>
  );
};

function Comments() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedRating, setSelectedRating] = useState(0);
  const [sortBy, setSortBy] = useState("date");
  const [showCommentForm, setShowCommentForm] = useState(false);
  const observer = useRef();

  const lastCommentRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore]
  );

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await axiosClient.get(`/movies/${movieId}`);
        setMovie(response.data);
      } catch (error) {
        console.error("Failed to fetch movie:", error);
      }
    };

    fetchMovie();
  }, [movieId]);

  const handleDeleteComment = async (id) => {
    try {
      await axiosClient.delete(`/movies/${movieId}/comments/${id}/`);
      setComments((prev) => prev.filter((comment) => comment.id !== id));
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoading(true);
        const response = await axiosClient.get(
          `/movies/${movieId}/comments/?page=${page}&rating=${selectedRating}&sort_by=${sortBy}`
        );
        setComments((prev) =>
          page === 1
            ? response.data.results
            : [...prev, ...response.data.results]
        );
        setHasMore(response.data.next !== null);
      } catch (error) {
        console.error("Failed to fetch comments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [movieId, page, selectedRating, sortBy]);

  const handleSubmitComment = async (content, rating) => {
    try {
      const response = await axiosClient.post(`/movies/${movieId}/comments/`, {
        content,
        rating,
        movie: movie.id,
      });

      setShowCommentForm(false);
      // Add the new comment to the beginning of the list
      setComments((prevComments) => [response.data, ...prevComments]);
    } catch (error) {
      console.error("Failed to submit comment:", error);
      toast.error("Failed to post your review. Please try again.");
    }
  };

  return (
    <div className="comments-page">
      <header className="page-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <h1>Reviews & Comments</h1>
      </header>

      <div className="movie-banner">
        <img
          src={movie?.backdrop_url || movie?.poster_url}
          alt={movie?.title}
          className="backdrop"
        />
        <div className="movie-info">
          <h2>{movie?.title}</h2>
          <div className="stats">
            <span>
              <Star size={16} /> {movie?.rating?.toFixed(1)}
            </span>
            <span>
              <Users size={16} /> {movie?.vote_count?.toLocaleString()}
            </span>
            <span>
              <Clock size={16} /> {movie?.runtime} min
            </span>
            <span>
              <Calendar size={16} /> {movie?.year}
            </span>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="actions-bar">
          <button
            className={`write-review ${showCommentForm ? "active" : ""}`}
            onClick={() => setShowCommentForm(!showCommentForm)}
          >
            <PenSquare size={20} />
            <span>{showCommentForm ? "Close Review" : "Write a Review"}</span>
          </button>

          <div className="filters">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date">Most Recent</option>
              <option value="likes">Most Liked</option>
              <option value="rating">Highest Rated</option>
            </select>

            <div className="rating-filter">
              {[...Array(5).keys()].map((rating) => (
                <button
                  key={rating}
                  className={selectedRating === rating ? "active" : ""}
                  onClick={() => setSelectedRating(rating)}
                >
                  {rating === 0 ? "All" : `${rating}★`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {showCommentForm && (
          <CommentForm
            onSubmit={handleSubmitComment}
            onCancel={() => setShowCommentForm(false)}
          />
        )}

        <div className="comments-list">
          {comments.length === 0 && !isLoading && (
            <div className="no-comments">
              <MessageCircle size={24} />
              <span>
                No comments yet - be the first to share your thoughts!
              </span>
            </div>
          )}

          {comments.map((comment, index) => (
            <CommentItem
              key={comment.id}
              {...comment}
              movieId={movieId}
              movie={movie}
              ref={index === comments.length - 1 ? observer.current : null}
              onDelete={handleDeleteComment}
            />
          ))}

          {isLoading && (
            <div className="loading">
              <div className="spinner" />
              <span>Loading reviews...</span>
            </div>
          )}

          {!hasMore && comments.length > 0 && (
            <div className="end-message">
              <MessageCircle size={24} />
              <span>You've reached the end of reviews</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Comments;
