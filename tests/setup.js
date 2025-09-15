// Jest setup file for motorcycle maintenance tracker tests

// Import testing utilities
require('@testing-library/jest-dom');

// Import fake IndexedDB for testing
require('fake-indexeddb/auto');

// Global test setup
beforeEach(() => {
  // Clear localStorage before each test
  localStorage.clear();

  // Clear sessionStorage before each test
  sessionStorage.clear();

  // Reset DOM
  document.body.innerHTML = '';
  document.head.innerHTML = '';

  // Mock console.error to avoid noise in tests (unless testing error cases)
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  // Restore console methods
  console.error.mockRestore();
  console.warn.mockRestore();

  // Clear all timers
  jest.clearAllTimers();

  // Clear all mocks
  jest.clearAllMocks();
});

// Global mocks
global.alert = jest.fn();
global.confirm = jest.fn(() => true);
global.prompt = jest.fn();

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  disconnect() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {}
  disconnect() {}
  unobserve() {}
};

// Mock fetch for API calls (if needed)
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    status: 200,
    statusText: 'OK'
  })
);

// Custom matchers for better assertions
expect.extend({
  toBeInLocalStorage(received) {
    const pass = localStorage.getItem(received) !== null;
    if (pass) {
      return {
        message: () => `expected ${received} not to be in localStorage`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be in localStorage`,
        pass: false,
      };
    }
  },

  toHaveBeenCalledWithError(received, error) {
    const pass = received.mock.calls.some(call =>
      call.some(arg => arg instanceof Error && arg.message === error)
    );
    if (pass) {
      return {
        message: () => `expected function not to have been called with error "${error}"`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected function to have been called with error "${error}"`,
        pass: false,
      };
    }
  }
});

// Helper functions for tests
global.testUtils = {
  // Create a mock HTML structure for testing
  createMockDOM: () => {
    document.body.innerHTML = `
      <div class="container">
        <header>
          <h1>🏍️ 2001 Suzuki Intruder Volusia 800</h1>
          <p>Maintenance Tracker</p>
        </header>

        <div class="current-mileage">
          <label for="currentMileage">Current Mileage:</label>
          <input type="number" id="currentMileage" placeholder="Enter current mileage">
          <button id="updateMileageBtn">Update</button>
        </div>

        <div class="tabs">
          <button class="tab-button active" data-tab="dashboard">Dashboard</button>
          <button class="tab-button" data-tab="maintenance-log">Maintenance Log</button>
          <button class="tab-button" data-tab="add-work">Add Work</button>
          <button class="tab-button" data-tab="settings">Settings</button>
        </div>

        <div id="dashboard" class="tab-content active">
          <h2>Maintenance Status</h2>
          <div id="maintenanceStatus"></div>
        </div>

        <div id="maintenance-log" class="tab-content">
          <h2>Work History</h2>
          <div id="workHistory"></div>
        </div>

        <div id="add-work" class="tab-content">
          <h2>Add Work Done</h2>
          <form id="workForm">
            <div class="form-group">
              <label for="workDate">Date:</label>
              <input type="date" id="workDate" required>
            </div>
            <div class="form-group">
              <label for="workMileage">Mileage:</label>
              <input type="number" id="workMileage" required>
            </div>
            <div class="form-group">
              <label for="workType">Type:</label>
              <select id="workType" required>
                <option value="">Select type</option>
                <option value="oil-change">Oil Change</option>
                <option value="spark-plugs">Spark Plugs</option>
              </select>
            </div>
            <div class="form-group">
              <label for="workDescription">Description:</label>
              <textarea id="workDescription" rows="3" required></textarea>
            </div>
            <button type="submit">Add Work</button>
          </form>
        </div>

        <div id="settings" class="tab-content">
          <h2>Settings & Maintenance Schedule</h2>
          <div id="maintenanceSettings"></div>
        </div>
      </div>

      <div id="editWorkModal" class="modal">
        <div class="modal-content">
          <span class="close" data-action="close-edit-modal">&times;</span>
          <h2>Edit Work Entry</h2>
          <form id="editWorkForm">
            <input type="date" id="editWorkDate" required>
            <input type="number" id="editWorkMileage" required>
            <select id="editWorkType" required></select>
            <textarea id="editWorkDescription" required></textarea>
            <button type="submit">Update Work</button>
          </form>
        </div>
      </div>
    `;
  },

  // Wait for async operations
  waitFor: (fn, timeout = 1000) => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const check = () => {
        try {
          const result = fn();
          if (result) {
            resolve(result);
          } else if (Date.now() - startTime >= timeout) {
            reject(new Error('Timeout waiting for condition'));
          } else {
            setTimeout(check, 10);
          }
        } catch (error) {
          reject(error);
        }
      };
      check();
    });
  },

  // Create test work entries
  createTestWorkEntry: (overrides = {}) => ({
    id: 1,
    date: '2023-01-15',
    mileage: 10000,
    type: 'oil-change',
    description: 'Regular oil change with new filter',
    timestamp: '2023-01-15T10:00:00.000Z',
    lastModified: '2023-01-15T10:00:00.000Z',
    modifiedBy: 'user',
    ...overrides
  }),

  // Create test maintenance items
  createTestMaintenanceItem: (overrides = {}) => ({
    id: 'oil-change',
    name: 'Oil & Filter Change',
    intervalMiles: 3500,
    intervalMonths: null,
    description: 'Change engine oil and oil filter',
    isCustom: false,
    created: '2023-01-01T00:00:00.000Z',
    lastModified: '2023-01-01T00:00:00.000Z',
    ...overrides
  })
};