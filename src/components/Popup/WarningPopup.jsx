import React from "react";
import "./popup.css";

function WarningPopup({ message, onClose }) {
  return (
    <div className="small-popup-overlay" onClick={onClose}>
      <div className="small-popup" onClick={(e) => e.stopPropagation()}>
        <h4>Warning</h4>
        <p>{message}</p>
        <button onClick={onClose}>OK</button>
      </div>
    </div>
  );
}

export default WarningPopup;
