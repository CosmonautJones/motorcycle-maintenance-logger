// Theme Configuration Test Fixtures for Motorcycle Maintenance Tracker
// Based on the actual ThemeManager class from script.js

export const themeConfigurations = {
  light: {
    name: 'Light Mode',
    id: 'light',
    properties: {
      '--bg-primary': '#f5f5f5',
      '--bg-surface': '#ffffff',
      '--bg-surface-secondary': '#f8f9fa',
      '--bg-header': 'linear-gradient(135deg, #2c3e50, #3498db)',
      '--bg-accent': 'linear-gradient(135deg, #3498db, #2980b9)',
      '--bg-success': 'linear-gradient(135deg, #27ae60, #219a52)',
      '--bg-warning': 'linear-gradient(135deg, #f39c12, #e67e22)',
      '--bg-danger': 'linear-gradient(135deg, #e74c3c, #c0392b)',
      '--text-primary': '#333333',
      '--text-secondary': '#666666',
      '--text-muted': '#999999',
      '--text-inverse': '#ffffff',
      '--border-primary': '#dddddd',
      '--border-secondary': '#ecf0f1',
      '--shadow-light': 'rgba(0, 0, 0, 0.1)',
      '--shadow-medium': 'rgba(0, 0, 0, 0.15)',
      '--shadow-strong': 'rgba(0, 0, 0, 0.3)',
      '--transition-fast': '0.15s ease',
      '--transition-normal': '0.3s ease',
      '--transition-slow': '0.5s ease'
    },
    cssClass: 'theme-light',
    iconSet: 'outline',
    prefersDark: false
  },

  dark: {
    name: 'Dark Mode',
    id: 'dark',
    properties: {
      '--bg-primary': 'linear-gradient(135deg, #1a1a1a, #2d2d2d)',
      '--bg-surface': 'linear-gradient(145deg, #2a2a2a, #1e1e1e)',
      '--bg-surface-secondary': 'linear-gradient(145deg, #333333, #252525)',
      '--bg-header': 'linear-gradient(135deg, #1e3a5f, #2c5aa0)',
      '--bg-accent': 'linear-gradient(135deg, #4a90e2, #357abd)',
      '--bg-success': 'linear-gradient(135deg, #2ecc71, #27ae60)',
      '--bg-warning': 'linear-gradient(135deg, #f1c40f, #f39c12)',
      '--bg-danger': 'linear-gradient(135deg, #e74c3c, #c0392b)',
      '--text-primary': '#ffffff',
      '--text-secondary': '#b0b0b0',
      '--text-muted': '#777777',
      '--text-inverse': '#333333',
      '--border-primary': '#404040',
      '--border-secondary': '#2a2a2a',
      '--shadow-light': 'rgba(0, 0, 0, 0.3)',
      '--shadow-medium': 'rgba(0, 0, 0, 0.5)',
      '--shadow-strong': 'rgba(0, 0, 0, 0.7)',
      '--transition-fast': '0.15s ease',
      '--transition-normal': '0.3s ease',
      '--transition-slow': '0.5s ease'
    },
    cssClass: 'theme-dark',
    iconSet: 'filled',
    prefersDark: true
  },

  // High contrast themes for accessibility testing
  highContrastLight: {
    name: 'High Contrast Light',
    id: 'high-contrast-light',
    properties: {
      '--bg-primary': '#ffffff',
      '--bg-surface': '#ffffff',
      '--bg-surface-secondary': '#ffffff',
      '--bg-header': '#000000',
      '--bg-accent': '#0000ff',
      '--bg-success': '#008000',
      '--bg-warning': '#ffff00',
      '--bg-danger': '#ff0000',
      '--text-primary': '#000000',
      '--text-secondary': '#000000',
      '--text-muted': '#000000',
      '--text-inverse': '#ffffff',
      '--border-primary': '#000000',
      '--border-secondary': '#000000',
      '--shadow-light': 'rgba(0, 0, 0, 0.3)',
      '--shadow-medium': 'rgba(0, 0, 0, 0.5)',
      '--shadow-strong': 'rgba(0, 0, 0, 0.8)',
      '--transition-fast': '0.15s ease',
      '--transition-normal': '0.3s ease',
      '--transition-slow': '0.5s ease'
    },
    cssClass: 'theme-high-contrast-light',
    iconSet: 'outline',
    prefersDark: false,
    accessibility: true
  },

  highContrastDark: {
    name: 'High Contrast Dark',
    id: 'high-contrast-dark',
    properties: {
      '--bg-primary': '#000000',
      '--bg-surface': '#000000',
      '--bg-surface-secondary': '#000000',
      '--bg-header': '#ffffff',
      '--bg-accent': '#00ffff',
      '--bg-success': '#00ff00',
      '--bg-warning': '#ffff00',
      '--bg-danger': '#ff0000',
      '--text-primary': '#ffffff',
      '--text-secondary': '#ffffff',
      '--text-muted': '#ffffff',
      '--text-inverse': '#000000',
      '--border-primary': '#ffffff',
      '--border-secondary': '#ffffff',
      '--shadow-light': 'rgba(255, 255, 255, 0.3)',
      '--shadow-medium': 'rgba(255, 255, 255, 0.5)',
      '--shadow-strong': 'rgba(255, 255, 255, 0.8)',
      '--transition-fast': '0.15s ease',
      '--transition-normal': '0.3s ease',
      '--transition-slow': '0.5s ease'
    },
    cssClass: 'theme-high-contrast-dark',
    iconSet: 'filled',
    prefersDark: true,
    accessibility: true
  }
};

// User preference test scenarios
export const userPreferenceScenarios = {
  lightModeUser: {
    preferredTheme: 'light',
    systemPreference: 'light',
    storedPreference: 'light',
    lastUsed: new Date('2024-01-15T10:30:00Z'),
    autoSwitch: false
  },

  darkModeUser: {
    preferredTheme: 'dark',
    systemPreference: 'dark',
    storedPreference: 'dark',
    lastUsed: new Date('2024-01-15T22:15:00Z'),
    autoSwitch: false
  },

  systemFollower: {
    preferredTheme: 'system',
    systemPreference: 'dark',
    storedPreference: 'system',
    lastUsed: new Date('2024-01-15T18:45:00Z'),
    autoSwitch: true
  },

  autoSwitcher: {
    preferredTheme: 'system',
    systemPreference: 'light',
    storedPreference: 'system',
    lastUsed: new Date('2024-01-15T12:00:00Z'),
    autoSwitch: true,
    schedule: {
      lightStart: '06:00',
      darkStart: '20:00'
    }
  },

  accessibilityUser: {
    preferredTheme: 'high-contrast-light',
    systemPreference: 'light',
    storedPreference: 'high-contrast-light',
    lastUsed: new Date('2024-01-15T14:30:00Z'),
    autoSwitch: false,
    accessibility: {
      reduceMotion: true,
      highContrast: true,
      fontSize: 'large'
    }
  },

  firstTimeUser: {
    preferredTheme: null,
    systemPreference: 'light',
    storedPreference: null,
    lastUsed: null,
    autoSwitch: false
  }
};

// System preference detection scenarios
export const systemPreferenceScenarios = {
  lightSystem: {
    mediaQuery: '(prefers-color-scheme: light)',
    matches: true,
    expectedTheme: 'light',
    systemTime: '12:00',
    browserSupport: true
  },

  darkSystem: {
    mediaQuery: '(prefers-color-scheme: dark)',
    matches: true,
    expectedTheme: 'dark',
    systemTime: '22:00',
    browserSupport: true
  },

  noPreference: {
    mediaQuery: '(prefers-color-scheme: no-preference)',
    matches: true,
    expectedTheme: 'light',
    systemTime: '10:00',
    browserSupport: true
  },

  unsupportedBrowser: {
    mediaQuery: null,
    matches: null,
    expectedTheme: 'light',
    systemTime: '14:00',
    browserSupport: false
  },

  highContrastSystem: {
    mediaQuery: '(prefers-contrast: high)',
    matches: true,
    expectedTheme: 'high-contrast-light',
    systemTime: '15:00',
    browserSupport: true,
    accessibility: true
  },

  reducedMotionSystem: {
    mediaQuery: '(prefers-reduced-motion: reduce)',
    matches: true,
    expectedTheme: 'light',
    systemTime: '11:00',
    browserSupport: true,
    accessibility: true,
    reduceAnimations: true
  }
};

// Theme transition test data
export const themeTransitions = {
  lightToDark: {
    from: 'light',
    to: 'dark',
    duration: 300,
    properties: [
      '--bg-primary',
      '--bg-surface',
      '--text-primary',
      '--border-primary'
    ],
    expectedChanges: {
      '--bg-primary': { from: '#f5f5f5', to: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)' },
      '--text-primary': { from: '#333333', to: '#ffffff' }
    }
  },

  darkToLight: {
    from: 'dark',
    to: 'light',
    duration: 300,
    properties: [
      '--bg-primary',
      '--bg-surface',
      '--text-primary',
      '--border-primary'
    ],
    expectedChanges: {
      '--bg-primary': { from: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)', to: '#f5f5f5' },
      '--text-primary': { from: '#ffffff', to: '#333333' }
    }
  },

  systemToManual: {
    from: 'system',
    to: 'light',
    duration: 300,
    systemPreference: 'dark',
    manualOverride: true
  }
};

// Component-specific theme adaptations
export const componentThemeAdaptations = {
  maintenanceStatus: {
    light: {
      good: { background: 'var(--bg-success)', color: 'var(--text-inverse)' },
      warning: { background: 'var(--bg-warning)', color: 'var(--text-inverse)' },
      danger: { background: 'var(--bg-danger)', color: 'var(--text-inverse)' }
    },
    dark: {
      good: { background: 'var(--bg-success)', color: 'var(--text-inverse)' },
      warning: { background: 'var(--bg-warning)', color: 'var(--text-inverse)' },
      danger: { background: 'var(--bg-danger)', color: 'var(--text-inverse)' }
    }
  },

  navigationTabs: {
    light: {
      active: { background: 'var(--bg-accent)', color: 'var(--text-inverse)' },
      inactive: { background: 'var(--bg-surface)', color: 'var(--text-primary)' },
      hover: { background: 'var(--bg-surface-secondary)', color: 'var(--text-primary)' }
    },
    dark: {
      active: { background: 'var(--bg-accent)', color: 'var(--text-inverse)' },
      inactive: { background: 'var(--bg-surface)', color: 'var(--text-primary)' },
      hover: { background: 'var(--bg-surface-secondary)', color: 'var(--text-primary)' }
    }
  },

  forms: {
    light: {
      input: { background: 'var(--bg-surface)', border: 'var(--border-primary)', color: 'var(--text-primary)' },
      inputFocus: { background: 'var(--bg-surface)', border: 'var(--bg-accent)', color: 'var(--text-primary)' },
      button: { background: 'var(--bg-accent)', color: 'var(--text-inverse)' }
    },
    dark: {
      input: { background: 'var(--bg-surface)', border: 'var(--border-primary)', color: 'var(--text-primary)' },
      inputFocus: { background: 'var(--bg-surface)', border: 'var(--bg-accent)', color: 'var(--text-primary)' },
      button: { background: 'var(--bg-accent)', color: 'var(--text-inverse)' }
    }
  }
};

export default themeConfigurations;