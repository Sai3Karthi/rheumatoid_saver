<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import PatientDetailsModal from './PatientDetailsModal';
import BlinkDetectionModal from './components/BlinkDetectionModal';
import EmergencyCallPopup from './components/EmergencyCallPopup';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true); // New state for loading screen
=======
import React, { useState } from 'react';
import PatientDetailsModal from './PatientDetailsModal';
import BlinkDetectionModal from './components/BlinkDetectionModal';
import './App.css';

function App() {
>>>>>>> 30239a6 (first)
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

<<<<<<< HEAD
  useEffect(() => {
    // Simulate a loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // 3 seconds loading time

    return () => clearTimeout(timer);
  }, []);

=======
>>>>>>> 30239a6 (first)
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
<<<<<<< HEAD
      }
    } else {
        window.open('tel:911');
=======
      } else {
        window.open('tel:911');
      }
>>>>>>> 30239a6 (first)
    }
  };

  const handleBlinkTest = () => {
<<<<<<< HEAD
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

=======
    setIsBlinkModalOpen(true);
  };

>>>>>>> 30239a6 (first)
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

  return (
    <div className="App">
<<<<<<< HEAD
      {isLoading ? (
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Loading Care Companion...</p>
        </div>
      ) : (
        <>
          {/* Header section removed */}

          <div className="container">
            <div className="section">
              <h2>Section A: Your Health Profile</h2>
              <div className="detail-display">
                <p><strong>Name:</strong> <span>{patientDetails.name}</span></p>
                <p><strong>Date of Birth:</strong> <span>{patientDetails.dob}</span></p>
                <p><strong>Medical ID:</strong> <span>{patientDetails.medicalID}</span></p>
                <p><strong>Photo:</strong> <span>{patientDetails.picture}</span></p>
                <p><strong>Medical Records:</strong> <span>{patientDetails.medicalRecords}</span></p>
              </div>
              <button onClick={() => setIsModalOpen(true)}>Update Your Information</button>

              <h3>How Are You Feeling Today?</h3>
              <textarea 
                value={distressMessage}
                onChange={(e) => setDistressMessage(e.target.value)}
                placeholder="Please share how you're feeling today. We're here to listen and help..."
              />
              <button onClick={handleReportDistress}>Share Your Feelings</button>
            </div>

            <div className="section">
              <h2>Section B: Health Monitoring</h2>
              <p className="feature-description">
                Start the AI-powered blink detection system to monitor your eye health.
              </p>
              <button 
                onClick={handleBlinkTest}
                className="primary-button"
              >
                🎬 Test Blink Detection Feature
              </button>
            </div>

            <div className="section">
              <h2>Section C: Add Family Numbers</h2>
              <p className="section-description">
                Add trusted family or emergency contacts. If a distress event is detected, the app will instantly call all saved numbers.
              </p>
              <div className="input-group">
                <input
                  type="text"
                  value={newNumber}
                  onChange={e => setNewNumber(e.target.value)}
                  placeholder="Enter phone number (e.g. +1234567890)"
                />
                <button onClick={handleAddNumber}>Add</button>
              </div>
              <ul className="number-list">
                {familyNumbers.length === 0 && <li className="empty-list-message">No numbers added yet.</li>}
                {familyNumbers.map(num => (
                  <li key={num} className="number-item">
                    <span className="phone-number-display">{num}</span>
                    <button className="secondary-button" onClick={() => handleRemoveNumber(num)}>Remove</button>
                  </li>
                ))}
              </ul>
              <div className="threshold-control">
                <label htmlFor="panic-threshold" className="label-text">Panic Blink Speed Threshold (blinks/sec):</label>
                <input
                  id="panic-threshold"
                  type="number"
                  min={1}
                  max={10}
                  step={0.1}
                  value={panicThreshold}
                  onChange={e => setPanicThreshold(Number(e.target.value))}
                  className="threshold-input"
                />
              </div>
            </div>

            {Array.from({ length: 24 }, (_, i) => (
              <div key={i + 2} className="section coming-soon">
                <h2>Section {String.fromCharCode(67 + i)}: Coming Soon</h2>
                <p>We're working on more features to support you and your loved ones. Check back soon for updates!</p>
              </div>
            ))}
          </div>

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
        </>
      )}
=======
      <div className="app-header">
        <div className="header-content">
          <h1>Care Companion</h1>
          <p>A gentle, caring platform designed to support you and your loved ones on your health journey. We're here to help make managing rheumatoid care easier and more comfortable.</p>
        </div>
        <div className="profile-picture-container">
          {patientDetails.pictureUrl ? (
            <div className="profile-picture">
              <img 
                src={patientDetails.pictureUrl} 
                alt="Your Profile" 
              />
            </div>
          ) : (
            <div className="profile-picture">
              👤
            </div>
          )}
        </div>
      </div>

      <div className="container">
        <div className="section">
          <h2>Section A: Your Health Profile</h2>
          <div className="detail-display">
            <p><strong>Name:</strong> <span>{patientDetails.name}</span></p>
            <p><strong>Date of Birth:</strong> <span>{patientDetails.dob}</span></p>
            <p><strong>Medical ID:</strong> <span>{patientDetails.medicalID}</span></p>
            <p><strong>Photo:</strong> <span>{patientDetails.picture}</span></p>
            <p><strong>Medical Records:</strong> <span>{patientDetails.medicalRecords}</span></p>
          </div>
          <button onClick={() => setIsModalOpen(true)}>Update Your Information</button>

          <h3>How Are You Feeling Today?</h3>
          <textarea 
            value={distressMessage}
            onChange={(e) => setDistressMessage(e.target.value)}
            placeholder="Please share how you're feeling today. We're here to listen and help..."
          />
          <button onClick={handleReportDistress}>Share Your Feelings</button>
        </div>

        <div className="section">
          <h2>Section B: Health Monitoring</h2>
          <p style={{ marginBottom: '20px', fontSize: '1.1em', color: '#636e72' }}>
            Advanced health monitoring features to help track your well-being and detect early signs of distress.
          </p>
          
          <div style={{ marginBottom: '25px' }}>
            <h3>👁️ Blink Detection Analysis</h3>
            <p style={{ fontSize: '1em', color: '#636e72', marginBottom: '15px' }}>
              Our AI-powered blink detection system can help monitor your eye health and detect patterns that might indicate fatigue, stress, or other health concerns.
            </p>
            <button 
              onClick={handleBlinkTest}
              style={{
                background: 'linear-gradient(135deg, #74b9ff, #0984e3)',
                marginBottom: '15px'
              }}
            >
              🎬 Test Blink Detection Feature
            </button>
          </div>
          
          <div style={{ marginBottom: '25px' }}>
            <h3>🚨 Emergency Assistance</h3>
            <p style={{ fontSize: '1em', color: '#636e72', marginBottom: '15px' }}>
              If you need immediate assistance, we're here for you 24/7.
            </p>
            <button onClick={handleEmergencyCall}>🚨 Call for Help (911)</button>
          </div>
        </div>

        <div className="section">
          <h2>Section C: Add Family Numbers</h2>
          <p style={{ fontSize: '1.1em', color: '#636e72', marginBottom: '15px' }}>
            Add trusted family or emergency contacts. If a distress event is detected, the app will instantly call all saved numbers.
          </p>
          <div style={{ width: '100%', maxWidth: 400, margin: '0 auto 20px auto', display: 'flex', gap: 10 }}>
            <input
              type="text"
              value={newNumber}
              onChange={e => setNewNumber(e.target.value)}
              placeholder="Enter phone number (e.g. +1234567890)"
              style={{ flex: 1 }}
            />
            <button onClick={handleAddNumber}>Add</button>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {familyNumbers.length === 0 && <li style={{ color: '#b2bec3' }}>No numbers added yet.</li>}
            {familyNumbers.map(num => (
              <li key={num} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f1f2f6', borderRadius: 8, padding: '8px 14px', marginBottom: 8 }}>
                <span style={{ fontFamily: 'monospace', fontSize: '1.1em' }}>{num}</span>
                <button className="secondary" style={{ padding: '6px 14px', fontSize: '0.95em' }} onClick={() => handleRemoveNumber(num)}>Remove</button>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 20 }}>
            <label htmlFor="panic-threshold" style={{ fontWeight: 600, color: '#636e72' }}>Panic Blink Speed Threshold (blinks/sec):</label>
            <input
              id="panic-threshold"
              type="number"
              min={1}
              max={10}
              step={0.1}
              value={panicThreshold}
              onChange={e => setPanicThreshold(Number(e.target.value))}
              style={{ width: 80, marginLeft: 10 }}
            />
          </div>
        </div>

        {Array.from({ length: 24 }, (_, i) => (
          <div key={i + 2} className="section">
            <h2>Section {String.fromCharCode(67 + i)}: Coming Soon</h2>
            <p>We're working on more features to support you and your loved ones. Check back soon for updates!</p>
          </div>
        ))}
      </div>

      <PatientDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePatientDetails}
        currentDetails={patientDetails}
      />

      <BlinkDetectionModal 
        isOpen={isBlinkModalOpen}
        onClose={() => setIsBlinkModalOpen(false)}
        patientName={patientDetails.name !== 'N/A' ? patientDetails.name : 'Patient'}
        familyNumbers={familyNumbers}
        panicThreshold={panicThreshold}
      />
>>>>>>> 30239a6 (first)
    </div>
  );
}

<<<<<<< HEAD
export default App;
=======
export default App; 
>>>>>>> 30239a6 (first)
