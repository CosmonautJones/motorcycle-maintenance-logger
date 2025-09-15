/**
 * Unit tests for ThemeManager class
 */

// Import the class (we'll need to modify script.js to export it)
// For now, we'll load it via DOM simulation

describe('ThemeManager', () => {
  let themeManager;

  beforeEach(() => {
    // Create mock DOM
    testUtils.createMockDOM();

    // Add theme controls to DOM
    document.body.innerHTML += `
      <div id="themeToggle" class="theme-toggle-btn" role="switch" aria-checked="false">
        <span class="theme-label">Light Mode</span>
      </div>
      <select id="themePreference">
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    `;

    // Load and execute the ThemeManager class
    eval(`
      ${global.ThemeManagerCode}
    `);

    themeManager = new ThemeManager();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Constructor and Initialization', () => {
    test('should initialize with default theme preference', () => {
      expect(themeManager.themePreference).toBeDefined();
      expect(['light', 'dark', 'system']).toContain(themeManager.themePreference);
    });

    test('should set up system media query safely', () => {
      expect(themeManager.systemMediaQuery).toBeDefined();
      expect(typeof themeManager.systemMediaQuery.matches).toBe('boolean');
    });

    test('should determine initial theme correctly', () => {
      expect(themeManager.currentTheme).toBeDefined();
      expect(['light', 'dark']).toContain(themeManager.currentTheme);
    });
  });

  describe('Theme Preference Management', () => {
    test('should load theme preference from localStorage', () => {
      localStorage.setItem('motorcycle-tracker-theme-preference', 'dark');
      const preference = themeManager.loadThemePreference();
      expect(preference).toBe('dark');
    });

    test('should default to system preference when no saved preference', () => {
      localStorage.clear();
      const preference = themeManager.loadThemePreference();
      expect(preference).toBe('system');
    });

    test('should save theme preference to localStorage', () => {
      themeManager.saveThemePreference('dark');
      expect(localStorage.getItem('motorcycle-tracker-theme-preference')).toBe('dark');
      expect(themeManager.themePreference).toBe('dark');
    });
  });

  describe('Theme Determination Logic', () => {
    test('should return system theme when preference is system', () => {
      themeManager.themePreference = 'system';
      themeManager.systemMediaQuery.matches = true;
      expect(themeManager.determineTheme()).toBe('dark');

      themeManager.systemMediaQuery.matches = false;
      expect(themeManager.determineTheme()).toBe('light');
    });

    test('should return explicit preference when not system', () => {
      themeManager.themePreference = 'dark';
      expect(themeManager.determineTheme()).toBe('dark');

      themeManager.themePreference = 'light';
      expect(themeManager.determineTheme()).toBe('light');
    });
  });

  describe('Theme Application', () => {
    test('should apply light theme correctly', () => {
      themeManager.applyTheme('light');

      const rootStyle = document.documentElement.style;
      expect(rootStyle.getPropertyValue('--bg-primary')).toBeTruthy();
      expect(document.body.classList.contains('theme-light')).toBe(true);
      expect(themeManager.currentTheme).toBe('light');
    });

    test('should apply dark theme correctly', () => {
      themeManager.applyTheme('dark');

      const rootStyle = document.documentElement.style;
      expect(rootStyle.getPropertyValue('--bg-primary')).toBeTruthy();
      expect(document.body.classList.contains('theme-dark')).toBe(true);
      expect(themeManager.currentTheme).toBe('dark');
    });

    test('should dispatch theme change event', () => {
      const eventSpy = jest.spyOn(window, 'dispatchEvent');
      themeManager.applyTheme('dark');

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'themeChanged',
          detail: expect.objectContaining({
            theme: 'dark'
          })
        })
      );
    });
  });

  describe('Safe MatchMedia Implementation', () => {
    test('should handle browsers without matchMedia support', () => {
      const originalMatchMedia = window.matchMedia;
      delete window.matchMedia;

      const fallbackQuery = themeManager.safeMatchMedia('(prefers-color-scheme: dark)');

      expect(fallbackQuery.matches).toBe(false);
      expect(typeof fallbackQuery.addEventListener).toBe('function');
      expect(typeof fallbackQuery.removeEventListener).toBe('function');

      // Restore
      window.matchMedia = originalMatchMedia;
    });

    test('should use native matchMedia when available', () => {
      const query = themeManager.safeMatchMedia('(prefers-color-scheme: dark)');
      expect(query).toBe(window.matchMedia('(prefers-color-scheme: dark)'));
    });
  });

  describe('Theme Controls Setup', () => {
    test('should setup theme toggle button correctly', () => {
      themeManager.currentTheme = 'dark';
      themeManager.setupThemeControls();

      const toggleButton = document.getElementById('themeToggle');
      expect(toggleButton.getAttribute('aria-checked')).toBe('true');
    });

    test('should setup theme preference select correctly', () => {
      themeManager.themePreference = 'dark';
      themeManager.setupThemeControls();

      const preferenceSelect = document.getElementById('themePreference');
      expect(preferenceSelect.value).toBe('dark');
    });

    test('should handle missing DOM elements gracefully', () => {
      document.getElementById('themeToggle').remove();
      document.getElementById('themePreference').remove();

      expect(() => themeManager.setupThemeControls()).not.toThrow();
    });
  });

  describe('Theme Switching Methods', () => {
    test('should switch theme correctly', () => {
      const applyThemeSpy = jest.spyOn(themeManager, 'applyTheme');
      const updateControlsSpy = jest.spyOn(themeManager, 'updateThemeControls');

      themeManager.switchTheme('dark');

      expect(applyThemeSpy).toHaveBeenCalledWith('dark');
      expect(updateControlsSpy).toHaveBeenCalled();
    });

    test('should toggle theme correctly', () => {
      themeManager.currentTheme = 'light';
      const savePreferenceSpy = jest.spyOn(themeManager, 'saveThemePreference');
      const switchThemeSpy = jest.spyOn(themeManager, 'switchTheme');

      themeManager.toggleTheme();

      expect(savePreferenceSpy).toHaveBeenCalledWith('dark');
      expect(switchThemeSpy).toHaveBeenCalledWith('dark');
    });
  });

  describe('System Theme Listener', () => {
    test('should respond to system theme changes when preference is system', () => {
      themeManager.themePreference = 'system';
      const applyThemeSpy = jest.spyOn(themeManager, 'applyTheme');

      // Simulate system theme change
      const mediaQuery = themeManager.systemMediaQuery;
      const listener = mediaQuery.addEventListener.mock.calls[0][1];

      listener({ matches: true });
      expect(applyThemeSpy).toHaveBeenCalledWith('dark');

      listener({ matches: false });
      expect(applyThemeSpy).toHaveBeenCalledWith('light');
    });

    test('should not respond to system theme changes when preference is explicit', () => {
      themeManager.themePreference = 'dark';
      const applyThemeSpy = jest.spyOn(themeManager, 'applyTheme');
      applyThemeSpy.mockClear();

      // Simulate system theme change
      const mediaQuery = themeManager.systemMediaQuery;
      const listener = mediaQuery.addEventListener.mock.calls[0][1];

      listener({ matches: false });
      expect(applyThemeSpy).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('should handle DOM manipulation errors gracefully', () => {
      // Mock a DOM error
      const originalSetProperty = document.documentElement.style.setProperty;
      document.documentElement.style.setProperty = jest.fn(() => {
        throw new Error('DOM error');
      });

      expect(() => themeManager.applyTheme('dark')).not.toThrow();

      // Restore
      document.documentElement.style.setProperty = originalSetProperty;
    });

    test('should handle localStorage errors gracefully', () => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        throw new Error('QuotaExceededError');
      });

      expect(() => themeManager.saveThemePreference('dark')).not.toThrow();

      // Restore
      localStorage.setItem = originalSetItem;
    });
  });
});

// Mock ThemeManager code for testing
global.ThemeManagerCode = `
class ThemeManager {
  constructor() {
    this.themes = {
      light: {
        name: 'Light Mode',
        properties: {
          '--bg-primary': '#f5f5f5',
          '--text-primary': '#333333'
        }
      },
      dark: {
        name: 'Dark Mode',
        properties: {
          '--bg-primary': '#1a1a1a',
          '--text-primary': '#ffffff'
        }
      }
    };

    this.themePreference = this.loadThemePreference();
    this.systemMediaQuery = this.safeMatchMedia('(prefers-color-scheme: dark)');
    this.currentTheme = this.determineTheme();
    this.initialize();
  }

  safeMatchMedia(query) {
    if (typeof window.matchMedia !== 'function') {
      return {
        matches: false,
        addEventListener: () => {},
        removeEventListener: () => {}
      };
    }
    return window.matchMedia(query);
  }

  initialize() {
    this.applyTheme(this.currentTheme);
    this.setupSystemThemeListener();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.initializeDOMElements();
      });
    } else {
      this.initializeDOMElements();
    }
  }

  initializeDOMElements() {
    this.addTransitionClasses();
    this.setupThemeControls();
  }

  loadThemePreference() {
    return localStorage.getItem('motorcycle-tracker-theme-preference') || 'system';
  }

  saveThemePreference(preference) {
    localStorage.setItem('motorcycle-tracker-theme-preference', preference);
    this.themePreference = preference;
  }

  determineTheme() {
    if (this.themePreference === 'system') {
      return this.systemMediaQuery.matches ? 'dark' : 'light';
    }
    return this.themePreference === 'dark' ? 'dark' : 'light';
  }

  applyTheme(themeName) {
    const theme = this.themes[themeName];
    if (!theme) return;

    Object.entries(theme.properties).forEach(([property, value]) => {
      document.documentElement.style.setProperty(property, value);
    });

    document.body.className = document.body.className.replace(/theme-\\w+/g, '');
    document.body.classList.add(\`theme-\${themeName}\`);

    this.currentTheme = themeName;

    window.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { theme: themeName, properties: theme.properties }
    }));
  }

  setupSystemThemeListener() {
    this.systemMediaQuery.addEventListener('change', (e) => {
      if (this.themePreference === 'system') {
        const newTheme = e.matches ? 'dark' : 'light';
        this.applyTheme(newTheme);
        this.updateThemeControls();
      }
    });
  }

  setupThemeControls() {
    const themeToggle = document.getElementById('themeToggle');
    const themePreferenceSelect = document.getElementById('themePreference');

    if (themeToggle) {
      themeToggle.setAttribute('aria-checked', this.currentTheme === 'dark' ? 'true' : 'false');
      const label = themeToggle.querySelector('.theme-label');
      if (label) {
        label.textContent = this.currentTheme === 'dark' ? 'Dark Mode' : 'Light Mode';
      }
    }

    if (themePreferenceSelect) {
      themePreferenceSelect.value = this.themePreference;
      themePreferenceSelect.addEventListener('change', (e) => {
        this.saveThemePreference(e.target.value);
        const newTheme = this.determineTheme();
        this.applyTheme(newTheme);
        this.updateThemeControls();
      });
    }
  }

  updateThemeControls() {
    this.setupThemeControls();
  }

  addTransitionClasses() {
    // Add transition classes to elements
  }

  switchTheme(themeName) {
    this.applyTheme(themeName);
    this.updateThemeControls();
  }

  toggleTheme() {
    const nextTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.saveThemePreference(nextTheme);
    this.switchTheme(nextTheme);
  }
}
`;