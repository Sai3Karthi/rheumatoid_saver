import React from 'react';
import './EmergencyCallPopup.css';

const EmergencyCallPopup = ({ isOpen, onClose, onConfirm, patientName, familyNumbers, reason }) => {
  if (!isOpen) return null;

  return (
    <div className="emergency-popup-overlay">
      <div className="emergency-popup-content">
        <h2>🚨 Emergency Alert! 🚨</h2>
        <p className="popup-message">
          It looks like <span className="patient-name-highlight">{patientName}</span> might be in distress.
          The system detected: <span className="reason-highlight">{reason}</span>
        </p>
        <p className="popup-instruction">
          Do you want to initiate an emergency call to the following contacts?
        </p>
        <ul className="family-numbers-list">
          {familyNumbers.map(number => (
            <li key={number}>{number}</li>
          ))}
        </ul>
        <div className="popup-buttons">
          <button className="confirm-button" onClick={onConfirm}>
            📞 Confirm Call
          </button>
          <button className="cancel-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyCallPopup; 