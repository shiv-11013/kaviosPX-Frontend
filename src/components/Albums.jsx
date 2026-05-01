import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

const Album = () => {
  const navigate = useNavigate();

  const [albums, setAlbums] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [shareEmails, setShareEmails] = useState({});
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  useEffect(() => {
    axios
      .get("/api/albums")
      .then((res) => {
        setAlbums(res.data.albums);
      })
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  const handleCreateAlbum = () => {
    if (!name.trim() || !description.trim()) {
      alert("Fill all fields");
      return;
    }

    axios
      .post("/api/albums", { name, description })
      .then((res) => {
        setAlbums([...albums, res.data.album]);
        setName("");
        setDescription("");
      })
      .catch((err) => console.log(err));
  };

  const handleDeleteAlbum = (albumId) => {
    axios
      .delete(`/api/albums/${albumId}`)
      .then(() => {
        setAlbums(albums.filter((al) => al.albumId !== albumId));
      })
      .catch((err) => console.log(err));
  };

  const handleShareAlbum = (albumId) => {
    const email = shareEmails[albumId];

    if (!email) {
      alert("Enter email");
      return;
    }

    axios
      .post(`/api/albums/${albumId}/share`, {
        emails: [email],
      })
      .then(() => {
        alert("Shared");
        setShareEmails({ ...shareEmails, [albumId]: "" });
      })
      .catch((err) => console.log(err));
  };

  const handleAlbumClick = (id) => {
    navigate(`/albums/${id}`);
  };

  if (loading) return <h2>Loading...</h2>;

  return (
    <div className="page">
      <div className="card">

        {/* NAV */}
        <div className="nav">
          <h2>Albums</h2>
          <button className="logout" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* CREATE */}
        <h3>Create Album</h3>

        <div className="form">
          <input
            type="text"
            placeholder="Album name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <button onClick={handleCreateAlbum}>Create Album</button>
        </div>

        {/* LIST */}
        <h3>Album List</h3>

        <div className="list">
          {albums.map((al) => (
            <div
              key={al._id}
              className="item"
              onClick={() => handleAlbumClick(al.albumId)}
            >
              <div className="row">
                <span>{al.name}</span>

                <button
                  className="delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteAlbum(al.albumId);
                  }}
                >
                  Delete
                </button>
              </div>

              <div className="share">
                <input
                  type="email"
                  placeholder="Enter email"
                  value={shareEmails[al.albumId] || ""}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    setShareEmails({
                      ...shareEmails,
                      [al.albumId]: e.target.value,
                    })
                  }
                />

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShareAlbum(al.albumId);
                  }}
                >
                  Share
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Album;