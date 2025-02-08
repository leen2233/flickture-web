import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  Plus,
  TrendingUp,
  Users,
  Bookmark,
  Film,
  Clock,
  Star,
  Loader,
} from "lucide-react";
import axiosClient from "../utils/axios";

function ListCard({ list }) {
  const [isLiked, setIsLiked] = useState(list.is_liked);

  const handleLike = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosClient.post(`/lists/${list.id}/like/`);
      setIsLiked(response.data.liked);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  return (
    <Link to={`/lists/${list.id}`} className="list-card">
      <div className="list-card-thumbnail">
        <img src={list.thumbnail} alt={list.name} />
        <div className="list-card-overlay">
          <div className="list-card-stats">
            <div className="stat">
              <Film size={14} />
              <span>{list.movies_count}</span>
            </div>
            <div className="stat">
              <Heart size={14} />
              <span>{list.likes_count}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="list-card-content">
        <h3 className="list-card-title">{list.name}</h3>
        <p className="list-card-description">{list.description}</p>
        <div className="list-card-meta">
          <div className="list-card-creator">
            <span>by {list.creator}</span>
          </div>
          <button
            className={`list-like-button ${isLiked ? "liked" : ""}`}
            onClick={handleLike}
          >
            <Heart size={14} />
          </button>
        </div>
      </div>
    </Link>
  );
}

function ListsSection({ title, icon: Icon, lists, emptyMessage }) {
  if (!lists?.length) {
    return (
      <div className="lists-section-empty">
        <Icon size={24} />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="lists-section">
      <div className="lists-section-header">
        <div className="section-title">
          <Icon size={20} />
          <h2>{title}</h2>
        </div>
      </div>
      <div className="lists-section-grid">
        {lists.map((list) => (
          <ListCard key={list.id} list={list} />
        ))}
      </div>
    </div>
  );
}

function Lists() {
  const [activeTab, setActiveTab] = useState("featured");
  const [data, setData] = useState({
    trending: [],
    staffPicks: [],
    myLists: [],
    likedLists: [],
    popular: [],
    recent: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        switch (activeTab) {
          case "featured":
            const featuredRes = await axiosClient.get("/lists/featured");
            setData((prev) => ({
              ...prev,
              trending: featuredRes.data.trending,
              staffPicks: featuredRes.data.staff_picks,
            }));
            break;
          case "myLists":
            const myListsRes = await axiosClient.get("/lists/my_lists");
            setData((prev) => ({ ...prev, myLists: myListsRes.data }));
            break;
          case "liked":
            const likedRes = await axiosClient.get("/lists/liked");
            setData((prev) => ({ ...prev, likedLists: likedRes.data }));
            break;
          case "community":
            const communityRes = await axiosClient.get("/lists/community");
            setData((prev) => ({
              ...prev,
              popular: communityRes.data.popular,
              recent: communityRes.data.recent,
            }));
            break;
        }
      } catch (error) {
        console.error("Error fetching lists:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  const tabs = [
    { id: "featured", label: "Featured", icon: TrendingUp },
    { id: "myLists", label: "My Lists", icon: Bookmark },
    { id: "liked", label: "Liked", icon: Heart },
    { id: "community", label: "Community", icon: Users },
  ];

  return (
    <div className="lists-page">
      <div className="lists-page-header">
        <div className="lists-tabs-container">
          <div className="lists-tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`tab-button ${
                    activeTab === tab.id ? "active" : ""
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
          <Link to="/lists/create" className="create-list-button">
            <Plus size={18} />
            <span>Create List</span>
          </Link>
        </div>
      </div>

      <div className="lists-page-content">
        {isLoading ? (
          <div className="lists-loading">
            <Loader className="spin" size={24} />
            <span>Loading lists...</span>
          </div>
        ) : (
          <>
            {activeTab === "featured" && (
              <>
                <ListsSection
                  title="Trending Lists"
                  icon={TrendingUp}
                  lists={data.trending}
                  emptyMessage="No trending lists found"
                />
                <ListsSection
                  title="Staff Picks"
                  icon={Star}
                  lists={data.staffPicks}
                  emptyMessage="No staff picks found"
                />
              </>
            )}

            {activeTab === "myLists" && (
              <ListsSection
                title="My Lists"
                icon={Bookmark}
                lists={data.myLists}
                emptyMessage="You haven't created any lists yet"
              />
            )}

            {activeTab === "liked" && (
              <ListsSection
                title="Liked Lists"
                icon={Heart}
                lists={data.likedLists}
                emptyMessage="You haven't liked any lists yet"
              />
            )}

            {activeTab === "community" && (
              <>
                <ListsSection
                  title="Popular in Community"
                  icon={Users}
                  lists={data.popular}
                  emptyMessage="No popular lists found"
                />
                <ListsSection
                  title="Recently Created"
                  icon={Clock}
                  lists={data.recent}
                  emptyMessage="No recent lists found"
                />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Lists;
