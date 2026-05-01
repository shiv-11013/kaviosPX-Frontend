import axios from "../api/axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const AlbumDetails = () => {
  const { albumId } = useParams();

  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // UPDATED: Path changed to /api/images
    axios
      .get(`/api/images/${albumId}`)
      .then((response) => {
        setImages(response.data.images || []);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [albumId]);

  const handleUpload = async () => {
    if (!file) {
      return alert("Please select a file first.");
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      // UPDATED: Path changed to /api/images
      const response = await axios.post(
        `/api/images/${albumId}`,
        formData
      );

      setImages((prev) => [...prev, response.data.image]);
      setFile(null);
      alert("Image uploaded");
    } catch (err) {
      alert("Upload failed");
    }
  };

  const handleAddComment = async (imageId) => {
    const comment = comments[imageId];

    if (!comment || !comment.trim()) {
      alert("Please add the comment");
      return;
    }

    try {
      // UPDATED: Path changed to /api/images
      const response = await axios.post(
        `/api/images/${albumId}/${imageId}/comments`,
        { comment }
      );

      const updatedImages = images.map((img) => {
        if (img.imageId === imageId) {
          return { ...img, comments: response.data.comments };
        }
        return img;
      });

      setImages(updatedImages);

      setComments({
        ...comments,
        [imageId]: "",
      });

      alert("Comment Added");
    } catch (err) {
      alert("Comment failed");
    }
  };

  const handleToggleFavorite = async (imageId) => {
    try {
      // UPDATED: Path changed to /api/images
      const response = await axios.put(
        `/api/images/${albumId}/${imageId}/favorite`
      );

      const updatedImages = images.map((img) => {
        if (img.imageId === imageId) {
          return { ...img, isFavorite: response.data.isFavorite };
        }
        return img;
      });

      setImages(updatedImages);
    } catch (err) {
      alert("Favorite toggle failed");
    }
  };

  const handleDeleteImage = async (imageId) => {
    const confirmDelete = window.confirm("Do you want to delete this image?");
    if (!confirmDelete) return;

    try {
      // UPDATED: Path changed to /api/images
      await axios.delete(`/api/images/${albumId}/${imageId}`);

      const updatedImages = images.filter(
        (img) => img.imageId !== imageId
      );

      setImages(updatedImages);
    } catch (err) {
      alert("Delete failed");
    }
  };

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <div className="container">
      <h1>Images</h1>

      {images.length === 0 ? (
        <p>No images found</p>
      ) : (
        <div className="image-grid">
          {images.map((img) => (
            <div className="image-card" key={img.imageId}>
              {img.url && <img src={img.url} alt="album" />}

              <button
                className="like-btn"
                onClick={() => handleToggleFavorite(img.imageId)}
              >
                {img.isFavorite ? "❤️" : "🤍"}
              </button>

              <button
                className="delete-btn"
                onClick={() => handleDeleteImage(img.imageId)}
              >
                Delete Image
              </button>

              <input
                className="comment-box"
                value={comments[img.imageId] || ""}
                onChange={(e) =>
                  setComments({
                    ...comments,
                    [img.imageId]: e.target.value,
                  })
                }
              />

              <button
                className="comment-btn"
                onClick={() => handleAddComment(img.imageId)}
              >
                Add Comment
              </button>

              <div className="comment-list">
                <h4>Comments</h4>
                {img.comments &&
                  img.comments.map((comn, index) => (
                    <p key={index}>{comn}</p>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="upload-box">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button onClick={handleUpload}>Upload Now</button>
      </div>
    </div>
  );
};

export default AlbumDetails;