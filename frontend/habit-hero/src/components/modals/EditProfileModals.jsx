import React, { useState } from "react";
import { updateUserProfileApi } from "../../api/userApi";
import "./EditProfileModals.css";

export default function EditProfileModal({ user, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    name: user.name || "",
    username: user.username || "",
    userBio: user.userBio || "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(user?.profileImageUrl || null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      // Create a preview URL for the selected image
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (profileImage) {
        const formDataWithFile = new FormData();
        formDataWithFile.append('username', formData.username);
        formDataWithFile.append('userBio', formData.userBio);
        formDataWithFile.append('profileImage', profileImage);

        const response = await updateUserProfileApi(user.userId, formDataWithFile);
        onUpdate(response.data);
      } else {
        const response = await updateUserProfileApi(user.userId, formData);
        onUpdate(response.data);
      }
      onClose();
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-profile-overlay" onClick={onClose}>
      <div className="edit-profile-content" onClick={(e) => e.stopPropagation()}>
        <div className="edit-profile-header">
          <h3 className="edit-profile-title">Edit Profile</h3>
          <button className="edit-profile-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="edit-profile-form">

          <div className="edit-form-group profile-image-section">
            <div className="image-preview">
              <img
                src={previewUrl || "../../public/avator.jpg"}
                alt="Profile"
                className="profile-preview-image"
              />
            </div>

            <div className="upload-section">
              <label htmlFor="imageFile" className="edit-upload-btn">
                Change Photo
              </label>
              <input
                type="file"
                id="imageFile"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          <div className="edit-form-group">
            <label htmlFor="username" className="edit-form-label">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="edit-form-input"
              required
            />
          </div>

          <div className="edit-form-group">
            <label htmlFor="userBio" className="edit-form-label">Bio</label>
            <textarea
              id="userBio"
              name="userBio"
              value={formData.userBio}
              onChange={handleChange}
              rows="3"
              className="edit-form-textarea"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="edit-form-actions">
            <button type="button" className="edit-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="edit-btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
