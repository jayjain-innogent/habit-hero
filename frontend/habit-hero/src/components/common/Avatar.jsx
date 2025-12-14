import React from 'react';

const Avatar = ({ src, alt }) => {
  const fallback = "/avator.jpg";
  return (
    <img
      src={src || fallback}
      alt={alt || ""}
      style={{
        width: 46,
        height: 46,
        borderRadius: "50%",
        objectFit: "cover",
        border: "2px solid #fff",
        boxShadow: "0 0 0 1px rgba(0,0,0,0.04)"
      }}
    />
  );
};

export default Avatar;
