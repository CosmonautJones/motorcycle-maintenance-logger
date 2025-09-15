// DOM Element Test Fixtures for Motorcycle Maintenance Tracker UI Components
// Mock DOM elements and component states for testing

// Mock maintenance data with icon associations
export const maintenanceDataFixtures = {
  oilChangeGood: {
    id: 'oil-change',
    name: 'Oil & Filter Change',
    description: 'Engine oil and filter replacement',
    lastDone: {
      date: '2024-01-01',
      mileage: 28500
    },
    interval: {
      miles: 3500,
      months: 6
    },
    currentMileage: 30000,
    status: 'good',
    nextDue: {
      miles: 32000,
      date: '2024-07-01'
    },
    icon: 'oil',
    color: 'success'
  },

  sparkPlugsDue: {
    id: 'spark-plugs',
    name: 'Spark Plugs',
    description: 'Spark plug inspection and replacement',
    lastDone: {
      date: '2023-06-15',
      mileage: 22500
    },
    interval: {
      miles: 7500,
      months: 12
    },
    currentMileage: 30000,
    status: 'due',
    nextDue: {
      miles: 30000,
      date: '2024-06-15'
    },
    icon: 'sparkPlug',
    color: 'warning'
  },

  brakeFluidOverdue: {
    id: 'brake-fluid',
    name: 'Brake Fluid',
    description: 'Brake fluid replacement',
    lastDone: {
      date: '2022-08-20',
      mileage: 25000
    },
    interval: {
      miles: null,
      months: 24
    },
    currentMileage: 30000,
    status: 'overdue',
    nextDue: {
      miles: null,
      date: '2024-08-20'
    },
    icon: 'brake',
    color: 'danger'
  }
};

// Mock DOM elements for different components
export const domElementFixtures = {
  // Main container elements
  container: {
    tagName: 'div',
    className: 'container',
    id: null,
    innerHTML: '',
    attributes: {
      'data-testid': 'main-container'
    }
  },

  // Tab navigation elements
  tabButton: {
    tagName: 'button',
    className: 'tab-button',
    id: null,
    innerHTML: 'Dashboard',
    attributes: {
      'data-tab': 'dashboard',
      'role': 'tab',
      'aria-selected': 'true',
      'aria-controls': 'dashboard-panel'
    }
  },

  tabButtonWithIcon: {
    tagName: 'button',
    className: 'tab-button tab-button-with-icon',
    id: null,
    innerHTML: `<svg class="icon icon-dashboard" aria-hidden="true">
      <use href="#icon-dashboard"></use>
    </svg>
    <span>Dashboard</span>`,
    attributes: {
      'data-tab': 'dashboard',
      'role': 'tab',
      'aria-selected': 'true',
      'aria-controls': 'dashboard-panel'
    }
  },

  // Maintenance status elements
  maintenanceStatusCard: {
    tagName: 'div',
    className: 'maintenance-item maintenance-item-good',
    id: 'maintenance-oil-change',
    innerHTML: `
      <div class="maintenance-header">
        <h3>Oil & Filter Change</h3>
        <span class="status-badge status-good">Good</span>
      </div>
      <div class="maintenance-details">
        <p>Last done: 1,500 miles ago</p>
        <p>Next due: 2,000 miles</p>
      </div>
    `,
    attributes: {
      'data-maintenance-id': 'oil-change',
      'data-status': 'good'
    }
  },

  maintenanceStatusCardWithIcon: {
    tagName: 'div',
    className: 'maintenance-item maintenance-item-good',
    id: 'maintenance-oil-change',
    innerHTML: `
      <div class="maintenance-header">
        <svg class="icon icon-oil" aria-hidden="true">
          <use href="#icon-oil"></use>
        </svg>
        <h3>Oil & Filter Change</h3>
        <span class="status-badge status-good">
          <svg class="icon icon-check" aria-hidden="true">
            <use href="#icon-check"></use>
          </svg>
          Good
        </span>
      </div>
      <div class="maintenance-details">
        <p>Last done: 1,500 miles ago</p>
        <p>Next due: 2,000 miles</p>
      </div>
    `,
    attributes: {
      'data-maintenance-id': 'oil-change',
      'data-status': 'good'
    }
  },

  // Form elements
  maintenanceForm: {
    tagName: 'form',
    className: 'maintenance-form',
    id: 'workForm',
    innerHTML: `
      <div class="form-group">
        <label for="workDate">Date:</label>
        <input type="date" id="workDate" name="workDate" required>
      </div>
      <div class="form-group">
        <label for="workMileage">Mileage:</label>
        <input type="number" id="workMileage" name="workMileage" required>
      </div>
      <div class="form-group">
        <label for="workType">Type:</label>
        <select id="workType" name="workType" required>
          <option value="">Select type</option>
          <option value="oil-change">Oil Change</option>
          <option value="spark-plugs">Spark Plugs</option>
        </select>
      </div>
      <button type="submit">Add Work</button>
    `,
    attributes: {
      'data-testid': 'maintenance-form'
    }
  },

  // Theme toggle elements
  themeToggle: {
    tagName: 'button',
    className: 'theme-toggle-btn',
    id: 'themeToggle',
    innerHTML: `
      <span class="theme-icon-light" aria-hidden="true">☀️</span>
      <span class="theme-icon-dark" aria-hidden="true">🌙</span>
      <span class="theme-label">Light Mode</span>
    `,
    attributes: {
      'type': 'button',
      'role': 'switch',
      'aria-checked': 'false',
      'aria-label': 'Toggle dark mode'
    }
  },

  themeToggleWithIcons: {
    tagName: 'button',
    className: 'theme-toggle-btn theme-toggle-with-icons',
    id: 'themeToggle',
    innerHTML: `
      <svg class="icon icon-sun theme-icon-light" aria-hidden="true">
        <use href="#icon-sun"></use>
      </svg>
      <svg class="icon icon-moon theme-icon-dark" aria-hidden="true">
        <use href="#icon-moon"></use>
      </svg>
      <span class="theme-label">Light Mode</span>
    `,
    attributes: {
      'type': 'button',
      'role': 'switch',
      'aria-checked': 'false',
      'aria-label': 'Toggle dark mode'
    }
  },

  // Modal elements
  editWorkModal: {
    tagName: 'div',
    className: 'modal',
    id: 'editWorkModal',
    innerHTML: `
      <div class="modal-content">
        <span class="close" data-action="close-edit-modal">&times;</span>
        <h2>Edit Work Entry</h2>
        <form id="editWorkForm">
          <!-- Form content -->
        </form>
      </div>
    `,
    attributes: {
      'aria-hidden': 'true',
      'role': 'dialog',
      'aria-labelledby': 'edit-work-title'
    }
  }
};

// Component state variations
export const componentStates = {
  tabButton: {
    active: {
      className: 'tab-button active',
      attributes: {
        'aria-selected': 'true',
        'tabindex': '0'
      }
    },
    inactive: {
      className: 'tab-button',
      attributes: {
        'aria-selected': 'false',
        'tabindex': '-1'
      }
    },
    disabled: {
      className: 'tab-button disabled',
      attributes: {
        'aria-selected': 'false',
        'tabindex': '-1',
        'aria-disabled': 'true'
      }
    }
  },

  maintenanceStatus: {
    good: {
      className: 'maintenance-item maintenance-item-good',
      statusBadge: 'status-good',
      icon: 'checkCircle',
      color: 'success'
    },
    warning: {
      className: 'maintenance-item maintenance-item-warning',
      statusBadge: 'status-warning',
      icon: 'alertTriangle',
      color: 'warning'
    },
    danger: {
      className: 'maintenance-item maintenance-item-danger',
      statusBadge: 'status-danger',
      icon: 'alertTriangle',
      color: 'danger'
    },
    unknown: {
      className: 'maintenance-item maintenance-item-unknown',
      statusBadge: 'status-unknown',
      icon: 'clock',
      color: 'muted'
    }
  },

  themeToggle: {
    light: {
      className: 'theme-toggle-btn theme-light',
      attributes: {
        'aria-checked': 'false',
        'data-theme': 'light'
      },
      labelText: 'Light Mode'
    },
    dark: {
      className: 'theme-toggle-btn theme-dark',
      attributes: {
        'aria-checked': 'true',
        'data-theme': 'dark'
      },
      labelText: 'Dark Mode'
    }
  },

  modal: {
    hidden: {
      className: 'modal',
      attributes: {
        'aria-hidden': 'true'
      },
      style: { display: 'none' }
    },
    visible: {
      className: 'modal modal-open',
      attributes: {
        'aria-hidden': 'false'
      },
      style: { display: 'block' }
    }
  }
};

// Accessibility test scenarios
export const accessibilityTestScenarios = {
  keyboardNavigation: {
    scenario: 'Tab navigation through maintenance items',
    elements: [
      { selector: '.tab-button[data-tab="dashboard"]', expectedFocus: true },
      { selector: '.tab-button[data-tab="maintenance-log"]', expectedFocus: true },
      { selector: '.tab-button[data-tab="add-work"]', expectedFocus: true },
      { selector: '.tab-button[data-tab="settings"]', expectedFocus: true }
    ],
    expectedTabOrder: ['dashboard', 'maintenance-log', 'add-work', 'settings']
  },

  screenReaderContent: {
    scenario: 'Screen reader announcements for maintenance status',
    elements: [
      {
        selector: '.maintenance-item[data-status="good"]',
        expectedAriaLabel: 'Oil change maintenance is up to date',
        expectedRole: 'status'
      },
      {
        selector: '.maintenance-item[data-status="warning"]',
        expectedAriaLabel: 'Spark plugs maintenance is due soon',
        expectedRole: 'alert'
      },
      {
        selector: '.maintenance-item[data-status="danger"]',
        expectedAriaLabel: 'Brake fluid maintenance is overdue',
        expectedRole: 'alert'
      }
    ]
  },

  colorContrastCompliance: {
    scenario: 'Color contrast ratios meet WCAG AA standards',
    testCases: [
      {
        background: '#ffffff',
        foreground: '#333333',
        expectedRatio: 12.63,
        meetsAA: true,
        meetsAAA: true
      },
      {
        background: '#27ae60',
        foreground: '#ffffff',
        expectedRatio: 4.68,
        meetsAA: true,
        meetsAAA: false
      },
      {
        background: '#f39c12',
        foreground: '#ffffff',
        expectedRatio: 3.48,
        meetsAA: true,
        meetsAAA: false
      }
    ]
  },

  focusManagement: {
    scenario: 'Focus management in modal dialogs',
    steps: [
      {
        action: 'Open edit work modal',
        expectedFocus: '#editWorkModal .close',
        trapFocus: true
      },
      {
        action: 'Tab through form fields',
        expectedFocusOrder: ['#editWorkDate', '#editWorkMileage', '#editWorkType', '#editWorkDescription']
      },
      {
        action: 'Close modal',
        expectedFocus: '[data-action="edit-work"]',
        restoreFocus: true
      }
    ]
  }
};

// Performance test scenarios
export const performanceTestScenarios = {
  iconRendering: {
    scenario: 'SVG icon rendering performance',
    setup: {
      iconCount: 50,
      iconSize: '24px',
      renderMethod: 'svg-sprite'
    },
    expectations: {
      renderTime: '< 16ms',
      memoryUsage: '< 1MB',
      layoutShift: '< 0.1'
    }
  },

  themeTransition: {
    scenario: 'Theme switching performance',
    setup: {
      elementCount: 100,
      cssProperties: 20,
      transitionDuration: '300ms'
    },
    expectations: {
      switchTime: '< 50ms',
      animationFrames: '< 20',
      cpuUsage: '< 50%'
    }
  },

  largeDatasetRendering: {
    scenario: 'Rendering large maintenance history',
    setup: {
      recordCount: 1000,
      renderStrategy: 'virtual-scrolling'
    },
    expectations: {
      initialRender: '< 100ms',
      scrollPerformance: '60fps',
      memoryGrowth: '< 10MB'
    }
  }
};

export default domElementFixtures;