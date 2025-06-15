import React, { useState, useEffect } from 'react';
import './SettingsModal.css';

const SettingsModal = ({ isOpen, onClose, currentTheme, onThemeChange }) => {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme || 'default');
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState('medium');
  const [animations, setAnimations] = useState(true);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    if (isOpen) {
      // Load saved settings from localStorage
      const savedTheme = localStorage.getItem('appTheme') || 'default';
      const savedDarkMode = localStorage.getItem('darkMode') === 'true';
      const savedFontSize = localStorage.getItem('fontSize') || 'medium';
      const savedAnimations = localStorage.getItem('animations') !== 'false';
      const savedNotifications = localStorage.getItem('notifications') !== 'false';

      setSelectedTheme(savedTheme);
      setDarkMode(savedDarkMode);
      setFontSize(savedFontSize);
      setAnimations(savedAnimations);
      setNotifications(savedNotifications);
    }
  }, [isOpen]);

  const handleThemeChange = (theme) => {
    setSelectedTheme(theme);
    localStorage.setItem('appTheme', theme);
    onThemeChange(theme);
  };

  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    document.body.classList.toggle('dark-mode', newDarkMode);
  };

  const handleFontSizeChange = (size) => {
    setFontSize(size);
    localStorage.setItem('fontSize', size);
    document.documentElement.setAttribute('data-font-size', size);
  };

  const handleAnimationsToggle = () => {
    const newAnimations = !animations;
    setAnimations(newAnimations);
    localStorage.setItem('animations', newAnimations.toString());
    document.body.classList.toggle('no-animations', !newAnimations);
  };

  const handleNotificationsToggle = () => {
    const newNotifications = !notifications;
    setNotifications(newNotifications);
    localStorage.setItem('notifications', newNotifications.toString());
  };

  const handleResetSettings = () => {
    setSelectedTheme('default');
    setDarkMode(false);
    setFontSize('medium');
    setAnimations(true);
    setNotifications(true);
    
    localStorage.removeItem('appTheme');
    localStorage.removeItem('darkMode');
    localStorage.removeItem('fontSize');
    localStorage.removeItem('animations');
    localStorage.removeItem('notifications');
    
    document.body.classList.remove('dark-mode');
    document.documentElement.setAttribute('data-font-size', 'medium');
    document.body.classList.remove('no-animations');
    
    onThemeChange('default');
  };

  const themes = [
    {
      id: 'default',
      name: 'Care Companion',
      description: 'The original medical-themed design',
      colors: ['#667eea', '#764ba2'],
      preview: '🏥'
    },
    {
      id: 'ocean',
      name: 'Ocean Breeze',
      description: 'Calming blue tones for a peaceful experience',
      colors: ['#4facfe', '#00f2fe'],
      preview: '🌊'
    },
    {
      id: 'sunset',
      name: 'Sunset Glow',
      description: 'Warm orange and pink gradients',
      colors: ['#fa709a', '#fee140'],
      preview: '🌅'
    },
    {
      id: 'forest',
      name: 'Forest Green',
      description: 'Natural green tones for a fresh feel',
      colors: ['#43e97b', '#38f9d7'],
      preview: '🌲'
    },
    {
      id: 'lavender',
      name: 'Lavender Dreams',
      description: 'Soft purple and lavender hues',
      colors: ['#a8edea', '#fed6e3'],
      preview: '💜'
    },
    {
      id: 'midnight',
      name: 'Midnight Blue',
      description: 'Deep blue and purple for night owls',
      colors: ['#667eea', '#764ba2'],
      preview: '🌙'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className={`settings-modal-backdrop ${isOpen ? 'show' : ''}`}>
      <div className="settings-modal-content">
        <span className="modal-close-x" onClick={onClose}>&times;</span>
        
        <h2>⚙️ Settings</h2>
        
        <div className="settings-sections">
          {/* Theme Selection */}
          <section className="settings-section">
            <h3>🎨 Theme Selection</h3>
            <p className="section-description">Choose your preferred visual theme</p>
            
            <div className="theme-grid">
              {themes.map((theme) => (
                <div
                  key={theme.id}
                  className={`theme-option ${selectedTheme === theme.id ? 'selected' : ''}`}
                  onClick={() => handleThemeChange(theme.id)}
                >
                  <div className="theme-preview" style={{
                    background: `linear-gradient(135deg, ${theme.colors[0]} 0%, ${theme.colors[1]} 100%)`
                  }}>
                    <span className="theme-emoji">{theme.preview}</span>
                  </div>
                  <div className="theme-info">
                    <h4>{theme.name}</h4>
                    <p>{theme.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Appearance Settings */}
          <section className="settings-section">
            <h3>👁️ Appearance</h3>
            
            <div className="setting-item">
              <div className="setting-label">
                <span>🌙 Dark Mode</span>
                <p>Switch to dark theme for better eye comfort</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={handleDarkModeToggle}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-label">
                <span>📝 Font Size</span>
                <p>Adjust text size for better readability</p>
              </div>
              <div className="font-size-buttons">
                {['small', 'medium', 'large'].map((size) => (
                  <button
                    key={size}
                    className={`font-size-btn ${fontSize === size ? 'active' : ''}`}
                    onClick={() => handleFontSizeChange(size)}
                  >
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-label">
                <span>✨ Animations</span>
                <p>Enable or disable smooth animations</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={animations}
                  onChange={handleAnimationsToggle}
                />
                <span className="slider"></span>
              </label>
            </div>
          </section>

          {/* Notification Settings */}
          <section className="settings-section">
            <h3>🔔 Notifications</h3>
            
            <div className="setting-item">
              <div className="setting-label">
                <span>📱 App Notifications</span>
                <p>Receive notifications for important events</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={handleNotificationsToggle}
                />
                <span className="slider"></span>
              </label>
            </div>
          </section>

          {/* Reset Section */}
          <section className="settings-section">
            <h3>🔄 Reset Settings</h3>
            <p className="section-description">Restore all settings to their default values</p>
            
            <button className="reset-button" onClick={handleResetSettings}>
              🔄 Reset to Defaults
            </button>
          </section>
        </div>

        <div className="settings-footer">
          <button className="close-button" onClick={onClose}>
            ✅ Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal; 