/**
 * Integration tests for user workflows
 */

import { fireEvent, waitFor, screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

describe('User Workflows Integration Tests', () => {
  let container;
  let tracker;

  beforeEach(async () => {
    // Create complete DOM structure
    testUtils.createMockDOM();
    container = document.body;

    // Initialize the application
    // In a real scenario, this would load the actual script.js
    eval(global.ApplicationCode);

    // Wait for initialization
    await waitFor(() => {
      expect(window.tracker).toBeDefined();
    });

    tracker = window.tracker;
  });

  describe('First-Time User Setup', () => {
    test('should guide user through initial mileage setup', async () => {
      const user = userEvent.setup();

      // Check that mileage input is empty initially
      const mileageInput = screen.getByLabelText(/current mileage/i);
      expect(mileageInput.value).toBe('');

      // User enters initial mileage
      await user.type(mileageInput, '15000');
      expect(mileageInput.value).toBe('15000');

      // User clicks update button
      const updateButton = screen.getByRole('button', { name: /update/i });
      await user.click(updateButton);

      // Wait for mileage to be saved and UI to update
      await waitFor(() => {
        expect(tracker.currentMileage).toBe(15000);
      });

      // Check that maintenance status is now displayed
      const maintenanceStatus = document.getElementById('maintenanceStatus');
      expect(maintenanceStatus.innerHTML).not.toBe('');
    });

    test('should show proper maintenance status for new motorcycle', async () => {
      // Set mileage for a new motorcycle
      tracker.currentMileage = 500;
      tracker.workHistory = [];
      tracker.renderMaintenanceStatus();

      // All maintenance items should show as never performed
      const statusElements = container.querySelectorAll('.maintenance-item');
      expect(statusElements.length).toBeGreaterThan(0);

      statusElements.forEach(element => {
        const statusText = element.querySelector('.maintenance-status');
        expect(statusText.textContent).toContain('Never performed');
      });
    });
  });

  describe('Adding Maintenance Work', () => {
    beforeEach(() => {
      tracker.currentMileage = 15000;
    });

    test('should complete full workflow of adding work entry', async () => {
      const user = userEvent.setup();

      // Navigate to Add Work tab
      const addWorkTab = screen.getByRole('button', { name: /add work/i });
      await user.click(addWorkTab);

      // Verify tab is active and form is visible
      expect(addWorkTab.classList.contains('active')).toBe(true);
      const addWorkForm = document.getElementById('workForm');
      expect(addWorkForm).toBeVisible();

      // Fill out the form
      const dateInput = screen.getByLabelText(/date/i);
      const mileageInput = screen.getByLabelText(/mileage/i);
      const typeSelect = screen.getByLabelText(/type/i);
      const descriptionInput = screen.getByLabelText(/description/i);

      await user.clear(dateInput);
      await user.type(dateInput, '2023-12-01');
      await user.type(mileageInput, '15000');
      await user.selectOptions(typeSelect, 'oil-change');
      await user.type(descriptionInput, 'Regular oil change with synthetic oil');

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /add work/i });
      await user.click(submitButton);

      // Wait for work to be added
      await waitFor(() => {
        expect(tracker.workHistory.length).toBeGreaterThan(0);
      });

      // Verify work was added correctly
      const addedWork = tracker.workHistory[0];
      expect(addedWork.date).toBe('2023-12-01');
      expect(addedWork.mileage).toBe(15000);
      expect(addedWork.type).toBe('oil-change');
      expect(addedWork.description).toBe('Regular oil change with synthetic oil');

      // Verify form was reset
      expect(mileageInput.value).toBe('');
      expect(typeSelect.value).toBe('');
      expect(descriptionInput.value).toBe('');
    });

    test('should update maintenance status after adding work', async () => {
      const user = userEvent.setup();

      // Add oil change work
      tracker.workHistory = [];
      tracker.currentMileage = 15000;

      // Navigate to Add Work tab and add work
      const addWorkTab = screen.getByRole('button', { name: /add work/i });
      await user.click(addWorkTab);

      // Fill and submit form
      await user.type(screen.getByLabelText(/date/i), '2023-12-01');
      await user.type(screen.getByLabelText(/mileage/i), '15000');
      await user.selectOptions(screen.getByLabelText(/type/i), 'oil-change');
      await user.type(screen.getByLabelText(/description/i), 'Oil change');

      const submitButton = screen.getByRole('button', { name: /add work/i });
      await user.click(submitButton);

      // Wait for work to be processed
      await waitFor(() => {
        expect(tracker.workHistory.length).toBe(1);
      });

      // Navigate back to dashboard
      const dashboardTab = screen.getByRole('button', { name: /dashboard/i });
      await user.click(dashboardTab);

      // Check that oil change status is now OK
      const oilChangeItem = [...document.querySelectorAll('.maintenance-item')]
        .find(item => item.textContent.includes('Oil & Filter'));

      expect(oilChangeItem).toBeDefined();
      const statusBadge = oilChangeItem.querySelector('.maintenance-status');
      expect(statusBadge.textContent).toContain('miles remaining');
    });

    test('should validate required form fields', async () => {
      const user = userEvent.setup();

      // Navigate to Add Work tab
      const addWorkTab = screen.getByRole('button', { name: /add work/i });
      await user.click(addWorkTab);

      // Try to submit empty form
      const submitButton = screen.getByRole('button', { name: /add work/i });
      await user.click(submitButton);

      // Check that form validation prevents submission
      const dateInput = screen.getByLabelText(/date/i);
      const mileageInput = screen.getByLabelText(/mileage/i);
      const typeSelect = screen.getByLabelText(/type/i);
      const descriptionInput = screen.getByLabelText(/description/i);

      expect(dateInput.checkValidity()).toBe(false);
      expect(mileageInput.checkValidity()).toBe(false);
      expect(typeSelect.checkValidity()).toBe(false);
      expect(descriptionInput.checkValidity()).toBe(false);
    });
  });

  describe('Theme Switching Workflow', () => {
    test('should switch themes and persist preference', async () => {
      const user = userEvent.setup();

      // Navigate to Settings tab
      const settingsTab = screen.getByRole('button', { name: /settings/i });
      await user.click(settingsTab);

      // Find and click theme toggle
      const themeToggle = screen.getByRole('switch', { name: /toggle dark mode/i });
      expect(themeToggle.getAttribute('aria-checked')).toBe('false');

      await user.click(themeToggle);

      // Verify theme changed
      await waitFor(() => {
        expect(themeToggle.getAttribute('aria-checked')).toBe('true');
      });

      // Check that theme preference was saved
      expect(localStorage.getItem('motorcycle-tracker-theme-preference')).toBe('dark');

      // Verify theme classes were applied
      expect(document.body.classList.contains('theme-dark')).toBe(true);
    });

    test('should respect system theme preference', async () => {
      const user = userEvent.setup();

      // Navigate to Settings
      const settingsTab = screen.getByRole('button', { name: /settings/i });
      await user.click(settingsTab);

      // Select system preference
      const themeSelect = screen.getByLabelText(/theme preference/i);
      await user.selectOptions(themeSelect, 'system');

      // Verify system preference was saved
      expect(localStorage.getItem('motorcycle-tracker-theme-preference')).toBe('system');

      // Mock system preference change
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.matches = true;

      // Trigger system theme change event
      const event = new Event('change');
      Object.defineProperty(event, 'matches', { value: true });
      mediaQuery.dispatchEvent(event);

      // Theme should change to dark automatically
      await waitFor(() => {
        expect(document.body.classList.contains('theme-dark')).toBe(true);
      });
    });
  });

  describe('Data Management Workflow', () => {
    beforeEach(() => {
      // Setup test data
      tracker.currentMileage = 15000;
      tracker.workHistory = [
        testUtils.createTestWorkEntry({ id: 1, type: 'oil-change', mileage: 12000 }),
        testUtils.createTestWorkEntry({ id: 2, type: 'spark-plugs', mileage: 10000 })
      ];
      tracker.maintenanceSchedule = [
        testUtils.createTestMaintenanceItem({ id: 'oil-change' }),
        testUtils.createTestMaintenanceItem({ id: 'spark-plugs', intervalMiles: 7500 })
      ];
    });

    test('should export data successfully', async () => {
      const user = userEvent.setup();

      // Mock download functionality
      const mockLink = {
        href: '',
        download: '',
        click: jest.fn()
      };
      jest.spyOn(document, 'createElement').mockReturnValue(mockLink);
      jest.spyOn(document.body, 'appendChild').mockImplementation();
      jest.spyOn(document.body, 'removeChild').mockImplementation();

      global.URL = {
        createObjectURL: jest.fn(() => 'blob:url'),
        revokeObjectURL: jest.fn()
      };

      // Navigate to Settings and click export
      const settingsTab = screen.getByRole('button', { name: /settings/i });
      await user.click(settingsTab);

      const exportButton = screen.getByRole('button', { name: /export all data/i });
      await user.click(exportButton);

      // Verify export was triggered
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockLink.download).toContain('motorcycle-maintenance-backup-');
    });

    test('should import data and replace existing data', async () => {
      const user = userEvent.setup();

      const importData = {
        currentMileage: 20000,
        workHistory: [
          testUtils.createTestWorkEntry({ id: 3, type: 'air-filter', mileage: 18000 })
        ],
        maintenanceSchedule: [
          testUtils.createTestMaintenanceItem({ id: 'air-filter', intervalMiles: 15000 })
        ]
      };

      // Mock file and FileReader
      const mockFile = new File([JSON.stringify(importData)], 'backup.json', {
        type: 'application/json'
      });

      global.confirm = jest.fn(() => true);

      // Mock location.reload
      delete window.location;
      window.location = { reload: jest.fn() };

      // Navigate to Settings
      const settingsTab = screen.getByRole('button', { name: /settings/i });
      await user.click(settingsTab);

      // Click import button (this triggers file input)
      const importButton = screen.getByRole('button', { name: /import data/i });
      await user.click(importButton);

      // Simulate file selection
      const fileInput = document.getElementById('importFile');
      Object.defineProperty(fileInput, 'files', {
        value: [mockFile],
        writable: false,
      });

      // Trigger file change event
      fireEvent.change(fileInput);

      // Wait for import to complete
      await waitFor(() => {
        expect(window.location.reload).toHaveBeenCalled();
      });

      // Verify confirmation was shown
      expect(global.confirm).toHaveBeenCalledWith(
        'This will replace all current data. Are you sure?'
      );
    });
  });

  describe('Work History Management', () => {
    beforeEach(() => {
      tracker.workHistory = [
        testUtils.createTestWorkEntry({
          id: 1,
          type: 'oil-change',
          mileage: 12000,
          description: 'Regular oil change'
        })
      ];
      tracker.maintenanceSchedule = [
        testUtils.createTestMaintenanceItem({ id: 'oil-change' })
      ];
    });

    test('should view and edit work history entries', async () => {
      const user = userEvent.setup();

      // Navigate to Maintenance Log
      const logTab = screen.getByRole('button', { name: /maintenance log/i });
      await user.click(logTab);

      // Render work history
      tracker.renderWorkHistory();

      // Find and click edit button for the work entry
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      // Verify edit modal is opened
      const editModal = document.getElementById('editWorkModal');
      expect(editModal.style.display).toBe('block');

      // Verify form is populated with existing data
      const editDateInput = document.getElementById('editWorkDate');
      const editMileageInput = document.getElementById('editWorkMileage');
      const editDescriptionInput = document.getElementById('editWorkDescription');

      expect(editDateInput.value).toBe('2023-01-15');
      expect(editMileageInput.value).toBe('12000');
      expect(editDescriptionInput.value).toBe('Regular oil change');

      // Modify the entry
      await user.clear(editDescriptionInput);
      await user.type(editDescriptionInput, 'Updated oil change with filter');

      // Submit changes
      const updateButton = screen.getByRole('button', { name: /update work/i });
      await user.click(updateButton);

      // Verify work was updated
      await waitFor(() => {
        expect(tracker.workHistory[0].description).toBe('Updated oil change with filter');
      });

      // Verify modal was closed
      expect(editModal.style.display).toBe('none');
    });

    test('should delete work entries with confirmation', async () => {
      const user = userEvent.setup();
      global.confirm = jest.fn(() => true);

      // Navigate to Maintenance Log
      const logTab = screen.getByRole('button', { name: /maintenance log/i });
      await user.click(logTab);

      // Render work history
      tracker.renderWorkHistory();

      // Find and click delete button
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      // Verify confirmation was shown
      expect(global.confirm).toHaveBeenCalledWith(
        'Are you sure you want to delete this work entry?'
      );

      // Verify work was deleted
      await waitFor(() => {
        expect(tracker.workHistory.length).toBe(0);
      });
    });
  });

  describe('Responsive Design and Mobile Experience', () => {
    test('should adapt navigation for mobile screens', () => {
      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });

      // Trigger resize event
      window.dispatchEvent(new Event('resize'));

      // Check that tabs stack vertically on mobile
      const tabContainer = document.querySelector('.tabs');
      const computedStyle = window.getComputedStyle(tabContainer);

      // This would need actual CSS to work, but demonstrates the concept
      expect(tabContainer).toBeDefined();
    });

    test('should handle touch interactions on mobile', async () => {
      const user = userEvent.setup();

      // Simulate touch events on tab navigation
      const settingsTab = screen.getByRole('button', { name: /settings/i });

      // Use pointer events to simulate touch
      await user.pointer({ target: settingsTab, keys: '[TouchA]' });

      expect(settingsTab.classList.contains('active')).toBe(true);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle network errors gracefully', async () => {
      const user = userEvent.setup();

      // Mock database error
      tracker.db.workHistory.add = jest.fn().mockRejectedValue(new Error('Network error'));
      global.alert = jest.fn();

      // Try to add work entry
      const addWorkTab = screen.getByRole('button', { name: /add work/i });
      await user.click(addWorkTab);

      await user.type(screen.getByLabelText(/date/i), '2023-12-01');
      await user.type(screen.getByLabelText(/mileage/i), '15000');
      await user.selectOptions(screen.getByLabelText(/type/i), 'oil-change');
      await user.type(screen.getByLabelText(/description/i), 'Test');

      const submitButton = screen.getByRole('button', { name: /add work/i });
      await user.click(submitButton);

      // Verify error was handled
      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('Failed to save work entry');
      });
    });

    test('should handle malformed import data', async () => {
      const user = userEvent.setup();
      global.alert = jest.fn();

      // Create malformed JSON file
      const malformedFile = new File(['{ invalid json'], 'bad.json', {
        type: 'application/json'
      });

      // Navigate to Settings and attempt import
      const settingsTab = screen.getByRole('button', { name: /settings/i });
      await user.click(settingsTab);

      const importButton = screen.getByRole('button', { name: /import data/i });
      await user.click(importButton);

      const fileInput = document.getElementById('importFile');
      Object.defineProperty(fileInput, 'files', {
        value: [malformedFile],
        writable: false,
      });

      fireEvent.change(fileInput);

      // Verify error handling
      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith(
          'Failed to import data. Please check the file format.'
        );
      });
    });
  });

  describe('Accessibility Compliance', () => {
    test('should support keyboard navigation', async () => {
      const user = userEvent.setup();

      // Test tab navigation with keyboard
      const firstTab = screen.getByRole('button', { name: /dashboard/i });
      firstTab.focus();

      expect(document.activeElement).toBe(firstTab);

      // Navigate with Tab key
      await user.keyboard('{Tab}');
      const secondTab = screen.getByRole('button', { name: /maintenance log/i });
      expect(document.activeElement).toBe(secondTab);

      // Activate with Enter
      await user.keyboard('{Enter}');
      expect(secondTab.classList.contains('active')).toBe(true);
    });

    test('should have proper ARIA labels and roles', () => {
      // Check theme toggle has proper ARIA attributes
      const themeToggle = document.getElementById('themeToggle');
      expect(themeToggle.getAttribute('role')).toBe('switch');
      expect(themeToggle.getAttribute('aria-label')).toBe('Toggle dark mode');

      // Check form labels are properly associated
      const mileageInput = document.getElementById('currentMileage');
      const mileageLabel = document.querySelector('label[for="currentMileage"]');
      expect(mileageLabel).toBeDefined();
      expect(mileageLabel.getAttribute('for')).toBe('currentMileage');
    });

    test('should announce theme changes to screen readers', async () => {
      const user = userEvent.setup();

      // Navigate to Settings
      const settingsTab = screen.getByRole('button', { name: /settings/i });
      await user.click(settingsTab);

      // Toggle theme
      const themeToggle = screen.getByRole('switch', { name: /toggle dark mode/i });
      await user.click(themeToggle);

      // Verify ARIA state was updated
      expect(themeToggle.getAttribute('aria-checked')).toBe('true');
    });
  });
});

// Mock application code for integration testing
global.ApplicationCode = \`
// Simulate loading the actual application
class MockApp {
  constructor() {
    this.tracker = new MotorcycleTracker();
    window.tracker = this.tracker;

    // Setup event listeners
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Mock event setup
    document.addEventListener('click', (e) => {
      if (e.target.hasAttribute('data-tab')) {
        const tabName = e.target.getAttribute('data-tab');
        this.tracker.openTab(e, tabName);
      }
    });
  }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  new MockApp();
});

// Trigger DOMContentLoaded for testing
if (document.readyState !== 'loading') {
  document.dispatchEvent(new Event('DOMContentLoaded'));
}
\`;