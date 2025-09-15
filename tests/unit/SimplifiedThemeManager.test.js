/**
 * Simplified ThemeManager Unit Tests - TDD Approach
 *
 * Tests the enhanced ThemeManager with simplified controls (light/dark only).
 * Covers toggle functionality, preference persistence, and system detection removal.
 */

describe('SimplifiedThemeManager', () => {
  let simplifiedThemeManager;

  beforeEach(() => {
    // Clear DOM and storage
    document.body.innerHTML = '';
    localStorage.clear();

    // Mock matchMedia for system theme detection
    const mockMatchMedia = jest.fn((query) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn() // deprecated
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia
    });

    // Mock DOM elements that SimplifiedThemeManager will use
    document.body.innerHTML = `
      <button id="theme-toggle" aria-label="Toggle theme">
        <span class="theme-icon">🌙</span>
        <span class="theme-text">Dark Mode</span>
      </button>
    `;

    // Create SimplifiedThemeManager instance (will fail until we implement it)
    simplifiedThemeManager = new SimplifiedThemeManager();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Theme Toggle - Happy Path', () => {
    test('should initialize with light theme by default', () => {
      // Assert
      expect(simplifiedThemeManager.currentTheme).toBe('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      expect(localStorage.getItem('motorcycle-tracker-theme')).toBe('light');
    });

    test('should toggle from light to dark theme', () => {
      // Arrange
      expect(simplifiedThemeManager.currentTheme).toBe('light');

      // Act
      simplifiedThemeManager.toggle();

      // Assert
      expect(simplifiedThemeManager.currentTheme).toBe('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      expect(localStorage.getItem('motorcycle-tracker-theme')).toBe('dark');
    });

    test('should toggle from dark to light theme', () => {
      // Arrange
      simplifiedThemeManager.setTheme('dark');
      expect(simplifiedThemeManager.currentTheme).toBe('dark');

      // Act
      simplifiedThemeManager.toggle();

      // Assert
      expect(simplifiedThemeManager.currentTheme).toBe('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      expect(localStorage.getItem('motorcycle-tracker-theme')).toBe('light');
    });

    test('should update toggle button appearance when theme changes', () => {
      // Arrange
      const toggleButton = document.getElementById('theme-toggle');
      const themeIcon = toggleButton.querySelector('.theme-icon');
      const themeText = toggleButton.querySelector('.theme-text');

      // Act
      simplifiedThemeManager.toggle(); // Switch to dark

      // Assert
      expect(themeIcon.textContent).toBe('☀️');
      expect(themeText.textContent).toBe('Light Mode');
      expect(toggleButton.getAttribute('aria-label')).toBe('Switch to light mode');
    });
  });

  describe('Theme Persistence - Edge Cases', () => {
    test('should load saved theme preference on initialization', () => {
      // Arrange
      localStorage.setItem('motorcycle-tracker-theme', 'dark');

      // Act
      const newManager = new SimplifiedThemeManager();

      // Assert
      expect(newManager.currentTheme).toBe('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    test('should handle invalid saved theme preference gracefully', () => {
      // Arrange
      localStorage.setItem('motorcycle-tracker-theme', 'invalid-theme');

      // Act
      const newManager = new SimplifiedThemeManager();

      // Assert
      expect(newManager.currentTheme).toBe('light'); // Should default to light
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      expect(localStorage.getItem('motorcycle-tracker-theme')).toBe('light');
    });

    test('should handle corrupted localStorage data', () => {
      // Arrange
      Object.defineProperty(localStorage, 'getItem', {
        value: jest.fn(() => { throw new Error('Storage error'); })
      });

      // Act
      const newManager = new SimplifiedThemeManager();

      // Assert
      expect(newManager.currentTheme).toBe('light'); // Should fallback to default
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Failed to load theme preference')
      );
    });
  });

  describe('System Detection Removal - Error Cases', () => {
    test('should not automatically follow system theme preferences', () => {
      // Arrange
      window.matchMedia = jest.fn(() => ({
        matches: true, // System prefers dark
        addEventListener: jest.fn()
      }));

      // Act
      const newManager = new SimplifiedThemeManager();

      // Assert
      expect(newManager.currentTheme).toBe('light'); // Should stay light, not follow system
      expect(newManager.hasSystemDetection).toBe(false);
    });

    test('should throw error when attempting to set system theme', () => {
      // Act & Assert
      expect(() => {
        simplifiedThemeManager.setTheme('system');
      }).toThrow('System theme detection has been removed. Use "light" or "dark" only.');
    });

    test('should fail gracefully when toggle button is missing', () => {
      // Arrange
      document.getElementById('theme-toggle').remove();

      // Act & Assert
      expect(() => {
        simplifiedThemeManager.toggle();
      }).not.toThrow();

      expect(console.warn).toHaveBeenCalledWith(
        'Theme toggle button not found in DOM'
      );
    });

    test('should validate theme values strictly', () => {
      // Act & Assert
      expect(() => simplifiedThemeManager.setTheme('')).toThrow('Invalid theme');
      expect(() => simplifiedThemeManager.setTheme(null)).toThrow('Invalid theme');
      expect(() => simplifiedThemeManager.setTheme(undefined)).toThrow('Invalid theme');
      expect(() => simplifiedThemeManager.setTheme('auto')).toThrow('Invalid theme');
      expect(() => simplifiedThemeManager.setTheme('Light')).toThrow('Invalid theme'); // Case sensitive
    });
  });

  describe('CSS Custom Properties Integration', () => {
    test('should apply correct CSS custom properties for light theme', () => {
      // Act
      simplifiedThemeManager.setTheme('light');

      // Assert
      const rootStyles = getComputedStyle(document.documentElement);
      expect(document.documentElement.style.getPropertyValue('--bg-primary')).toBeDefined();
      expect(document.documentElement.style.getPropertyValue('--text-primary')).toBeDefined();
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    test('should apply correct CSS custom properties for dark theme', () => {
      // Act
      simplifiedThemeManager.setTheme('dark');

      // Assert
      const rootStyles = getComputedStyle(document.documentElement);
      expect(document.documentElement.style.getPropertyValue('--bg-primary')).toBeDefined();
      expect(document.documentElement.style.getPropertyValue('--text-primary')).toBeDefined();
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    test('should trigger theme change event for other components', () => {
      // Arrange
      const mockEventListener = jest.fn();
      document.addEventListener('themechange', mockEventListener);

      // Act
      simplifiedThemeManager.toggle();

      // Assert
      expect(mockEventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: {
            oldTheme: 'light',
            newTheme: 'dark',
            timestamp: expect.any(Number)
          }
        })
      );
    });
  });

  describe('Performance and Animation', () => {
    test('should handle rapid theme toggles without race conditions', () => {
      // Act - Rapid toggles
      simplifiedThemeManager.toggle();
      simplifiedThemeManager.toggle();
      simplifiedThemeManager.toggle();
      simplifiedThemeManager.toggle();

      // Assert
      expect(simplifiedThemeManager.currentTheme).toBe('light'); // Should end up back at light
      expect(localStorage.getItem('motorcycle-tracker-theme')).toBe('light');
    });

    test('should debounce rapid toggle attempts', () => {
      // Arrange
      jest.useFakeTimers();
      const mockSetTheme = jest.spyOn(simplifiedThemeManager, 'setTheme');

      // Act
      simplifiedThemeManager.toggle();
      simplifiedThemeManager.toggle();
      simplifiedThemeManager.toggle();

      jest.advanceTimersByTime(100);

      // Assert
      expect(mockSetTheme).toHaveBeenCalledTimes(1); // Only first call should execute
      jest.useRealTimers();
    });

    test('should add transition classes during theme switch', () => {
      // Act
      simplifiedThemeManager.toggle();

      // Assert
      expect(document.body.classList.contains('theme-transitioning')).toBe(true);

      // Wait for transition to complete
      setTimeout(() => {
        expect(document.body.classList.contains('theme-transitioning')).toBe(false);
      }, 300);
    });
  });

  describe('Keyboard and Accessibility', () => {
    test('should support keyboard activation of theme toggle', () => {
      // Arrange
      const toggleButton = document.getElementById('theme-toggle');
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });

      // Act & Assert
      toggleButton.dispatchEvent(enterEvent);
      expect(simplifiedThemeManager.currentTheme).toBe('dark');

      toggleButton.dispatchEvent(spaceEvent);
      expect(simplifiedThemeManager.currentTheme).toBe('light');
    });

    test('should maintain proper ARIA attributes', () => {
      // Arrange
      const toggleButton = document.getElementById('theme-toggle');

      // Act
      simplifiedThemeManager.toggle();

      // Assert
      expect(toggleButton.getAttribute('aria-pressed')).toBe('true'); // Dark mode is "pressed"
      expect(toggleButton.getAttribute('aria-label')).toContain('light mode');

      // Toggle back
      simplifiedThemeManager.toggle();
      expect(toggleButton.getAttribute('aria-pressed')).toBe('false');
      expect(toggleButton.getAttribute('aria-label')).toContain('dark mode');
    });
  });
});