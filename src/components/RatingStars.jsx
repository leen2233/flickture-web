import { Star } from "lucide-react";

export const RatingStars = ({
  rating,
  interactive = false,
  onRatingChange = null,
}) => {
  return (
    <div className={`rating-stars ${interactive ? "interactive" : ""}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={interactive ? 24 : 16}
          className={i <= rating ? "star-filled" : "star-empty"}
          onClick={() => interactive && onRatingChange?.(i)}
          style={{ cursor: interactive ? "pointer" : "default" }}
          fill={i <= rating ? "currentColor" : "none"}
        />
      ))}
    </div>
  );
};
