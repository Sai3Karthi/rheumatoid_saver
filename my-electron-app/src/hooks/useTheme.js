import { useEffect, useRef } from 'react';
import themeManager from '../utils/themeManager';

/**
 * Custom hook for easy theme integration in React components
 * Automatically applies current theme and updates when theme changes
 */
export const useTheme = (componentRef, componentType = 'section') => {
  const isRegistered = useRef(false);

  useEffect(() => {
    if (componentRef.current && !isRegistered.current) {
      // Register the component with the theme manager
      themeManager.registerComponent(componentRef.current, componentType);
      isRegistered.current = true;
    }

    // Cleanup function
    return () => {
      if (componentRef.current && isRegistered.current) {
        // Remove themed attribute on unmount
        componentRef.current.removeAttribute('data-themed');
        isRegistered.current = false;
      }
    };
  }, [componentRef, componentType]);

  // Return theme properties for CSS-in-JS usage
  const getThemeProperties = () => {
    return themeManager.getThemeProperties();
  };

  // Return current theme name
  const getCurrentTheme = () => {
    return themeManager.getCurrentTheme();
  };

  // Apply theme to a specific element
  const applyThemeToElement = (element, themeName = null) => {
    themeManager.applyThemeToNewComponent(element, themeName);
  };

  return {
    getThemeProperties,
    getCurrentTheme,
    applyThemeToElement,
    themeManager
  };
};

/**
 * Hook for getting theme-aware styles
 * Returns CSS properties object that can be used with style prop
 */
export const useThemeStyles = (themeName = null) => {
  const themeProps = themeManager.getThemeProperties(themeName);
  
  return {
    // Background styles
    background: themeProps.background,
    sectionBackground: themeProps.sectionBg,
    cardBackground: themeProps.cardBg,
    
    // Text styles
    color: themeProps.text,
    
    // Border styles
    borderColor: themeProps.sectionBorder,
    cardBorderColor: themeProps.cardBorder,
    
    // Gradient styles
    gradient: themeProps.gradient,
    buttonGradient: themeProps.buttonGradient,
    
    // Input styles
    inputBackground: themeProps.inputBg,
    inputBorderColor: themeProps.inputBorder,
    
    // CSS custom properties object
    cssProperties: themeProps.cssProperties
  };
};

/**
 * Hook for creating themed components with automatic updates
 */
export const useThemedComponent = (componentType = 'section') => {
  const componentRef = useRef(null);
  const { getThemeProperties, getCurrentTheme } = useTheme(componentRef, componentType);
  
  return {
    ref: componentRef,
    themeProperties: getThemeProperties(),
    currentTheme: getCurrentTheme(),
    className: `themed-component ${componentType}-component`
  };
};

export default useTheme; 