import React, { createContext, useContext, useEffect, useState } from 'react';
import { AccessibilityService } from '../../services/accessibilityService';

interface AccessibilityContextType {
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'normal' | 'large' | 'extra-large';
  keyboardNavigation: boolean;
  announceMessage: (message: string, priority?: 'polite' | 'assertive') => void;
  setFontSize: (size: 'normal' | 'large' | 'extra-large') => void;
  toggleKeyboardNavigation: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'extra-large'>('normal');
  const [keyboardNavigation, setKeyboardNavigation] = useState(false);

  useEffect(() => {
    // Detect user preferences
    setHighContrast(AccessibilityService.detectHighContrast());
    setReducedMotion(AccessibilityService.detectReducedMotion());
    
    // Add skip link
    AccessibilityService.addSkipLink();
    
    // Load saved font size preference
    const savedFontSize = localStorage.getItem('lumi_font_size') as any;
    if (savedFontSize) {
      setFontSize(savedFontSize);
    }
    
    // Load keyboard navigation preference
    const savedKeyboardNav = localStorage.getItem('lumi_keyboard_nav') === 'true';
    setKeyboardNavigation(savedKeyboardNav);
  }, []);

  useEffect(() => {
    // Apply font size to document
    const fontSizeMap = {
      normal: '16px',
      large: '18px',
      'extra-large': '20px'
    };
    
    document.documentElement.style.fontSize = fontSizeMap[fontSize];
    localStorage.setItem('lumi_font_size', fontSize);
  }, [fontSize]);

  useEffect(() => {
    // Apply high contrast mode
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  useEffect(() => {
    // Apply reduced motion
    if (reducedMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  }, [reducedMotion]);

  useEffect(() => {
    // Apply keyboard navigation enhancements
    if (keyboardNavigation) {
      document.documentElement.classList.add('keyboard-navigation');
    } else {
      document.documentElement.classList.remove('keyboard-navigation');
    }
    localStorage.setItem('lumi_keyboard_nav', keyboardNavigation.toString());
  }, [keyboardNavigation]);

  const announceMessage = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    AccessibilityService.announce(message, priority);
  };

  const handleSetFontSize = (size: 'normal' | 'large' | 'extra-large') => {
    setFontSize(size);
    announceMessage(`Font size changed to ${size}`);
  };

  const toggleKeyboardNavigation = () => {
    setKeyboardNavigation(prev => !prev);
    announceMessage(`Keyboard navigation ${!keyboardNavigation ? 'enabled' : 'disabled'}`);
  };

  const value: AccessibilityContextType = {
    highContrast,
    reducedMotion,
    fontSize,
    keyboardNavigation,
    announceMessage,
    setFontSize: handleSetFontSize,
    toggleKeyboardNavigation
  };

  return (
    <AccessibilityContext.Provider value={value}>
      <div 
        className={`
          ${highContrast ? 'high-contrast' : ''}
          ${reducedMotion ? 'reduce-motion' : ''}
        `}
      >
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
};