import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

const UploadIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"/>
    <line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>
);

const SendIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

// ── Component ─────────────────────────────────────────────────────────────────
const AlbumDetail = () => {
  const { albumId } = useParams();
  const navigate    = useNavigate();
  const fileInputRef = useRef(null);
  const { showToast, ToastContainer } = useToast();

  const [images,      setImages]      = useState([]);
  const [file,        setFile]        = useState(null);
  const [fileName,    setFileName]    = useState("");
  const [comments,    setComments]    = useState({});   // { [imageId]: string }
  const [loading,     setLoading]     = useState(true);
  const [uploading,   setUploading]   = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, imageId: null });

  // Fetch images for this album
  useEffect(() => {
    axios.get(`/api/images/${albumId}`)
      .then((res) => setImages(res.data.images || []))
      .catch(() => showToast("Failed to load images", "error"))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [albumId]);

  // ── Upload ──────────────────────────────────────────────────────────────────
  const handleFileSelect = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) return showToast("Please select an image file", "error");
    if (f.size > 10 * 1024 * 1024) return showToast("Image must be under 10 MB", "error");
    setFile(f);
    setFileName(f.name);
  };

  const handleUpload = async () => {
    if (!file) return showToast("Select an image first", "error");
    const formData = new FormData();
    formData.append("image", file);
    setUploading(true);
    try {
      const res = await axios.post(`/api/images/${albumId}`, formData);
      setImages((prev) => [...prev, res.data.image]);
      setFile(null);
      setFileName("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      showToast("Image uploaded!", "success");
    } catch {
      showToast("Upload failed. Try again.", "error");
    } finally {
      setUploading(false);
    }
  };

  // ── Comment ─────────────────────────────────────────────────────────────────
  const handleAddComment = async (imageId) => {
    const comment = comments[imageId];
    if (!comment?.trim()) return showToast("Write a comment first", "error");
    try {
      const res = await axios.post(`/api/images/${albumId}/${imageId}/comments`, { comment });
      setImages((prev) => prev.map((img) =>
        img.imageId === imageId ? { ...img, comments: res.data.comments } : img
      ));
      setComments((prev) => ({ ...prev, [imageId]: "" }));
    } catch {
      showToast("Could not add comment", "error");
    }
  };

  // ── Favourite (optimistic update) ───────────────────────────────────────────
  const handleToggleFavourite = async (imageId) => {
    // Update UI immediately — revert if API fails
    setImages((prev) => prev.map((img) =>
      img.imageId === imageId ? { ...img, isFavorite: !img.isFavorite } : img
    ));
    try {
      const res = await axios.put(`/api/images/${albumId}/${imageId}/favorite`);
      setImages((prev) => prev.map((img) =>
        img.imageId === imageId ? { ...img, isFavorite: res.data.isFavorite } : img
      ));
    } catch {
      // Revert on failure
      setImages((prev) => prev.map((img) =>
        img.imageId === imageId ? { ...img, isFavorite: !img.isFavorite } : img
      ));
      showToast("Could not update favourite", "error");
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    const imageId = deleteModal.imageId;
    setDeleteModal({ open: false, imageId: null });
    try {
      await axios.delete(`/api/images/${albumId}/${imageId}`);
      setImages((prev) => prev.filter((img) => img.imageId !== imageId));
      showToast("Image deleted", "success");
    } catch {
      showToast("Delete failed", "error");
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Nav ── */}
      <nav className="topnav">
        <div className="topnav-logo">
          <div className="topnav-logo-icon"><CameraIcon /></div>
          <span className="topnav-name">KaviosPx</span>
        </div>
        <div className="topnav-spacer" />
        <button className="topnav-back" onClick={() => navigate("/albums")}>
          <ArrowLeftIcon /> Back to albums
        </button>
      </nav>

      <main className="page-content">
        {/* ── Page header ── */}
        <div className="page-header">
          <h1 className="page-title">Images</h1>
          <p className="page-subtitle">Hover a photo to favourite it · press Enter to post a comment</p>
        </div>

        {/* ── Upload bar ── */}
        <div className="upload-bar">
          <span className="upload-bar-label">Upload</span>
          <label className="file-pick-btn" style={{ cursor: "pointer" }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />
            <span className={`file-name-display ${fileName ? "has-file" : ""}`}>
              {fileName || "Choose an image…"}
            </span>
          </label>
          <button className="btn-upload" onClick={handleUpload} disabled={uploading || !file}>
            <UploadIcon />
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </div>

        {/* ── Image grid ── */}
        {loading ? (
          <div className="loading-screen">
            <div className="spinner" />
            <p className="loading-text">Loading images…</p>
          </div>
        ) : images.length === 0 ? (
          <div className="empty-state">
            <CameraIcon />
            <p style={{ marginTop: "16px" }}>No images yet. Upload your first photo above.</p>
          </div>
        ) : (
          <div className="image-grid">
            {images.map((img) => (
              <div className="image-card" key={img.imageId}>

                {/* Thumbnail with hover overlay */}
                <div className="image-card-thumb">
                  {img.url && <img src={img.url} alt="album photo" loading="lazy" />}
                  <div className="image-card-overlay">
                    <button
                      className={`btn-fav ${img.isFavorite ? "is-fav" : ""}`}
                      onClick={() => handleToggleFavourite(img.imageId)}
                      title={img.isFavorite ? "Remove favourite" : "Add to favourites"}
                    >
                      {img.isFavorite ? "❤️" : "🤍"}
                    </button>
                  </div>
                </div>

                {/* Comment section */}
                <div className="image-card-body">
                  <div className="comment-form">
                    <input
                      className="comment-input"
                      placeholder="Add a comment…"
                      value={comments[img.imageId] || ""}
                      onChange={(e) =>
                        setComments((prev) => ({ ...prev, [img.imageId]: e.target.value }))
                      }
                      onKeyDown={(e) => e.key === "Enter" && handleAddComment(img.imageId)}
                    />
                    <button className="btn-add-comment" onClick={() => handleAddComment(img.imageId)}>
                      <SendIcon />
                    </button>
                  </div>

                  {img.comments && img.comments.length > 0 ? (
                    <div className="comment-list">
                      <p className="comment-list-label">Comments</p>
                      {img.comments.map((c, i) => (
                        <p key={i} className="comment-item">{c}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="no-comments">No comments yet</p>
                  )}
                </div>

                {/* Delete button */}
                <div className="image-card-footer">
                  <button
                    className="btn-delete-img"
                    onClick={() => setDeleteModal({ open: true, imageId: img.imageId })}
                  >
                    <TrashIcon /> Delete
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Delete confirmation modal ── */}
      {deleteModal.open && (
        <div className="modal-overlay" onClick={() => setDeleteModal({ open: false, imageId: null })}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <p className="modal-title">Delete image?</p>
            <p className="modal-desc">
              This image will be permanently removed. This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn-modal-cancel"
                onClick={() => setDeleteModal({ open: false, imageId: null })}>
                Cancel
              </button>
              <button className="btn-modal-danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </>
  );
};

export default AlbumDetail;