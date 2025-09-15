// SVG Icon Test Fixtures for Motorcycle Maintenance Tracker
// Realistic motorcycle maintenance-related icons

export const iconFixtures = {
  // Dashboard icons
  dashboard: {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="7" height="9"></rect>
      <rect x="14" y="3" width="7" height="5"></rect>
      <rect x="14" y="12" width="7" height="9"></rect>
      <rect x="3" y="16" width="7" height="5"></rect>
    </svg>`,
    alt: 'Dashboard overview',
    sizes: ['16', '20', '24', '32'],
    category: 'navigation'
  },

  // Maintenance-specific icons
  oil: {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2v20"></path>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </svg>`,
    alt: 'Oil change maintenance',
    sizes: ['16', '20', '24', '32'],
    category: 'maintenance'
  },

  sparkPlug: {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2v4"></path>
      <path d="M12 18v4"></path>
      <path d="m4.93 4.93 1.41 1.41"></path>
      <path d="m17.66 17.66 1.41 1.41"></path>
      <path d="M2 12h4"></path>
      <path d="M18 12h4"></path>
      <path d="m4.93 19.07 1.41-1.41"></path>
      <path d="m17.66 6.34 1.41-1.41"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>`,
    alt: 'Spark plug replacement',
    sizes: ['16', '20', '24', '32'],
    category: 'maintenance'
  },

  airFilter: {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
      <path d="M13 2l3 7h4l-3 8"></path>
    </svg>`,
    alt: 'Air filter service',
    sizes: ['16', '20', '24', '32'],
    category: 'maintenance'
  },

  brake: {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <circle cx="12" cy="12" r="6"></circle>
      <circle cx="12" cy="12" r="2"></circle>
    </svg>`,
    alt: 'Brake system maintenance',
    sizes: ['16', '20', '24', '32'],
    category: 'maintenance'
  },

  // Status icons
  checkCircle: {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22,4 12,14.01 9,11.01"></polyline>
    </svg>`,
    alt: 'Maintenance complete',
    sizes: ['16', '20', '24', '32'],
    category: 'status'
  },

  alertTriangle: {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
      <path d="M12 9v4"></path>
      <path d="m12 17 .01 0"></path>
    </svg>`,
    alt: 'Maintenance due',
    sizes: ['16', '20', '24', '32'],
    category: 'status'
  },

  clock: {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12,6 12,12 16,14"></polyline>
    </svg>`,
    alt: 'Maintenance due soon',
    sizes: ['16', '20', '24', '32'],
    category: 'status'
  },

  // Navigation icons
  settings: {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>`,
    alt: 'Application settings',
    sizes: ['16', '20', '24', '32'],
    category: 'navigation'
  },

  history: {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
      <path d="M3 3v5h5"></path>
      <path d="M12 7v5l4 2"></path>
    </svg>`,
    alt: 'Maintenance history',
    sizes: ['16', '20', '24', '32'],
    category: 'navigation'
  },

  plus: {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5 12h14"></path>
      <path d="M12 5v14"></path>
    </svg>`,
    alt: 'Add new maintenance record',
    sizes: ['16', '20', '24', '32'],
    category: 'navigation'
  },

  // Theme icons
  sun: {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="5"></circle>
      <path d="M12 1v2"></path>
      <path d="M12 21v2"></path>
      <path d="m4.22 4.22 1.42 1.42"></path>
      <path d="m18.36 18.36 1.42 1.42"></path>
      <path d="M1 12h2"></path>
      <path d="M21 12h2"></path>
      <path d="m4.22 19.78 1.42-1.42"></path>
      <path d="m18.36 5.64 1.42-1.42"></path>
    </svg>`,
    alt: 'Light theme',
    sizes: ['16', '20', '24'],
    category: 'theme'
  },

  moon: {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
    </svg>`,
    alt: 'Dark theme',
    sizes: ['16', '20', '24'],
    category: 'theme'
  }
};

// Icon configuration test data
export const iconConfigurations = {
  default: {
    size: '24',
    strokeWidth: '2',
    className: 'icon',
    ariaHidden: true
  },

  small: {
    size: '16',
    strokeWidth: '2',
    className: 'icon icon-small',
    ariaHidden: true
  },

  large: {
    size: '32',
    strokeWidth: '1.5',
    className: 'icon icon-large',
    ariaHidden: true
  },

  accessible: {
    size: '24',
    strokeWidth: '2',
    className: 'icon',
    ariaHidden: false,
    ariaLabel: 'Icon description'
  },

  interactive: {
    size: '24',
    strokeWidth: '2',
    className: 'icon icon-interactive',
    ariaHidden: false,
    role: 'button',
    tabIndex: 0
  }
};

// Theme-specific icon variations
export const themeIconVariations = {
  light: {
    dashboard: {
      ...iconFixtures.dashboard,
      fill: 'none',
      stroke: '#333333',
      className: 'icon icon-light'
    },
    oil: {
      ...iconFixtures.oil,
      fill: 'none',
      stroke: '#e67e22',
      className: 'icon icon-light maintenance-oil'
    },
    checkCircle: {
      ...iconFixtures.checkCircle,
      fill: 'none',
      stroke: '#27ae60',
      className: 'icon icon-light status-good'
    },
    alertTriangle: {
      ...iconFixtures.alertTriangle,
      fill: 'none',
      stroke: '#f39c12',
      className: 'icon icon-light status-warning'
    }
  },

  dark: {
    dashboard: {
      ...iconFixtures.dashboard,
      fill: 'none',
      stroke: '#ffffff',
      className: 'icon icon-dark'
    },
    oil: {
      ...iconFixtures.oil,
      fill: 'none',
      stroke: '#f39c12',
      className: 'icon icon-dark maintenance-oil'
    },
    checkCircle: {
      ...iconFixtures.checkCircle,
      fill: 'none',
      stroke: '#2ecc71',
      className: 'icon icon-dark status-good'
    },
    alertTriangle: {
      ...iconFixtures.alertTriangle,
      fill: 'none',
      stroke: '#f1c40f',
      className: 'icon icon-dark status-warning'
    }
  }
};

// Accessibility test scenarios
export const accessibilityScenarios = {
  decorative: {
    ariaHidden: true,
    role: null,
    ariaLabel: null,
    focusable: false
  },

  informative: {
    ariaHidden: false,
    role: 'img',
    ariaLabel: 'Oil change due in 500 miles',
    focusable: false
  },

  interactive: {
    ariaHidden: false,
    role: 'button',
    ariaLabel: 'Open maintenance settings',
    focusable: true,
    tabIndex: 0
  },

  statusIndicator: {
    ariaHidden: false,
    role: 'status',
    ariaLabel: 'Maintenance completed successfully',
    ariaLive: 'polite',
    focusable: false
  }
};

export default iconFixtures;