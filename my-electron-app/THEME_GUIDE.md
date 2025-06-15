# 🎨 Theme System Guide

## Overview

The Care Companion app features a comprehensive theme system that automatically applies themes to all sections and components. This guide explains how to create new components that automatically inherit and update with theme changes.

## 🚀 Quick Start

### 1. Using CSS Custom Properties (Recommended)

Simply use the CSS custom properties in your component's CSS:

```css
.my-new-component {
  background: var(--section-bg);
  color: var(--text-color);
  border: 2px solid var(--section-border);
}

.my-new-button {
  background: var(--button-gradient);
  color: white;
}

.my-new-card {
  background: var(--card-bg);
  border-left: 4px solid var(--card-border);
}
```

### 2. Using the useTheme Hook

For React components that need dynamic theme updates:

```jsx
import React, { useRef } from 'react';
import { useTheme } from '../hooks/useTheme';

const MyNewComponent = () => {
  const componentRef = useRef(null);
  const { getThemeProperties } = useTheme(componentRef, 'my-component');

  return (
    <div ref={componentRef} className="my-new-component">
      <h3>My New Section</h3>
      <p>This component automatically updates with theme changes!</p>
    </div>
  );
};
```

### 3. Using useThemedComponent Hook

For complete themed components:

```jsx
import React from 'react';
import { useThemedComponent } from '../hooks/useTheme';

const MyThemedComponent = () => {
  const { ref, className, themeProperties } = useThemedComponent('my-component');

  return (
    <div ref={ref} className={className}>
      <h3>My Themed Component</h3>
      <p>Current theme: {themeProperties.name}</p>
    </div>
  );
};
```

## 🎯 Available CSS Custom Properties

### Core Properties
- `--primary-color`: Primary theme color
- `--secondary-color`: Secondary theme color
- `--gradient`: Main gradient
- `--background-color`: App background
- `--text-color`: Text color
- `--accent-color`: Accent color

### Component Properties
- `--section-bg`: Section background
- `--section-border`: Section border color
- `--card-bg`: Card background
- `--card-border`: Card border color
- `--input-bg`: Input background
- `--input-border`: Input border color
- `--button-gradient`: Button gradient

## 📝 Component Examples

### Example 1: Simple Section

```jsx
import React from 'react';

const SimpleSection = () => {
  return (
    <section className="section">
      <h2>My New Section</h2>
      <div className="detail-display">
        <p>This automatically uses the current theme!</p>
      </div>
      <button>Click me</button>
    </section>
  );
};
```

### Example 2: Custom Component with Theme Hook

```jsx
import React, { useRef } from 'react';
import { useTheme } from '../hooks/useTheme';

const CustomComponent = () => {
  const componentRef = useRef(null);
  const { getThemeProperties } = useTheme(componentRef, 'custom');

  const theme = getThemeProperties();

  return (
    <div ref={componentRef} className="custom-component">
      <div className="custom-header" style={{ background: theme.gradient }}>
        <h3>Custom Header</h3>
      </div>
      <div className="custom-content">
        <p>Content with theme-aware styling</p>
      </div>
    </div>
  );
};
```

### Example 3: CSS-in-JS with Theme Styles

```jsx
import React from 'react';
import { useThemeStyles } from '../hooks/useTheme';

const StyledComponent = () => {
  const styles = useThemeStyles();

  return (
    <div style={{
      background: styles.sectionBackground,
      color: styles.color,
      border: `2px solid ${styles.borderColor}`,
      padding: '20px',
      borderRadius: '8px'
    }}>
      <h3>Styled Component</h3>
      <p>Using CSS-in-JS with theme styles</p>
    </div>
  );
};
```

## 🎨 Available Themes

### 1. Care Companion (Default)
- **Colors**: Blue to Purple gradient
- **Use Case**: Medical/Healthcare applications

### 2. Ocean Breeze
- **Colors**: Light blue to cyan gradient
- **Use Case**: Calming, peaceful interfaces

### 3. Sunset Glow
- **Colors**: Pink to yellow gradient
- **Use Case**: Warm, welcoming interfaces

### 4. Forest Green
- **Colors**: Green to teal gradient
- **Use Case**: Nature, eco-friendly applications

### 5. Lavender Dreams
- **Colors**: Light purple to pink gradient
- **Use Case**: Soft, gentle interfaces

### 6. Midnight Blue
- **Colors**: Dark blue to purple gradient
- **Use Case**: Night mode, professional interfaces

## 🔧 Advanced Usage

### Manual Theme Application

```jsx
import themeManager from '../utils/themeManager';

// Apply theme to a specific element
const element = document.querySelector('.my-element');
themeManager.applyThemeToNewComponent(element, 'ocean');

// Get theme properties
const themeProps = themeManager.getThemeProperties('sunset');
console.log(themeProps.gradient); // Sunset gradient
```

### Dynamic Theme Switching

```jsx
import React, { useState } from 'react';
import { useTheme } from '../hooks/useTheme';

const ThemeSwitcher = () => {
  const [currentTheme, setCurrentTheme] = useState('default');
  const { themeManager } = useTheme();

  const changeTheme = (themeName) => {
    setCurrentTheme(themeName);
    themeManager.applyTheme(themeName);
  };

  return (
    <div>
      <button onClick={() => changeTheme('ocean')}>Ocean</button>
      <button onClick={() => changeTheme('sunset')}>Sunset</button>
      <button onClick={() => changeTheme('forest')}>Forest</button>
    </div>
  );
};
```

## 🎯 Best Practices

### 1. Use CSS Custom Properties
- Always use CSS custom properties instead of hardcoded colors
- This ensures automatic theme updates

### 2. Register Components
- Use the `useTheme` hook for components that need dynamic updates
- Register components with appropriate component types

### 3. Consistent Naming
- Use consistent class names that follow the existing pattern
- Use semantic class names that describe the component's purpose

### 4. Responsive Design
- Ensure your themed components work well on all screen sizes
- Test with different themes and font sizes

### 5. Accessibility
- Ensure sufficient contrast ratios with all themes
- Test with dark mode enabled

## 🐛 Troubleshooting

### Theme Not Updating
1. Check if you're using CSS custom properties
2. Ensure the component is registered with `useTheme` hook
3. Verify the theme manager is properly initialized

### Styling Issues
1. Check browser developer tools for CSS custom property values
2. Ensure no hardcoded colors are overriding theme properties
3. Verify the component has the correct CSS classes

### Performance Issues
1. Avoid applying themes to too many elements simultaneously
2. Use CSS custom properties instead of inline styles when possible
3. Consider using `useMemo` for expensive theme calculations

## 📚 Additional Resources

- [CSS Custom Properties MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [React Hooks Documentation](https://reactjs.org/docs/hooks-intro.html)
- [Theme Manager Source Code](../src/utils/themeManager.js)
- [Theme Hooks Source Code](../src/hooks/useTheme.js)

---

**Remember**: The theme system is designed to be automatic and future-proof. Simply use the CSS custom properties or the provided hooks, and your components will automatically inherit and update with theme changes! 🎨✨ 