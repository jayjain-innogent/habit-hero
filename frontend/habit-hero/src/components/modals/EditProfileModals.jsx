import React, { useState } from "react";
import { updateUserApi } from "../../api/userApi";
import "./EditProfileModals.css";

export default function EditProfileModal({ user, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    username: user.username || "",
    userBio: user.userBio || ""
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user.profileImageUrl || "");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (selectedFile) {
        const formDataWithFile = new FormData();
        formDataWithFile.append('username', formData.username);
        formDataWithFile.append('userBio', formData.userBio);
        formDataWithFile.append('profileImage', selectedFile);
        
        const response = await updateUserApi(user.userId, formDataWithFile);
        onUpdate(response.data);
      } else {
        const response = await updateUserApi(user.userId, formData);
        onUpdate(response.data);
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Profile</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-group profile-image-section">
            <div className="image-preview">
              <img 
                src={previewUrl || "../../public/avator.jpeg"} 
                alt="Profile" 
                style={{ 
                  width: '120px', 
                  height: '120px', 
                  objectFit: 'cover', 
                  borderRadius: '50%',
                  margin: '0 auto',
                  display: 'block'
                }} 
              />
            </div>
            
            <div className="upload-section">
              <label htmlFor="imageFile" className="upload-btn">
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

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="userBio">Bio</label>
            <textarea
              id="userBio"
              name="userBio"
              value={formData.userBio}
              onChange={handleChange}
              rows="3"
              placeholder="Tell us about yourself..."
            />
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

