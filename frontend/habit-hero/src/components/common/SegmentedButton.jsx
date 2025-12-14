import React from "react";
import "./SegmentedButton.css";

const SegmentedButton = ({ options, selected, onChange }) => {
  return (
    <div className="segmented-button">
      {options.map((option) => (
      <button
        key={option.value}
        type="button" 
        className={`segmented-button-option ${
          selected === option.value ? "selected" : ""
        }`}
        onClick={() => onChange(option.value)}
      >
        {option.label}
      </button>
      ))}
    </div>
  );
};

export default SegmentedButton;