// import React, { useState } from "react";
// import { updateUserProfileApi } from "../../api/userApi";
// import "./EditProfileModals.css";

// export default function EditProfileModal({ user, onClose, onUpdate }) {
//   const [formData, setFormData] = useState({
//     name: user.name || "",
//     username: user.username || "",
//     userBio: user.userBio || "",
//   });
//   const [profileImage, setProfileImage] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleFileChange = (e) => {
//     if (e.target.files && e.target.files[0]) {
//       setProfileImage(e.target.files[0]);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const data = new FormData();
//       data.append("name", formData.name);
//       data.append("username", formData.username);
//       data.append("userBio", formData.userBio);
//       if (profileImage) {
//         data.append("profileImage", profileImage);
//       }

//       const response = await updateUserProfileApi(user.userId, data);
//       onUpdate(response.data);
//     } catch (err) {
//       console.error("Failed to update profile:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//         <div className="modal-header">
//           <h3>Edit Profile</h3>
//           <button className="close-btn" onClick={onClose}>×</button>
//         </div>

//         <form onSubmit={handleSubmit} className="edit-form">
//           <div className="form-group">
//             <label htmlFor="name">Name</label>
//             <input
//               type="text"
//               id="name"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//             />
//           </div>

//           <div className="form-group">
//             <label htmlFor="username">Username</label>
//             <input
//               type="text"
//               id="username"
//               name="username"
//               value={formData.username}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div className="form-group">
//             <label htmlFor="userBio">Bio</label>
//             <textarea
//               id="userBio"
//               name="userBio"
//               value={formData.userBio}
//               onChange={handleChange}
//               rows="3"
//               placeholder="Tell us about yourself..."
//             />
//           </div>

//           <div className="form-group">
//             <label htmlFor="profileImage">Profile Image</label>
//             <input
//               type="file"
//               id="profileImage"
//               name="profileImage"
//               accept="image/*"
//               onChange={handleFileChange}
//             />
//           </div>

//           <div className="form-actions">
//             <button type="button" className="btn btn-secondary" onClick={onClose}>
//               Cancel
//             </button>
//             <button type="submit" className="btn btn-primary" disabled={loading}>
//               {loading ? "Saving..." : "Save Changes"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 1. Handle File Selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 2. Create FormData
      const data = new FormData();
      data.append("name", formData.name);
      data.append("username", formData.username);
      data.append("userBio", formData.userBio);

      // 3. Append Image if selected
      if (profileImage) {
        data.append("profileImage", profileImage);
      }

      const response = await updateUserProfileApi(user.userId, data);
      onUpdate(response.data);
      onClose(); // Close modal on success
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
          {/* Name Field */}
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          {/* Username Field */}
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

          {/* Bio Field */}
          <div className="form-group">
            <label htmlFor="userBio">Bio</label>
            <textarea
              id="userBio"
              name="userBio"
              value={formData.userBio}
              onChange={handleChange}
              rows="3"
            />
          </div>

          {/* Image Upload Field */}
          <div className="form-group">
            <label htmlFor="profileImage">Profile Image</label>
            <input
              type="file"
              id="profileImage"
              name="profileImage"
              accept="image/*"
              onChange={handleFileChange}
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