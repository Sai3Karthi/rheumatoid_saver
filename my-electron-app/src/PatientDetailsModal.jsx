import React, { useState, useRef } from 'react';
import './PatientDetailsModal.css';

const PatientDetailsModal = ({ isOpen, onClose, onSave, currentDetails }) => {
  const [formData, setFormData] = useState(currentDetails);
  const [selectedPicture, setSelectedPicture] = useState(null);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [picturePreview, setPicturePreview] = useState('');

  const pictureInputRef = useRef(null);
  const recordsInputRef = useRef(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePictureChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedPicture(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPicturePreview(e.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRecordsChange = (event) => {
    const files = Array.from(event.target.files || []);
    setSelectedRecords(files);
  };

  const handleSave = async () => {
    const updatedDetails = {
      ...formData,
      picture: selectedPicture ? selectedPicture.name : currentDetails.picture,
      pictureUrl: picturePreview || currentDetails.pictureUrl,
      medicalRecords: selectedRecords.length > 0 
        ? selectedRecords.map(file => file.name).join(', ')
        : currentDetails.medicalRecords
    };

    // If we have files to upload and electronAPI is available, use it
    if ((selectedPicture || selectedRecords.length > 0) && window.electronAPI) {
      try {
        const patientDetails = {
          name: formData.name,
          dob: formData.dob,
          medicalID: formData.medicalID,
          picture: selectedPicture ? {
            buffer: Array.from(new Uint8Array(await selectedPicture.arrayBuffer())),
            name: selectedPicture.name
          } : null,
          medicalRecords: await Promise.all(selectedRecords.map(async (file) => ({
            buffer: Array.from(new Uint8Array(await file.arrayBuffer())),
            name: file.name
          })))
        };

        const response = await window.electronAPI.savePatientDetails(patientDetails);
        console.log('Patient details saved:', response);
      } catch (error) {
        console.error('Error saving patient details:', error);
      }
    }

    onSave(updatedDetails);
  };

  if (!isOpen) return null;

  return (
    <div className={`modal-backdrop ${isOpen ? 'show' : ''}`} onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>
          &times;
        </button>
        
        <h2>Your Health Information</h2>
        
        <div className="form-group">
          <label htmlFor="patientName">Full Name:</label>
          <input
            type="text"
            id="patientName"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter your full name here..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="patientDOB">Date of Birth:</label>
          <input
            type="date"
            id="patientDOB"
            value={formData.dob}
            onChange={(e) => handleInputChange('dob', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="patientMedicalID">Medical ID Number:</label>
          <input
            type="text"
            id="patientMedicalID"
            value={formData.medicalID}
            onChange={(e) => handleInputChange('medicalID', e.target.value)}
            placeholder="Your medical ID or insurance number..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="patientPicture">Add Your Photo:</label>
          <input
            ref={pictureInputRef}
            type="file"
            id="patientPicture"
            accept="image/*"
            onChange={handlePictureChange}
          />
          {picturePreview && (
            <div className="picture-preview">
              <img src={picturePreview} alt="Your Photo Preview" />
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="medicalRecords">Upload Medical Documents:</label>
          <input
            ref={recordsInputRef}
            type="file"
            id="medicalRecords"
            multiple
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleRecordsChange}
          />
          {selectedRecords.length > 0 && (
            <div className="records-preview">
              <p>📄 Files ready to upload: {selectedRecords.map(file => file.name).join(', ')}</p>
            </div>
          )}
        </div>

        <div className="modal-buttons">
          <button onClick={handleSave}>💾 Save My Information</button>
          <button className="secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailsModal; 