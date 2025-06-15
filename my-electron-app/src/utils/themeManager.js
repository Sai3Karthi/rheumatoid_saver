// Theme Manager for Care Companion App
const themes = {
  default: {
    name: 'Care Companion',
    primary: '#667eea',
    secondary: '#764ba2',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    background: '#f5f7fa',
    text: '#2c3e50',
    accent: '#667eea',
    sectionBg: '#ffffff',
    sectionBorder: '#667eea',
    inputBg: '#ffffff',
    inputBorder: '#e9ecef',
    buttonGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    cardBg: '#f8f9fa',
    cardBorder: '#667eea'
  },
  ocean: {
    name: 'Ocean Breeze',
    primary: '#4facfe',
    secondary: '#00f2fe',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    background: '#f0f8ff',
    text: '#2c3e50',
    accent: '#4facfe',
    sectionBg: '#ffffff',
    sectionBorder: '#4facfe',
    inputBg: '#ffffff',
    inputBorder: '#e9ecef',
    buttonGradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    cardBg: '#f8f9fa',
    cardBorder: '#4facfe'
  },
  sunset: {
    name: 'Sunset Glow',
    primary: '#fa709a',
    secondary: '#fee140',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    background: '#fff5f5',
    text: '#2c3e50',
    accent: '#fa709a',
    sectionBg: '#ffffff',
    sectionBorder: '#fa709a',
    inputBg: '#ffffff',
    inputBorder: '#e9ecef',
    buttonGradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    cardBg: '#f8f9fa',
    cardBorder: '#fa709a'
  },
  forest: {
    name: 'Forest Green',
    primary: '#43e97b',
    secondary: '#38f9d7',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    background: '#f0fff4',
    text: '#2c3e50',
    accent: '#43e97b',
    sectionBg: '#ffffff',
    sectionBorder: '#43e97b',
    inputBg: '#ffffff',
    inputBorder: '#e9ecef',
    buttonGradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    cardBg: '#f8f9fa',
    cardBorder: '#43e97b'
  },
  lavender: {
    name: 'Lavender Dreams',
    primary: '#a8edea',
    secondary: '#fed6e3',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    background: '#faf5ff',
    text: '#2c3e50',
    accent: '#a8edea',
    sectionBg: '#ffffff',
    sectionBorder: '#a8edea',
    inputBg: '#ffffff',
    inputBorder: '#e9ecef',
    buttonGradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    cardBg: '#f8f9fa',
    cardBorder: '#a8edea'
  },
  midnight: {
    name: 'Midnight Blue',
    primary: '#667eea',
    secondary: '#764ba2',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    background: '#1a202c',
    text: '#e2e8f0',
    accent: '#667eea',
    sectionBg: '#2d3748',
    sectionBorder: '#667eea',
    inputBg: '#4a5568',
    inputBorder: '#718096',
    buttonGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    cardBg: '#2d3748',
    cardBorder: '#667eea'
  }
};

class ThemeManager {
  constructor() {
    this.currentTheme = 'default';
    this.init();
  }

  init() {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('appTheme') || 'default';
    this.applyTheme(savedTheme);
    
    // Load other settings
    this.loadSettings();
  }

  loadSettings() {
    // Load dark mode
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
      document.body.classList.add('dark-mode');
    }

    // Load font size
    const fontSize = localStorage.getItem('fontSize') || 'medium';
    document.documentElement.setAttribute('data-font-size', fontSize);

    // Load animations
    const animations = localStorage.getItem('animations') !== 'false';
    if (!animations) {
      document.body.classList.add('no-animations');
    }
  }

  applyTheme(themeName) {
    const theme = themes[themeName] || themes.default;
    this.currentTheme = themeName;

    // Apply comprehensive CSS custom properties
    const root = document.documentElement;
    
    // Core theme properties
    root.style.setProperty('--primary-color', theme.primary);
    root.style.setProperty('--secondary-color', theme.secondary);
    root.style.setProperty('--gradient', theme.gradient);
    root.style.setProperty('--background-color', theme.background);
    root.style.setProperty('--text-color', theme.text);
    root.style.setProperty('--accent-color', theme.accent);
    
    // Section and component properties
    root.style.setProperty('--section-bg', theme.sectionBg);
    root.style.setProperty('--section-border', theme.sectionBorder);
    root.style.setProperty('--input-bg', theme.inputBg);
    root.style.setProperty('--input-border', theme.inputBorder);
    root.style.setProperty('--button-gradient', theme.buttonGradient);
    root.style.setProperty('--card-bg', theme.cardBg);
    root.style.setProperty('--card-border', theme.cardBorder);

    // Update header gradient
    this.updateHeaderGradient(theme.gradient);

    // Update all sections with new theme
    this.updateAllSections(theme);

    // Save to localStorage
    localStorage.setItem('appTheme', themeName);
  }

  updateHeaderGradient(gradient) {
    const header = document.querySelector('.App-header');
    if (header) {
      header.style.background = gradient;
    }
  }

  updateAllSections(theme) {
    // Update all sections with new theme colors
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
      section.style.setProperty('--section-bg', theme.sectionBg);
      section.style.setProperty('--section-border', theme.sectionBorder);
    });

    // Update all buttons with new gradient
    const buttons = document.querySelectorAll('button:not(.font-size-btn)');
    buttons.forEach(button => {
      if (!button.classList.contains('secondary') && !button.classList.contains('alert-button')) {
        button.style.background = theme.buttonGradient;
      }
    });

    // Update all detail displays
    const detailDisplays = document.querySelectorAll('.detail-display');
    detailDisplays.forEach(display => {
      display.style.setProperty('--card-bg', theme.cardBg);
      display.style.setProperty('--card-border', theme.cardBorder);
    });

    // Update all inputs
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.style.setProperty('--input-bg', theme.inputBg);
      input.style.setProperty('--input-border', theme.inputBorder);
    });
  }

  // Method to apply theme to new components dynamically
  applyThemeToNewComponent(componentElement, themeName = null) {
    const theme = themeName ? themes[themeName] : themes[this.currentTheme];
    
    if (componentElement) {
      // Apply theme properties to the component
      componentElement.style.setProperty('--primary-color', theme.primary);
      componentElement.style.setProperty('--secondary-color', theme.secondary);
      componentElement.style.setProperty('--gradient', theme.gradient);
      componentElement.style.setProperty('--background-color', theme.background);
      componentElement.style.setProperty('--text-color', theme.text);
      componentElement.style.setProperty('--accent-color', theme.accent);
      componentElement.style.setProperty('--section-bg', theme.sectionBg);
      componentElement.style.setProperty('--section-border', theme.sectionBorder);
      componentElement.style.setProperty('--input-bg', theme.inputBg);
      componentElement.style.setProperty('--input-border', theme.inputBorder);
      componentElement.style.setProperty('--button-gradient', theme.buttonGradient);
      componentElement.style.setProperty('--card-bg', theme.cardBg);
      componentElement.style.setProperty('--card-border', theme.cardBorder);
    }
  }

  // Method to register new components for theme updates
  registerComponent(componentElement, componentType = 'section') {
    if (componentElement) {
      // Apply current theme to the component
      this.applyThemeToNewComponent(componentElement);
      
      // Add a data attribute to identify themed components
      componentElement.setAttribute('data-themed', componentType);
    }
  }

  getCurrentTheme() {
    return this.currentTheme;
  }

  getThemeInfo(themeName) {
    return themes[themeName] || themes.default;
  }

  getAllThemes() {
    return themes;
  }

  // Method to get theme properties for CSS-in-JS
  getThemeProperties(themeName = null) {
    const theme = themeName ? themes[themeName] : themes[this.currentTheme];
    return {
      ...theme,
      cssProperties: {
        '--primary-color': theme.primary,
        '--secondary-color': theme.secondary,
        '--gradient': theme.gradient,
        '--background-color': theme.background,
        '--text-color': theme.text,
        '--accent-color': theme.accent,
        '--section-bg': theme.sectionBg,
        '--section-border': theme.sectionBorder,
        '--input-bg': theme.inputBg,
        '--input-border': theme.inputBorder,
        '--button-gradient': theme.buttonGradient,
        '--card-bg': theme.cardBg,
        '--card-border': theme.cardBorder
      }
    };
  }
}

// Create and export a singleton instance
const themeManager = new ThemeManager();
export default themeManager; 