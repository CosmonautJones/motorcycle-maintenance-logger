// Integration Test Fixtures for Motorcycle Maintenance Tracker
// Complete page states and user interaction scenarios

// Complete page states before/after UI changes
export const pageStates = {
  beforeUIEnhancements: {
    title: 'Motorcycle Maintenance Tracker - Basic UI',
    theme: 'light',
    hasIcons: false,
    features: {
      iconSystem: false,
      enhancedThemes: false,
      accessibilityEnhancements: false
    },
    dom: {
      tabButtons: [
        { text: 'Dashboard', hasIcon: false, className: 'tab-button' },
        { text: 'Maintenance Log', hasIcon: false, className: 'tab-button' },
        { text: 'Add Work', hasIcon: false, className: 'tab-button' },
        { text: 'Settings', hasIcon: false, className: 'tab-button' }
      ],
      maintenanceItems: [
        {
          id: 'oil-change',
          title: 'Oil & Filter Change',
          status: 'good',
          hasIcon: false,
          statusIndicator: 'text'
        },
        {
          id: 'spark-plugs',
          title: 'Spark Plugs',
          status: 'warning',
          hasIcon: false,
          statusIndicator: 'text'
        }
      ],
      themeToggle: {
        type: 'emoji',
        icons: ['☀️', '🌙'],
        hasText: true
      }
    },
    localStorage: {
      currentMileage: 30000,
      workHistory: [],
      theme: 'light'
    }
  },

  afterUIEnhancements: {
    title: 'Motorcycle Maintenance Tracker - Enhanced UI',
    theme: 'light',
    hasIcons: true,
    features: {
      iconSystem: true,
      enhancedThemes: true,
      accessibilityEnhancements: true
    },
    dom: {
      tabButtons: [
        { text: 'Dashboard', hasIcon: true, icon: 'dashboard', className: 'tab-button tab-button-enhanced' },
        { text: 'Maintenance Log', hasIcon: true, icon: 'history', className: 'tab-button tab-button-enhanced' },
        { text: 'Add Work', hasIcon: true, icon: 'plus', className: 'tab-button tab-button-enhanced' },
        { text: 'Settings', hasIcon: true, icon: 'settings', className: 'tab-button tab-button-enhanced' }
      ],
      maintenanceItems: [
        {
          id: 'oil-change',
          title: 'Oil & Filter Change',
          status: 'good',
          hasIcon: true,
          icon: 'oil',
          statusIndicator: 'icon-and-text',
          statusIcon: 'checkCircle'
        },
        {
          id: 'spark-plugs',
          title: 'Spark Plugs',
          status: 'warning',
          hasIcon: true,
          icon: 'sparkPlug',
          statusIndicator: 'icon-and-text',
          statusIcon: 'alertTriangle'
        }
      ],
      themeToggle: {
        type: 'svg',
        icons: ['sun', 'moon'],
        hasText: true,
        enhanced: true
      }
    },
    localStorage: {
      currentMileage: 30000,
      workHistory: [],
      theme: 'light',
      uiPreferences: {
        iconSystem: true,
        enhancedThemes: true
      }
    }
  }
};

// User interaction scenarios
export const userInteractionScenarios = {
  // Basic navigation flow
  navigationFlow: {
    name: 'Complete navigation through all tabs',
    steps: [
      {
        action: 'click',
        target: '.tab-button[data-tab="dashboard"]',
        expectedState: {
          activeTab: 'dashboard',
          visibleContent: '#dashboard.tab-content.active'
        }
      },
      {
        action: 'click',
        target: '.tab-button[data-tab="maintenance-log"]',
        expectedState: {
          activeTab: 'maintenance-log',
          visibleContent: '#maintenance-log.tab-content.active'
        }
      },
      {
        action: 'click',
        target: '.tab-button[data-tab="add-work"]',
        expectedState: {
          activeTab: 'add-work',
          visibleContent: '#add-work.tab-content.active'
        }
      },
      {
        action: 'click',
        target: '.tab-button[data-tab="settings"]',
        expectedState: {
          activeTab: 'settings',
          visibleContent: '#settings.tab-content.active'
        }
      }
    ],
    expectedDuration: '< 2s',
    accessibility: {
      keyboardNavigation: true,
      screenReaderAnnouncements: true,
      focusManagement: true
    }
  },

  // Theme switching scenario
  themeSwitch: {
    name: 'Switch between light and dark themes',
    initialState: {
      theme: 'light',
      systemPreference: 'light'
    },
    steps: [
      {
        action: 'click',
        target: '#themeToggle',
        expectedState: {
          theme: 'dark',
          bodyClass: 'theme-dark',
          toggleAriaChecked: 'true',
          iconVisibility: {
            sun: false,
            moon: true
          }
        }
      },
      {
        action: 'click',
        target: '#themeToggle',
        expectedState: {
          theme: 'light',
          bodyClass: 'theme-light',
          toggleAriaChecked: 'false',
          iconVisibility: {
            sun: true,
            moon: false
          }
        }
      }
    ],
    localStorage: {
      before: { theme: 'light' },
      after: { theme: 'light' }
    }
  },

  // Add maintenance record scenario
  addMaintenanceRecord: {
    name: 'Add new maintenance record with enhanced UI',
    steps: [
      {
        action: 'click',
        target: '.tab-button[data-tab="add-work"]',
        expectedState: {
          activeTab: 'add-work',
          formVisible: true
        }
      },
      {
        action: 'fill',
        target: '#workDate',
        value: '2024-01-15',
        expectedState: {
          fieldValue: '2024-01-15'
        }
      },
      {
        action: 'fill',
        target: '#workMileage',
        value: '30000',
        expectedState: {
          fieldValue: '30000'
        }
      },
      {
        action: 'select',
        target: '#workType',
        value: 'oil-change',
        expectedState: {
          selectedOption: 'oil-change',
          iconDisplay: 'oil'
        }
      },
      {
        action: 'fill',
        target: '#workDescription',
        value: 'Full synthetic oil change with new filter',
        expectedState: {
          fieldValue: 'Full synthetic oil change with new filter'
        }
      },
      {
        action: 'click',
        target: 'button[type="submit"]',
        expectedState: {
          formSubmitted: true,
          recordAdded: true,
          tabSwitched: 'maintenance-log'
        }
      }
    ],
    expectedOutcome: {
      workHistoryUpdated: true,
      statusRecalculated: true,
      notificationShown: true
    }
  },

  // Edit maintenance item scenario
  editMaintenanceItem: {
    name: 'Edit existing maintenance schedule item',
    steps: [
      {
        action: 'click',
        target: '.tab-button[data-tab="settings"]',
        expectedState: {
          activeTab: 'settings'
        }
      },
      {
        action: 'click',
        target: '.maintenance-item[data-maintenance-id="oil-change"] .edit-btn',
        expectedState: {
          modalOpen: true,
          modalType: 'edit-maintenance',
          focusOn: '#editMaintenanceName'
        }
      },
      {
        action: 'fill',
        target: '#editMaintenanceIntervalMiles',
        value: '4000',
        expectedState: {
          fieldValue: '4000'
        }
      },
      {
        action: 'click',
        target: 'button[type="submit"]',
        expectedState: {
          modalClosed: true,
          itemUpdated: true,
          statusRecalculated: true
        }
      }
    ]
  }
};

// Cross-browser test configurations
export const crossBrowserConfigurations = {
  chrome: {
    name: 'Google Chrome',
    version: '120+',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    features: {
      cssCustomProperties: true,
      svgSprites: true,
      localStorage: true,
      modernJS: true,
      flexbox: true,
      grid: true
    },
    expectedPerformance: {
      iconRenderTime: '< 10ms',
      themeTransitionTime: '< 50ms',
      scriptLoadTime: '< 100ms'
    }
  },

  firefox: {
    name: 'Mozilla Firefox',
    version: '115+',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:115.0) Gecko/20100101 Firefox/115.0',
    features: {
      cssCustomProperties: true,
      svgSprites: true,
      localStorage: true,
      modernJS: true,
      flexbox: true,
      grid: true
    },
    expectedPerformance: {
      iconRenderTime: '< 15ms',
      themeTransitionTime: '< 60ms',
      scriptLoadTime: '< 120ms'
    }
  },

  safari: {
    name: 'Safari',
    version: '16+',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15',
    features: {
      cssCustomProperties: true,
      svgSprites: true,
      localStorage: true,
      modernJS: true,
      flexbox: true,
      grid: true
    },
    expectedPerformance: {
      iconRenderTime: '< 12ms',
      themeTransitionTime: '< 55ms',
      scriptLoadTime: '< 110ms'
    },
    quirks: {
      svgColorFill: 'requires explicit fill attribute',
      cssVariableSupport: 'limited in older versions'
    }
  },

  edge: {
    name: 'Microsoft Edge',
    version: '120+',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    features: {
      cssCustomProperties: true,
      svgSprites: true,
      localStorage: true,
      modernJS: true,
      flexbox: true,
      grid: true
    },
    expectedPerformance: {
      iconRenderTime: '< 11ms',
      themeTransitionTime: '< 52ms',
      scriptLoadTime: '< 105ms'
    }
  },

  // Mobile browsers
  mobileSafari: {
    name: 'Mobile Safari',
    version: '16+',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    features: {
      cssCustomProperties: true,
      svgSprites: true,
      localStorage: true,
      modernJS: true,
      flexbox: true,
      grid: true,
      touchEvents: true
    },
    expectedPerformance: {
      iconRenderTime: '< 20ms',
      themeTransitionTime: '< 80ms',
      scriptLoadTime: '< 200ms'
    },
    viewport: {
      width: 375,
      height: 667,
      devicePixelRatio: 2
    }
  },

  chromeAndroid: {
    name: 'Chrome Android',
    version: '120+',
    userAgent: 'Mozilla/5.0 (Linux; Android 12; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    features: {
      cssCustomProperties: true,
      svgSprites: true,
      localStorage: true,
      modernJS: true,
      flexbox: true,
      grid: true,
      touchEvents: true
    },
    expectedPerformance: {
      iconRenderTime: '< 25ms',
      themeTransitionTime: '< 100ms',
      scriptLoadTime: '< 250ms'
    },
    viewport: {
      width: 360,
      height: 640,
      devicePixelRatio: 3
    }
  }
};

// End-to-end test scenarios
export const e2eTestScenarios = {
  completeUserJourney: {
    name: 'Complete user journey with UI enhancements',
    description: 'User performs all main tasks with enhanced UI',
    steps: [
      {
        step: 'Initial page load',
        actions: [
          { action: 'navigate', url: 'index.html' },
          { action: 'waitForLoad', timeout: 5000 }
        ],
        assertions: [
          { check: 'pageTitle', equals: 'Motorcycle Maintenance Tracker' },
          { check: 'iconsLoaded', count: '> 0' },
          { check: 'themeApplied', theme: 'light' }
        ]
      },
      {
        step: 'Review maintenance status',
        actions: [
          { action: 'click', target: '.tab-button[data-tab="dashboard"]' }
        ],
        assertions: [
          { check: 'maintenanceItemsVisible', count: '> 0' },
          { check: 'statusIconsVisible', count: '> 0' },
          { check: 'accessibilityLabels', present: true }
        ]
      },
      {
        step: 'Switch to dark theme',
        actions: [
          { action: 'click', target: '#themeToggle' }
        ],
        assertions: [
          { check: 'themeChanged', to: 'dark' },
          { check: 'iconsUpdated', theme: 'dark' },
          { check: 'localStorage', key: 'theme', value: 'dark' }
        ]
      },
      {
        step: 'Add maintenance record',
        actions: [
          { action: 'click', target: '.tab-button[data-tab="add-work"]' },
          { action: 'fill', target: '#workDate', value: '2024-01-15' },
          { action: 'fill', target: '#workMileage', value: '30500' },
          { action: 'select', target: '#workType', value: 'oil-change' },
          { action: 'fill', target: '#workDescription', value: 'Routine oil change' },
          { action: 'click', target: 'button[type="submit"]' }
        ],
        assertions: [
          { check: 'recordAdded', toHistory: true },
          { check: 'statusUpdated', for: 'oil-change' },
          { check: 'tabSwitched', to: 'maintenance-log' }
        ]
      },
      {
        step: 'Verify accessibility',
        actions: [
          { action: 'keyboardNavigation', through: 'all-interactive-elements' },
          { action: 'screenReaderTest', announcements: true }
        ],
        assertions: [
          { check: 'focusOrder', correct: true },
          { check: 'ariaLabels', present: true },
          { check: 'keyboardAccessible', all: true }
        ]
      }
    ],
    expectedDuration: '< 30s',
    cleanup: [
      { action: 'clearLocalStorage' },
      { action: 'resetToDefaultTheme' }
    ]
  },

  performanceTest: {
    name: 'UI enhancement performance impact',
    description: 'Measure performance impact of UI enhancements',
    metrics: [
      {
        name: 'First Contentful Paint',
        baseline: '1.2s',
        withEnhancements: '< 1.5s',
        threshold: '< 25% increase'
      },
      {
        name: 'Largest Contentful Paint',
        baseline: '2.0s',
        withEnhancements: '< 2.3s',
        threshold: '< 15% increase'
      },
      {
        name: 'Cumulative Layout Shift',
        baseline: '0.05',
        withEnhancements: '< 0.1',
        threshold: '< 100% increase'
      },
      {
        name: 'Time to Interactive',
        baseline: '2.5s',
        withEnhancements: '< 3.0s',
        threshold: '< 20% increase'
      }
    ],
    conditions: [
      { network: '3G', device: 'mobile' },
      { network: 'fast-3G', device: 'desktop' },
      { network: 'wifi', device: 'desktop' }
    ]
  }
};

export default pageStates;