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
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>
);

const ShareIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/>
    <circle cx="6" cy="12" r="3"/>
    <circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
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
  const [deleteModal, setDeleteModal] = useState({ open: false, albumId: null, albumName: "" });

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
            <div className="topnav-logo-mark"><CameraIcon /></div>
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
      {/* ── Nav ── */}
      <nav className="topnav">
        <div className="topnav-logo">
          <div className="topnav-logo-mark"><CameraIcon /></div>
          <span className="topnav-logo-name">KaviosPx</span>
        </div>
        <div className="topnav-spacer" />
        <button className="btn-logout" onClick={handleLogout}>Log out</button>
      </nav>

      <main className="page-content">
        {/* ── Page header ── */}
        <div className="page-header">
          <span className="page-eyebrow">Gallery</span>
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
            <button className="btn-create" onClick={handleCreateAlbum} disabled={creating}>
              <PlusIcon />
              {creating ? "Creating…" : "Create"}
            </button>
          </div>
        </div>

        {/* ── Album list ── */}
        <p className="section-heading">
          {albums.length} {albums.length === 1 ? "album" : "albums"}
        </p>

        <div className="album-grid">
          {albums.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><ImagesIcon /></div>
              <p>No albums yet.</p>
              <p className="empty-action">Create your first album above to get started.</p>
            </div>
          ) : (
            albums.map((al) => {
              const id = getAlbumId(al);
              return (
                <div className="album-card" key={id} onClick={() => navigate(`/albums/${id}`)}>
                  {/* Gold accent line */}
                  <div className="album-card-accent" aria-hidden="true" />

                  {/* Thumbnail */}
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

                  {/* Body */}
                  <div className="album-card-body">
                    <div className="album-card-meta">
                      <p className="album-card-name">{al.name}</p>
                      {al.imageCount != null && (
                        <span className="album-card-count">
                          {al.imageCount} {al.imageCount === 1 ? "photo" : "photos"}
                        </span>
                      )}
                    </div>

                    {/* Actions — stop propagation so clicks don't navigate */}
                    <div className="album-card-actions" onClick={(e) => e.stopPropagation()}>
                      <div className="share-input-wrap">
                        <ShareIcon style={{ color: "var(--text-4)", flexShrink: 0 }} />
                        <input
                          className="share-input"
                          type="email"
                          placeholder="Share via email"
                          value={shareEmails[id] || ""}
                          onChange={(e) =>
                            setShareEmails((prev) => ({ ...prev, [id]: e.target.value }))
                          }
                          onKeyDown={(e) => e.key === "Enter" && handleShareAlbum(id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button className="btn-share" onClick={() => handleShareAlbum(id)}>
                          Share
                        </button>
                      </div>

                      <button
                        className="btn-delete-album"
                        onClick={() =>
                          setDeleteModal({ open: true, albumId: id, albumName: al.name })
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

      {/* ── Delete confirmation modal ── */}
      {deleteModal.open && (
        <div
          className="modal-overlay"
          onClick={() => setDeleteModal({ open: false, albumId: null, albumName: "" })}
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
              This will permanently delete the album and all its photos. This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                className="btn-modal-cancel"
                onClick={() => setDeleteModal({ open: false, albumId: null, albumName: "" })}
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