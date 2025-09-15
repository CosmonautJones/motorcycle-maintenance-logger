/**
 * IconManager Unit Tests - TDD Approach
 *
 * Tests the SVG icon system with accessibility features for the UI addition feature.
 * Covers icon retrieval, accessibility attributes, and theme compatibility.
 */

const IconManager = require('../../src/ui/IconManager.js');

describe('IconManager', () => {
  let iconManager;

  beforeEach(() => {
    // Clear DOM and storage
    document.body.innerHTML = '';
    localStorage.clear();

    // Mock fetch for icon loading
    global.fetch = jest.fn();

    // Mock SVG creation
    document.createElementNS = jest.fn(() => {
      const mockSvg = document.createElement('div');
      mockSvg.setAttribute('role', 'img');
      return mockSvg;
    });

    // Create IconManager instance (will fail until we implement it)
    iconManager = new IconManager();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Icon Retrieval - Happy Path', () => {
    test('should successfully retrieve a basic icon by name', async () => {
      // Arrange
      const iconName = 'wrench';
      const expectedSvg = '<svg role="img" aria-label="Wrench icon"><path d="M10,10"/></svg>';

      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(expectedSvg)
      });

      // Act
      const result = await iconManager.getIcon(iconName);

      // Assert
      expect(result).toBeDefined();
      expect(result.tagName.toLowerCase()).toBe('svg');
      expect(result.getAttribute('role')).toBe('img');
      expect(result.getAttribute('aria-label')).toContain('Wrench');
    });

    test('should cache icons after first retrieval', async () => {
      // Arrange
      const iconName = 'gear';
      const mockSvg = '<svg><path d="M5,5"/></svg>';

      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockSvg)
      });

      // Act
      await iconManager.getIcon(iconName);
      await iconManager.getIcon(iconName); // Second call

      // Assert
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(iconManager.cache.has(iconName)).toBe(true);
    });

    test('should apply theme-specific styling to icons', async () => {
      // Arrange
      const iconName = 'oil-drop';
      const mockSvg = '<svg><path d="M0,0"/></svg>';

      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockSvg)
      });

      // Act
      const icon = await iconManager.getIcon(iconName, { theme: 'dark' });

      // Assert
      expect(icon.classList.contains('icon-dark-theme')).toBe(true);
      expect(icon.style.getPropertyValue('--icon-color')).toBeDefined();
    });
  });

  describe('Icon Retrieval - Edge Cases', () => {
    test('should handle non-existent icon gracefully', async () => {
      // Arrange
      const iconName = 'non-existent-icon';

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      // Act
      const result = await iconManager.getIcon(iconName);

      // Assert
      expect(result).toBeDefined();
      expect(result.tagName.toLowerCase()).toBe('svg');
      expect(result.classList.contains('icon-fallback')).toBe(true);
      expect(result.getAttribute('aria-label')).toBe('Icon not available');
    });

    test('should handle malformed SVG content', async () => {
      // Arrange
      const iconName = 'broken-icon';
      const malformedSvg = '<svg><invalid-tag></svg>';

      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(malformedSvg)
      });

      // Act
      const result = await iconManager.getIcon(iconName);

      // Assert
      expect(result).toBeDefined();
      expect(result.classList.contains('icon-fallback')).toBe(true);
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Failed to parse SVG')
      );
    });

    test('should respect size constraints for icons', async () => {
      // Arrange
      const iconName = 'large-icon';
      const mockSvg = '<svg width="1000" height="1000"><path d="M0,0"/></svg>';

      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockSvg)
      });

      // Act
      const icon = await iconManager.getIcon(iconName, { maxSize: 24 });

      // Assert
      expect(icon.getAttribute('width')).toBe('24');
      expect(icon.getAttribute('height')).toBe('24');
      expect(icon.style.maxWidth).toBe('24px');
      expect(icon.style.maxHeight).toBe('24px');
    });
  });

  describe('Icon Accessibility - Error Cases', () => {
    test('should throw error when icon name is empty or invalid', async () => {
      // Arrange & Act & Assert
      await expect(iconManager.getIcon('')).rejects.toThrow('Icon name is required');
      await expect(iconManager.getIcon(null)).rejects.toThrow('Icon name is required');
      await expect(iconManager.getIcon(undefined)).rejects.toThrow('Icon name is required');
      await expect(iconManager.getIcon('icon with spaces')).rejects.toThrow('Invalid icon name format');
    });

    test('should fail when network is unavailable', async () => {
      // Arrange
      const iconName = 'network-fail-icon';

      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      // Act & Assert
      await expect(iconManager.getIcon(iconName)).rejects.toThrow('Failed to load icon');
    });

    test('should validate accessibility attributes are present', async () => {
      // Arrange
      const iconName = 'accessibility-test';
      const svgWithoutA11y = '<svg><path d="M0,0"/></svg>';

      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(svgWithoutA11y)
      });

      // Act
      const icon = await iconManager.getIcon(iconName);

      // Assert - IconManager should add these if missing
      expect(icon.getAttribute('role')).toBe('img');
      expect(icon.getAttribute('aria-label')).toBeDefined();
      expect(icon.getAttribute('aria-label')).not.toBe('');
      expect(icon.hasAttribute('focusable')).toBe(true);
      expect(icon.getAttribute('focusable')).toBe('false');
    });
  });

  describe('Theme Integration', () => {
    test('should detect current theme from ThemeManager', () => {
      // Arrange
      window.ThemeManager = {
        currentTheme: 'dark'
      };

      // Act
      const detectedTheme = iconManager.detectCurrentTheme();

      // Assert
      expect(detectedTheme).toBe('dark');
    });

    test('should update all cached icons when theme changes', async () => {
      // Arrange
      const iconNames = ['icon1', 'icon2', 'icon3'];
      const mockSvg = '<svg><path d="M0,0"/></svg>';

      global.fetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(mockSvg)
      });

      // Load icons in light theme
      for (const name of iconNames) {
        await iconManager.getIcon(name, { theme: 'light' });
      }

      // Act - Theme change
      iconManager.onThemeChange('dark');

      // Assert
      expect(iconManager.cache.size).toBe(iconNames.length);
      for (const name of iconNames) {
        const cachedIcon = iconManager.cache.get(name);
        expect(cachedIcon.classList.contains('icon-dark-theme')).toBe(true);
      }
    });
  });

  describe('Performance and Caching', () => {
    test('should preload commonly used icons', async () => {
      // Arrange
      const commonIcons = ['wrench', 'gear', 'oil-drop', 'calendar'];

      global.fetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('<svg><path d="M0,0"/></svg>')
      });

      // Act
      await iconManager.preloadIcons(commonIcons);

      // Assert
      expect(global.fetch).toHaveBeenCalledTimes(commonIcons.length);
      commonIcons.forEach(iconName => {
        expect(iconManager.cache.has(iconName)).toBe(true);
      });
    });

    test('should clear cache when memory threshold is reached', async () => {
      // Arrange
      iconManager.maxCacheSize = 2;
      const mockSvg = '<svg><path d="M0,0"/></svg>';

      global.fetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(mockSvg)
      });

      // Act - Load more icons than cache size
      await iconManager.getIcon('icon1');
      await iconManager.getIcon('icon2');
      await iconManager.getIcon('icon3'); // Should trigger cache cleanup

      // Assert
      expect(iconManager.cache.size).toBeLessThanOrEqual(iconManager.maxCacheSize);
    });
  });
});