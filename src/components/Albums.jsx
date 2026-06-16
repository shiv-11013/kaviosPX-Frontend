import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { useToast } from "./useToast";

// ── Icons ─────────────────────────────────────────────────────────────────────
const CameraIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const ImagesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
    strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>
);

const ShareIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

// ── Component ─────────────────────────────────────────────────────────────────
const Albums = () => {
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();

  const [albums,      setAlbums]      = useState([]);
  const [name,        setName]        = useState("");
  const [description, setDescription] = useState("");
  const [shareEmails, setShareEmails] = useState({});
  const [loading,     setLoading]     = useState(true);
  const [creating,    setCreating]    = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, albumId: null });

  // Fetch all albums on mount
  useEffect(() => {
    axios.get("/api/albums")
      .then((res) => setAlbums(res.data.albums || []))
      .catch(() => showToast("Failed to load albums", "error"))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleCreateAlbum = async () => {
    if (!name.trim() || !description.trim())
      return showToast("Please fill in both fields", "error");
    setCreating(true);
    try {
      const res = await axios.post("/api/albums", { name, description });
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
    setDeleteModal({ open: false, albumId: null });
    try {
      await axios.delete(`/api/albums/${albumId}`);
      setAlbums((prev) => prev.filter((al) => (al.albumId || al._id) !== albumId));
      showToast("Album deleted", "success");
    } catch {
      showToast("Failed to delete album", "error");
    }
  };

  const handleShareAlbum = async (albumId) => {
    const email = shareEmails[albumId];
    if (!email) return showToast("Enter an email to share", "error");
    try {
      await axios.post(`/api/albums/${albumId}/share`, { emails: [email] });
      showToast(`Shared with ${email}`, "success");
      setShareEmails((prev) => ({ ...prev, [albumId]: "" }));
    } catch {
      showToast("Share failed. Try again.", "error");
    }
  };

  if (loading) {
    return (
      <>
        <nav className="topnav">
          <div className="topnav-logo">
            <div className="topnav-logo-icon"><CameraIcon /></div>
            <span className="topnav-name">KaviosPx</span>
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
      {/* ── Nav ── */}
      <nav className="topnav">
        <div className="topnav-logo">
          <div className="topnav-logo-icon"><CameraIcon /></div>
          <span className="topnav-name">KaviosPx</span>
        </div>
        <div className="topnav-spacer" />
        <button className="btn-logout" onClick={handleLogout}>Log out</button>
      </nav>

      <main className="page-content">
        {/* ── Page header ── */}
        <div className="page-header">
          <h1 className="page-title">My Albums</h1>
          <p className="page-subtitle">Organise and share your photo collections</p>
        </div>

        {/* ── Create form ── */}
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
            />
            <input
              className="create-input"
              type="text"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateAlbum()}
            />
            <button className="btn-create" onClick={handleCreateAlbum} disabled={creating}>
              <span style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                <PlusIcon />
                {creating ? "Creating…" : "Create"}
              </span>
            </button>
          </div>
        </div>

        {/* ── Album list ── */}
        <p className="section-heading">
          {albums.length} album{albums.length !== 1 ? "s" : ""}
        </p>
        <div className="album-grid">
          {albums.length === 0 ? (
            <div className="empty-state">
              <ImagesIcon />
              <p>No albums yet. Create your first one above.</p>
            </div>
          ) : (
            albums.map((al) => {
              const id = al.albumId || al._id;
              return (
                <div className="album-card" key={id} onClick={() => navigate(`/albums/${id}`)}>
                  <div className="album-card-thumb"><ImagesIcon /></div>
                  <div className="album-card-body">
                    <p className="album-card-name">{al.name}</p>

                    {/* Stop click from navigating into the album */}
                    <div className="album-card-actions" onClick={(e) => e.stopPropagation()}>
                      <div className="share-input-wrap">
                        <input
                          className="share-input"
                          type="email"
                          placeholder="Share via email"
                          value={shareEmails[id] || ""}
                          onChange={(e) => setShareEmails((prev) => ({ ...prev, [id]: e.target.value }))}
                          onKeyDown={(e) => e.key === "Enter" && handleShareAlbum(id)}
                        />
                        <button className="btn-share" onClick={() => handleShareAlbum(id)}>
                          <ShareIcon /> Share
                        </button>
                      </div>
                      <button
                        className="btn-delete-album"
                        onClick={() => setDeleteModal({ open: true, albumId: id })}
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

      {/* ── Delete confirmation modal ── */}
      {deleteModal.open && (
        <div className="modal-overlay" onClick={() => setDeleteModal({ open: false, albumId: null })}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <p className="modal-title">Delete album?</p>
            <p className="modal-desc">
              This will permanently delete the album and all its images. This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setDeleteModal({ open: false, albumId: null })}>
                Cancel
              </button>
              <button className="btn-modal-danger" onClick={confirmDeleteAlbum}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </>
  );
};

export default Albums;