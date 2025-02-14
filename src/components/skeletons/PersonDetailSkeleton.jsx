const PersonDetailSkeleton = () => {
  return (
    <div className="person-detail-container">
      <div className="person-backdrop skeleton-backdrop">
        <div className="backdrop-overlay" />
      </div>

      <div className="movie-nav">
        <div className="nav-button skeleton-button">
          <div className="skeleton-text" style={{ width: "80px" }} />
        </div>
      </div>

      <div className="person-detail-content">
        <div className="person-detail-main">
          <div className="person-poster-large skeleton-poster" />

          <div className="person-info-detailed">
            <div
              className="skeleton-text"
              style={{ width: "60%", height: "40px" }}
            />

            <div className="person-meta-detailed">
              {[1, 2, 3].map((i) => (
                <div key={i} className="meta-item">
                  <div className="skeleton-text" style={{ width: "60px" }} />
                  <div className="skeleton-text" style={{ width: "120px" }} />
                </div>
              ))}
            </div>

            <div className="person-biography">
              <div
                className="skeleton-text"
                style={{ width: "120px", marginBottom: "1rem" }}
              />
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="skeleton-text"
                  style={{ width: "100%", marginBottom: "0.5rem" }}
                />
              ))}
            </div>

            <div className="known-for-section">
              <div
                className="skeleton-text"
                style={{ width: "120px", marginBottom: "1rem" }}
              />
              <div className="skeleton-text" style={{ width: "80%" }} />
            </div>
          </div>
        </div>

        <div className="filmography-section">
          <div className="section-header">
            <div className="skeleton-text" style={{ width: "120px" }} />
          </div>
          <div className="movies-scroll">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="movie-card">
                <div className="movie-poster skeleton-poster" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonDetailSkeleton;
