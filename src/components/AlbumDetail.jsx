import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import {
  CameraIcon,
  ArrowLeftIcon,
  UploadIcon,
  TrashIcon,
  SendIcon,
  ImagesIcon,
} from "./icons";
import { useToast } from "./useToast";

const Lightbox = ({ src, onClose }) => {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        cursor: "zoom-out",
        alignItems: "center",
        justifyContent: "center",
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
    >
      <img
        src={src}
        alt="Full size"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "90vw",
          maxHeight: "90vh",
          borderRadius: "var(--radius-md)",
          objectFit: "contain",
          boxShadow: "0 24px 80px rgba(0,0,0,0.8)",
        }}
      />
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "20px",
          right: "24px",
          background: "rgba(8,10,15,0.8)",
          border: "1px solid var(--border-2)",
          color: "var(--text-1)",
          width: "40px",
          height: "40px",
          borderRadius: "var(--radius-full)",
          cursor: "pointer",
          fontSize: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-ui)",
        }}
        aria-label="Close preview"
      >
        ×
      </button>
    </div>
  );
};

const AlbumDetail = () => {
  const { albumId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { showToast, ToastContainer } = useToast();

  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    imageId: null,
  });
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    axios
      .get(`/api/images/${albumId}`)
      .then((res) => setImages(res.data.images || []))
      .catch(() => showToast("Failed to load images", "error"))
      .finally(() => setLoading(false));
  }, [albumId, showToast]);

  const handleFileSelect = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith("image/"))
      return showToast("Please select an image file", "error");
    if (f.size > 10 * 1024 * 1024)
      return showToast("Image must be under 10 MB", "error");
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

  const handleDragOver = (e) => {
    e.preventDefault();
  };
  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (!f) return;
    if (!f.type.startsWith("image/"))
      return showToast("Please drop an image file", "error");
    if (f.size > 10 * 1024 * 1024)
      return showToast("Image must be under 10 MB", "error");
    setFile(f);
    setFileName(f.name);
  };

  const handleAddComment = async (imageId) => {
    const comment = comments[imageId]?.trim();
    if (!comment) return showToast("Write a comment first", "error");
    try {
      const res = await axios.post(
        `/api/images/${albumId}/${imageId}/comments`,
        { comment },
      );
      setImages((prev) =>
        prev.map((img) =>
          img.imageId === imageId
            ? { ...img, comments: res.data.comments }
            : img,
        ),
      );
      setComments((prev) => ({ ...prev, [imageId]: "" }));
    } catch {
      showToast("Could not add comment", "error");
    }
  };

  const handleToggleFavourite = async (imageId) => {
    setImages((prev) =>
      prev.map((img) =>
        img.imageId === imageId ? { ...img, isFavorite: !img.isFavorite } : img,
      ),
    );
    try {
      const res = await axios.put(`/api/images/${albumId}/${imageId}/favorite`);
      setImages((prev) =>
        prev.map((img) =>
          img.imageId === imageId
            ? { ...img, isFavorite: res.data.isFavorite }
            : img,
        ),
      );
    } catch {
      setImages((prev) =>
        prev.map((img) =>
          img.imageId === imageId
            ? { ...img, isFavorite: !img.isFavorite }
            : img,
        ),
      );
      showToast("Could not update favourite", "error");
    }
  };

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
        <button className="topnav-back" onClick={() => navigate("/albums")}>
          <ArrowLeftIcon /> Back to albums
        </button>
      </nav>

      <main className="page-content">
        <div className="page-header">
          <span className="page-eyebrow">Album</span>
          <h1 className="page-title">Photos</h1>
          <p className="page-subtitle">
            Hover a photo to favourite it · click to preview · press Enter to
            post a comment
          </p>
        </div>

        <div
          className="upload-bar"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <span className="upload-bar-label">Upload</span>

          <label
            className="file-pick-btn"
            style={{ cursor: "pointer" }}
            aria-label="Choose image file"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />
            <UploadIcon />
            <span className={`file-name-display ${fileName ? "has-file" : ""}`}>
              {fileName || "Choose or drop an image here…"}
            </span>
          </label>

          <button
            className="btn-upload"
            onClick={handleUpload}
            disabled={uploading || !file}
          >
            <UploadIcon />
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </div>

        {loading ? (
          <div className="loading-screen">
            <div className="spinner" />
            <p className="loading-text">Loading photos…</p>
          </div>
        ) : images.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <ImagePlaceholderIcon />
            </div>
            <p>No photos yet.</p>
            <p className="empty-action">
              Upload your first photo using the panel above.
            </p>
          </div>
        ) : (
          <div className="image-grid">
            {images.map((img) => (
              <div className="image-card" key={img.imageId}>
                <div
                  className="image-card-thumb"
                  onClick={() => img.url && setLightbox(img.url)}
                  style={{ cursor: img.url ? "zoom-in" : "default" }}
                  role={img.url ? "button" : undefined}
                  tabIndex={img.url ? 0 : undefined}
                  aria-label={img.url ? "View full size" : undefined}
                  onKeyDown={(e) =>
                    e.key === "Enter" && img.url && setLightbox(img.url)
                  }
                >
                  {img.url ? (
                    <img src={img.url} alt={img.name || ""} loading="lazy" />
                  ) : (
                    <div
                      className="empty-state-icon"
                      style={{ margin: "auto" }}
                    >
                      <ImagePlaceholderIcon />
                    </div>
                  )}

                  <div className="image-card-overlay">
                    <button
                      className={`btn-fav ${img.isFavorite ? "is-fav" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavourite(img.imageId);
                      }}
                      title={
                        img.isFavorite
                          ? "Remove from favourites"
                          : "Add to favourites"
                      }
                      aria-label={
                        img.isFavorite
                          ? "Remove from favourites"
                          : "Add to favourites"
                      }
                      aria-pressed={img.isFavorite}
                    >
                      {img.isFavorite ? "♥" : "♡"}
                    </button>
                  </div>
                </div>

                <div className="image-card-body">
                  <div className="comment-form">
                    <input
                      className="comment-input"
                      placeholder="Add a comment…"
                      value={comments[img.imageId] || ""}
                      onChange={(e) =>
                        setComments((prev) => ({
                          ...prev,
                          [img.imageId]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleAddComment(img.imageId)
                      }
                      aria-label="Add comment"
                    />
                    <button
                      className="btn-add-comment"
                      onClick={() => handleAddComment(img.imageId)}
                      aria-label="Post comment"
                    >
                      <SendIcon />
                    </button>
                  </div>

                  {img.comments && img.comments.length > 0 ? (
                    <div className="comment-list">
                      <p className="comment-list-label">Comments</p>
                      {img.comments.map((c, i) => (
                        <p key={i} className="comment-item">
                          {c}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="no-comments">No comments yet</p>
                  )}
                </div>

                <div className="image-card-footer">
                  <button
                    className="btn-delete-img"
                    onClick={() =>
                      setDeleteModal({ open: true, imageId: img.imageId })
                    }
                    aria-label="Delete image"
                  >
                    <TrashIcon /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {lightbox && (
        <Lightbox src={lightbox} onClose={() => setLightbox(null)} />
      )}

      {deleteModal.open && (
        <div
          className="modal-overlay"
          onClick={() => setDeleteModal({ open: false, imageId: null })}
          role="dialog"
          aria-modal="true"
          aria-labelledby="del-modal-title"
        >
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-badge">🗑️</div>
            <p className="modal-title" id="del-modal-title">
              Delete this photo?
            </p>
            <p className="modal-desc">
              This photo will be permanently removed. This action cannot be
              undone.
            </p>
            <div className="modal-actions">
              <button
                className="btn-modal-cancel"
                onClick={() => setDeleteModal({ open: false, imageId: null })}
              >
                Cancel
              </button>
              <button className="btn-modal-danger" onClick={confirmDelete}>
                Delete photo
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </>
  );
};

export default AlbumDetail;
