import React, { useState, useEffect } from 'react';
import PatientDetailsModal from './PatientDetailsModal';
import BlinkDetectionModal from './components/BlinkDetectionModal';
import EmergencyCallPopup from './components/EmergencyCallPopup';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [patientDetails, setPatientDetails] = useState({
    name: 'N/A',
    dob: 'N/A',
    medicalID: 'N/A',
    picture: 'N/A',
    medicalRecords: 'N/A',
    pictureUrl: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBlinkModalOpen, setIsBlinkModalOpen] = useState(false);
  const [distressMessage, setDistressMessage] = useState('');
  const [familyNumbers, setFamilyNumbers] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('familyNumbers') || '[]');
    } catch {
      return [];
    }
  });
  const [newNumber, setNewNumber] = useState('');
  const [panicThreshold, setPanicThreshold] = useState(2.5); // blinks/sec

  // Loading screen effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Menu event listeners - these will now be handled by native Electron menu, no longer needed in React
  useEffect(() => {
    if (window.electronAPI) {
      const handleOpenPatientModal = () => setIsModalOpen(true);
      const handleOpenBlinkModal = () => setIsBlinkModalOpen(true);
      const handleCallEmergency = () => handleEmergencyCall();

      window.electronAPI.onOpenPatientModal(handleOpenPatientModal);
      window.electronAPI.onOpenBlinkModal(handleOpenBlinkModal);
      window.electronAPI.onCallEmergency(handleCallEmergency);

      return () => {
        // Cleanup listeners if needed
      };
    }
  }, []);

  const handleSavePatientDetails = (details) => {
    setPatientDetails(details);
    setIsModalOpen(false);
  };

  const handleReportDistress = () => {
    if (distressMessage.trim()) {
      // Use the electronAPI to send distress report
      if (window.electronAPI) {
        window.electronAPI.reportDistress(distressMessage);
      } else {
        alert(`We've received your message: "${distressMessage}". We're here to help you.`);
      }
      setDistressMessage('');
    } else {
      alert('Please let us know how you are feeling so we can help you better.');
    }
  };

  const handleEmergencyCall = () => {
    if (window.confirm('Are you sure you want to call emergency services? We want to make sure you get the help you need.')) {
      if (window.electronAPI) {
        window.electronAPI.callEmergency();
      }
    } else {
        window.open('tel:911');
    }
  };

  const handleBlinkTest = () => {
    console.log('handleBlinkTest called. Setting isBlinkModalOpen to true.');
    setIsBlinkModalOpen(true);
  };

  const handleCloseBlinkModal = () => {
    console.log('handleCloseBlinkModal called. Setting isBlinkModalOpen to false.');
    setIsBlinkModalOpen(false);
  };

  // New state for emergency call popup
  const [isEmergencyPopupOpen, setIsEmergencyPopupOpen] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState('');

  const handleBlinkEmergencyTrigger = (reason) => {
    // Directly trigger the emergency call via IPC when excessive blinking is detected
    console.log(`Blink-triggered emergency: ${reason}. Attempting to call family numbers directly.`);
    if (window.electron && window.electron.sendEmergencyCall) {
      window.electron.sendEmergencyCall(patientDetails.name !== 'N/A' ? patientDetails.name : 'Patient', familyNumbers);
    } else {
      console.warn('Electron IPC not available or sendEmergencyCall not exposed. Falling back to system dialer for blink emergency.');
      familyNumbers.forEach(num => {
        window.open(`tel:${num}`);
      });
    }
    // Optionally, you might still want a notification here, but not a blocking popup.
    // setIsEmergencyPopupOpen(true); // No longer opening the popup automatically for blink detection
  };

  const handleConfirmEmergencyCall = () => {
    // This will now only be called if a separate, manual trigger uses it (e.g., a specific button)
    // The blink-triggered call is now direct.
    if (window.electron && window.electron.sendEmergencyCall) {
      window.electron.sendEmergencyCall(patientDetails.name !== 'N/A' ? patientDetails.name : 'Patient', familyNumbers);
    } else {
      console.warn('Electron IPC not available or sendEmergencyCall not exposed. Falling back to system dialer.');
      familyNumbers.forEach(num => {
        window.open(`tel:${num}`);
      });
    }
    setIsEmergencyPopupOpen(false); // Close popup after confirming
  };

  const handleCancelEmergencyCall = () => {
    setIsEmergencyPopupOpen(false);
  };

  const handleAddNumber = () => {
    if (newNumber.trim() && /^\+?\d{7,15}$/.test(newNumber.trim())) {
      const updated = [...familyNumbers, newNumber.trim()];
      setFamilyNumbers(updated);
      localStorage.setItem('familyNumbers', JSON.stringify(updated));
      setNewNumber('');
    } else {
      alert('Please enter a valid phone number (7-15 digits, optional +).');
    }
  };

  const handleRemoveNumber = (num) => {
    const updated = familyNumbers.filter(n => n !== num);
    setFamilyNumbers(updated);
    localStorage.setItem('familyNumbers', JSON.stringify(updated));
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h1>Care Companion</h1>
          <p>Loading your personalized care experience...</p>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div className="loading-progress">
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
            <p className="progress-text">Initializing care systems...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Care Companion</h1>
      </header>
      <main>
        <div className="container">
          <section className="section" id="section-a">
            <h2>Section A: Patient Information</h2>
            <div className="detail-display">
              <p><strong>Name:</strong> {patientDetails.name}</p>
              <p><strong>Date of Birth:</strong> {patientDetails.dob}</p>
              <p><strong>Medical ID:</strong> {patientDetails.medicalID}</p>
              {patientDetails.pictureUrl && (
                <div className="patient-picture">
                  <img src={patientDetails.pictureUrl} alt="Patient" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} />
                </div>
              )}
            </div>
            <button onClick={() => setIsModalOpen(true)}>Open Patient Details</button>
          </section>
          <section className="section" id="section-b">
            <h2>Section B: Real-time Monitoring</h2>
            <div className="detail-display">
              <p><strong>Current Status:</strong> Monitoring Active</p>
              <p><strong>Last Check:</strong> {new Date().toLocaleTimeString()}</p>
              <p><strong>Blink Detection:</strong> Ready</p>
            </div>
            <button onClick={() => setIsBlinkModalOpen(true)}>Open Blink Detection</button>
          </section>
          <section className="section" id="section-c">
            <h2>Section C: Emergency Contacts & Actions</h2>
            <div className="detail-display">
              <p><strong>Emergency Contacts:</strong></p>
              {familyNumbers.length > 0 ? (
                <ul className="number-list">
                  {familyNumbers.map((num, index) => (
                    <li key={index} className="number-item">
                      <span className="phone-number-display">{num}</span>
                      <button onClick={() => handleRemoveNumber(num)} className="secondary">Remove</button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-list-message">No emergency contacts added yet.</p>
              )}
              <div className="input-group">
                <input
                  type="text"
                  value={newNumber}
                  onChange={(e) => setNewNumber(e.target.value)}
                  placeholder="Enter phone number"
                />
                <button onClick={handleAddNumber}>Add Contact</button>
              </div>
            </div>
            <button onClick={handleEmergencyCall} className="alert-button">Emergency Call</button>
          </section>
        </div>
      </main>

      <PatientDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePatientDetails}
        currentDetails={patientDetails}
      />

      <BlinkDetectionModal 
        isOpen={isBlinkModalOpen}
        onClose={handleCloseBlinkModal}
        patientName={patientDetails.name !== 'N/A' ? patientDetails.name : 'Patient'}
        familyNumbers={familyNumbers}
        panicThreshold={panicThreshold}
        onEmergencyTrigger={handleBlinkEmergencyTrigger} // New prop for emergency trigger
      />

      <EmergencyCallPopup 
        isOpen={isEmergencyPopupOpen}
        onConfirm={handleConfirmEmergencyCall}
        onClose={handleCancelEmergencyCall}
        patientName={patientDetails.name !== 'N/A' ? patientDetails.name : 'Patient'}
        familyNumbers={familyNumbers}
        reason={emergencyReason}
      />
    </div>
  );
}

export default App; 
