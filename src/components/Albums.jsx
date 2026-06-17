import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import {
  CameraIcon,
  TrashIcon,
  ShareIcon,
  PlusIcon,
  ImagesIcon,
} from "./icons";
import { useToast } from "./useToast";

const Albums = () => {
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();

  const [albums, setAlbums] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [shareEmails, setShareEmails] = useState({});
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    albumId: null,
    albumName: "",
  });

  useEffect(() => {
    axios
      .get("/api/albums")
      .then((res) => setAlbums(res.data.albums || []))
      .catch(() => showToast("Failed to load albums", "error"))
      .finally(() => setLoading(false));
  }, [showToast]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleCreateAlbum = async () => {
    if (!name.trim()) return showToast("Album name is required", "error");
    setCreating(true);
    try {
      const res = await axios.post("/api/albums", {
        name: name.trim(),
        description: description.trim() || "No description",
      });
      setAlbums((prev) => [...prev, res.data.album]);
      setName("");
      setDescription("");
      showToast("Album created!", "success");
    } catch {
      showToast("Failed to create album", "error");
    } finally {
      setCreating(false);
    }
  };

  const confirmDeleteAlbum = async () => {
    const albumId = deleteModal.albumId;
    setDeleteModal({ open: false, albumId: null, albumName: "" });
    try {
      await axios.delete(`/api/albums/${albumId}`);
      setAlbums((prev) => prev.filter((al) => getAlbumId(al) !== albumId));
      showToast("Album deleted", "success");
    } catch {
      showToast("Failed to delete album", "error");
    }
  };

  const handleShareAlbum = async (albumId) => {
    const email = shareEmails[albumId]?.trim();
    if (!email) return showToast("Enter an email to share", "error");
    try {
      await axios.post(`/api/albums/${albumId}/share`, { emails: [email] });
      showToast(`Shared with ${email}`, "success");
      setShareEmails((prev) => ({ ...prev, [albumId]: "" }));
    } catch {
      showToast("Share failed. Try again.", "error");
    }
  };

  const getAlbumId = (al) => al.albumId || al._id;

  if (loading) {
    return (
      <>
        <nav className="topnav">
          <div className="topnav-logo">
            <div className="topnav-logo-mark">
              <CameraIcon />
            </div>
            <span className="topnav-logo-name">KaviosPx</span>
          </div>
        </nav>
        <div className="loading-screen">
          <div className="spinner" />
          <p className="loading-text">Loading your albums…</p>
        </div>
        <ToastContainer />
      </>
    );
  }

  return (
    <>
      <nav className="topnav">
        <div className="topnav-logo">
          <div className="topnav-logo-mark">
            <CameraIcon />
          </div>
          <span className="topnav-logo-name">KaviosPx</span>
        </div>
        <div className="topnav-spacer" />
        <button className="btn-logout" onClick={handleLogout}>
          Log out
        </button>
      </nav>

      <main className="page-content">
        <div className="page-header">
          <span className="page-eyebrow">Gallery</span>
          <h1 className="page-title">My Albums</h1>
          <p className="page-subtitle">
            Organise and share your photo collections
          </p>
        </div>

        <div className="create-card">
          <p className="create-card-title">New album</p>
          <div className="create-form-row">
            <input
              className="create-input"
              type="text"
              placeholder="Album name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateAlbum()}
              autoComplete="off"
            />
            <input
              className="create-input"
              type="text"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateAlbum()}
              autoComplete="off"
            />
            <button
              className="btn-create"
              onClick={handleCreateAlbum}
              disabled={creating}
            >
              <PlusIcon />
              {creating ? "Creating…" : "Create"}
            </button>
          </div>
        </div>

        <p className="section-heading">
          {albums.length} {albums.length === 1 ? "album" : "albums"}
        </p>

        <div className="album-grid">
          {albums.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <ImagesIcon />
              </div>
              <p>No albums yet.</p>
              <p className="empty-action">
                Create your first album above to get started.
              </p>
            </div>
          ) : (
            albums.map((al) => {
              const id = getAlbumId(al);
              return (
                <div
                  className="album-card"
                  key={id}
                  onClick={() => navigate(`/albums/${id}`)}
                >
                  <div className="album-card-accent" aria-hidden="true" />
                  <div className="album-card-thumb">
                    {al.coverUrl ? (
                      <img
                        src={al.coverUrl}
                        alt={al.name}
                        className="album-thumb-img"
                        loading="lazy"
                      />
                    ) : (
                      <div className="album-thumb-placeholder">
                        <ImagesIcon />
                        <span>No photos yet</span>
                      </div>
                    )}
                  </div>

                  <div className="album-card-body">
                    <div className="album-card-meta">
                      <p className="album-card-name">{al.name}</p>
                      {al.imageCount != null && (
                        <span className="album-card-count">
                          {al.imageCount}{" "}
                          {al.imageCount === 1 ? "photo" : "photos"}
                        </span>
                      )}
                    </div>
                    <div
                      className="album-card-actions"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="share-input-wrap">
                        <ShareIcon
                          style={{ color: "var(--text-4)", flexShrink: 0 }}
                        />
                        <input
                          className="share-input"
                          type="email"
                          placeholder="Share via email"
                          value={shareEmails[id] || ""}
                          onChange={(e) =>
                            setShareEmails((prev) => ({
                              ...prev,
                              [id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleShareAlbum(id)
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button
                          className="btn-share"
                          onClick={() => handleShareAlbum(id)}
                        >
                          Share
                        </button>
                      </div>

                      <button
                        className="btn-delete-album"
                        onClick={() =>
                          setDeleteModal({
                            open: true,
                            albumId: id,
                            albumName: al.name,
                          })
                        }
                        title="Delete album"
                        aria-label="Delete album"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {deleteModal.open && (
        <div
          className="modal-overlay"
          onClick={() =>
            setDeleteModal({ open: false, albumId: null, albumName: "" })
          }
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-badge">🗑️</div>
            <p className="modal-title" id="modal-title">
              Delete "{deleteModal.albumName}"?
            </p>
            <p className="modal-desc">
              This will permanently delete the album and all its photos. This
              action cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                className="btn-modal-cancel"
                onClick={() =>
                  setDeleteModal({ open: false, albumId: null, albumName: "" })
                }
              >
                Cancel
              </button>
              <button className="btn-modal-danger" onClick={confirmDeleteAlbum}>
                Delete album
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </>
  );
};

export default Albums;
