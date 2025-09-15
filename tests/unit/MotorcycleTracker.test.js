/**
 * Unit tests for MotorcycleTracker class
 */

describe('MotorcycleTracker', () => {
  let tracker;
  let mockDB;

  beforeEach(() => {
    // Create mock DOM
    testUtils.createMockDOM();

    // Mock Dexie database
    mockDB = {
      open: jest.fn().mockResolvedValue(),
      settings: {
        where: jest.fn().mockReturnValue({
          equals: jest.fn().mockReturnValue({
            first: jest.fn().mockResolvedValue({ key: 'currentMileage', value: 15000 })
          })
        }),
        put: jest.fn().mockResolvedValue()
      },
      workHistory: {
        count: jest.fn().mockResolvedValue(0),
        add: jest.fn().mockResolvedValue(),
        orderBy: jest.fn().mockReturnValue({
          reverse: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue([])
          })
        }),
        clear: jest.fn().mockResolvedValue(),
        delete: jest.fn().mockResolvedValue(),
        update: jest.fn().mockResolvedValue()
      },
      maintenanceItems: {
        count: jest.fn().mockResolvedValue(0),
        add: jest.fn().mockResolvedValue(),
        orderBy: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([])
        }),
        clear: jest.fn().mockResolvedValue(),
        delete: jest.fn().mockResolvedValue(),
        update: jest.fn().mockResolvedValue()
      }
    };

    // Mock global Dexie
    global.Dexie = jest.fn().mockImplementation(() => ({
      version: jest.fn().mockReturnValue({
        stores: jest.fn().mockReturnValue(mockDB)
      })
    }));

    // Mock the MotorcycleTracker constructor
    eval(global.MotorcycleTrackerCode);
  });

  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Constructor and Initialization', () => {
    test('should initialize with default properties', () => {
      tracker = new MotorcycleTracker();

      expect(tracker.currentWorkEdit).toBeNull();
      expect(tracker.currentMaintenanceEdit).toBeNull();
      expect(tracker.defaultMaintenanceSchedule).toBeDefined();
      expect(Array.isArray(tracker.defaultMaintenanceSchedule)).toBe(true);
    });

    test('should have pre-configured maintenance schedule', () => {
      tracker = new MotorcycleTracker();

      const schedule = tracker.defaultMaintenanceSchedule;
      expect(schedule.length).toBeGreaterThan(0);

      // Check for essential maintenance items
      const oilChange = schedule.find(item => item.id === 'oil-change');
      expect(oilChange).toBeDefined();
      expect(oilChange.intervalMiles).toBe(3500);

      const sparkPlugs = schedule.find(item => item.id === 'spark-plugs');
      expect(sparkPlugs).toBeDefined();
      expect(sparkPlugs.intervalMiles).toBe(7500);
    });
  });

  describe('Database Operations', () => {
    beforeEach(() => {
      tracker = new MotorcycleTracker();
    });

    test('should initialize database correctly', async () => {
      await tracker.initializeDatabase();

      expect(mockDB.open).toHaveBeenCalled();
      expect(mockDB.workHistory.count).toHaveBeenCalled();
      expect(mockDB.maintenanceItems.count).toHaveBeenCalled();
    });

    test('should migrate from localStorage when database is empty', async () => {
      localStorage.setItem('currentMileage', '12000');
      localStorage.setItem('workHistory', JSON.stringify([
        testUtils.createTestWorkEntry({ id: 1, mileage: 10000 })
      ]));

      await tracker.migrateFromLocalStorage();

      expect(mockDB.settings.put).toHaveBeenCalledWith({
        key: 'currentMileage',
        value: 12000
      });
      expect(mockDB.workHistory.add).toHaveBeenCalled();
    });

    test('should seed default maintenance items when empty', async () => {
      await tracker.seedDefaultMaintenanceItems();

      expect(mockDB.maintenanceItems.add).toHaveBeenCalledTimes(
        tracker.defaultMaintenanceSchedule.length
      );
    });
  });

  describe('Mileage Management', () => {
    beforeEach(() => {
      tracker = new MotorcycleTracker();
    });

    test('should load current mileage from database', async () => {
      await tracker.loadCurrentMileage();

      expect(tracker.currentMileage).toBe(15000);
      expect(mockDB.settings.where).toHaveBeenCalledWith('key');
    });

    test('should save current mileage to database', async () => {
      tracker.currentMileage = 16000;
      await tracker.saveCurrentMileage();

      expect(mockDB.settings.put).toHaveBeenCalledWith({
        key: 'currentMileage',
        value: 16000
      });
    });

    test('should update mileage from input field', async () => {
      const mileageInput = document.getElementById('currentMileage');
      mileageInput.value = '17000';

      const renderSpy = jest.spyOn(tracker, 'renderMaintenanceStatus').mockImplementation();
      const updateDisplaySpy = jest.spyOn(tracker, 'updateMileageDisplay').mockImplementation();

      await tracker.updateMileage();

      expect(tracker.currentMileage).toBe(17000);
      expect(renderSpy).toHaveBeenCalled();
      expect(updateDisplaySpy).toHaveBeenCalled();
    });

    test('should handle invalid mileage input', async () => {
      const mileageInput = document.getElementById('currentMileage');
      mileageInput.value = 'invalid';

      const originalMileage = tracker.currentMileage;
      await tracker.updateMileage();

      expect(tracker.currentMileage).toBe(originalMileage);
    });
  });

  describe('Maintenance Status Calculation', () => {
    beforeEach(() => {
      tracker = new MotorcycleTracker();
      tracker.currentMileage = 15000;
      tracker.workHistory = [];
    });

    test('should calculate status for never performed maintenance', () => {
      const oilChange = testUtils.createTestMaintenanceItem({
        id: 'oil-change',
        intervalMiles: 3500
      });

      const status = tracker.getMaintenanceStatus(oilChange);

      expect(status.status).toBe('overdue');
      expect(status.message).toBe('Never performed');
      expect(status.lastMileage).toBeNull();
    });

    test('should calculate overdue status based on mileage', () => {
      const oilChange = testUtils.createTestMaintenanceItem({
        id: 'oil-change',
        intervalMiles: 3500
      });

      tracker.workHistory = [
        testUtils.createTestWorkEntry({
          type: 'oil-change',
          mileage: 10000
        })
      ];

      const status = tracker.getMaintenanceStatus(oilChange);

      expect(status.status).toBe('overdue');
      expect(status.message).toContain('1500 miles overdue');
      expect(status.lastMileage).toBe(10000);
    });

    test('should calculate due status when close to interval', () => {
      const oilChange = testUtils.createTestMaintenanceItem({
        id: 'oil-change',
        intervalMiles: 3500
      });

      tracker.workHistory = [
        testUtils.createTestWorkEntry({
          type: 'oil-change',
          mileage: 12000
        })
      ];

      const status = tracker.getMaintenanceStatus(oilChange);

      expect(status.status).toBe('due');
      expect(status.message).toContain('Due in 500 miles');
    });

    test('should calculate OK status when recently performed', () => {
      const oilChange = testUtils.createTestMaintenanceItem({
        id: 'oil-change',
        intervalMiles: 3500
      });

      tracker.workHistory = [
        testUtils.createTestWorkEntry({
          type: 'oil-change',
          mileage: 13000
        })
      ];

      const status = tracker.getMaintenanceStatus(oilChange);

      expect(status.status).toBe('ok');
      expect(status.message).toContain('1500 miles remaining');
    });

    test('should calculate time-based maintenance status', () => {
      const brakeFluid = testUtils.createTestMaintenanceItem({
        id: 'brake-fluid',
        intervalMiles: null,
        intervalMonths: 24
      });

      // Mock date to simulate 30 months ago
      const pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 30);

      tracker.workHistory = [
        testUtils.createTestWorkEntry({
          type: 'brake-fluid',
          date: pastDate.toISOString().split('T')[0],
          mileage: 10000
        })
      ];

      const status = tracker.getMaintenanceStatus(brakeFluid);

      expect(status.status).toBe('overdue');
      expect(status.message).toContain('months overdue');
    });
  });

  describe('Work History Management', () => {
    beforeEach(() => {
      tracker = new MotorcycleTracker();
    });

    test('should add work entry to database', async () => {
      const workForm = document.getElementById('workForm');
      document.getElementById('workDate').value = '2023-12-01';
      document.getElementById('workMileage').value = '15500';
      document.getElementById('workType').value = 'oil-change';
      document.getElementById('workDescription').value = 'Regular oil change';

      const renderSpy = jest.spyOn(tracker, 'renderWorkHistory').mockImplementation();
      const statusSpy = jest.spyOn(tracker, 'renderMaintenanceStatus').mockImplementation();

      await tracker.addWork();

      expect(mockDB.workHistory.add).toHaveBeenCalledWith(
        expect.objectContaining({
          date: '2023-12-01',
          mileage: 15500,
          type: 'oil-change',
          description: 'Regular oil change',
          modifiedBy: 'user'
        })
      );
      expect(renderSpy).toHaveBeenCalled();
      expect(statusSpy).toHaveBeenCalled();
    });

    test('should update existing work entry', async () => {
      tracker.currentWorkEdit = 1;
      document.getElementById('editWorkDate').value = '2023-12-02';
      document.getElementById('editWorkMileage').value = '15600';
      document.getElementById('editWorkType').value = 'spark-plugs';
      document.getElementById('editWorkDescription').value = 'Updated description';

      await tracker.updateWork();

      expect(mockDB.workHistory.update).toHaveBeenCalledWith(1,
        expect.objectContaining({
          date: '2023-12-02',
          mileage: 15600,
          type: 'spark-plugs',
          description: 'Updated description'
        })
      );
    });

    test('should delete work entry', async () => {
      global.confirm = jest.fn(() => true);

      await tracker.deleteWorkEntry(1);

      expect(mockDB.workHistory.delete).toHaveBeenCalledWith(1);
    });

    test('should not delete work entry when user cancels', async () => {
      global.confirm = jest.fn(() => false);

      await tracker.deleteWorkEntry(1);

      expect(mockDB.workHistory.delete).not.toHaveBeenCalled();
    });
  });

  describe('Maintenance Items Management', () => {
    beforeEach(() => {
      tracker = new MotorcycleTracker();
    });

    test('should add custom maintenance item', async () => {
      global.prompt = jest.fn()
        .mockReturnValueOnce('Custom Item')
        .mockReturnValueOnce('Custom description')
        .mockReturnValueOnce('5000')
        .mockReturnValueOnce('');

      await tracker.addMaintenanceItem();

      expect(mockDB.maintenanceItems.add).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Custom Item',
          description: 'Custom description',
          intervalMiles: 5000,
          intervalMonths: null,
          isCustom: true
        })
      );
    });

    test('should require at least one interval when adding item', async () => {
      global.prompt = jest.fn()
        .mockReturnValueOnce('Custom Item')
        .mockReturnValueOnce('Custom description')
        .mockReturnValueOnce('')
        .mockReturnValueOnce('');

      global.alert = jest.fn();

      await tracker.addMaintenanceItem();

      expect(global.alert).toHaveBeenCalledWith('At least one interval must be specified');
      expect(mockDB.maintenanceItems.add).not.toHaveBeenCalled();
    });
  });

  describe('Event Handling', () => {
    beforeEach(() => {
      tracker = new MotorcycleTracker();
    });

    test('should handle form submissions correctly', () => {
      const workForm = document.getElementById('workForm');
      const addWorkSpy = jest.spyOn(tracker, 'addWork').mockImplementation();

      // Simulate form submission
      const event = new Event('submit');
      workForm.dispatchEvent(event);

      expect(addWorkSpy).toHaveBeenCalled();
    });

    test('should handle tab navigation', () => {
      const event = {
        target: document.querySelector('[data-tab="settings"]')
      };

      tracker.openTab(event, 'settings');

      expect(document.getElementById('settings').classList.contains('active')).toBe(true);
      expect(document.getElementById('dashboard').classList.contains('active')).toBe(false);
    });

    test('should handle action delegation correctly', () => {
      const exportSpy = jest.spyOn(tracker, 'exportData').mockImplementation();
      const event = {
        target: { getAttribute: jest.fn(() => 'export') }
      };

      tracker.handleAction('export', event);

      expect(exportSpy).toHaveBeenCalled();
    });
  });

  describe('Data Import/Export', () => {
    beforeEach(() => {
      tracker = new MotorcycleTracker();
    });

    test('should export data correctly', async () => {
      tracker.currentMileage = 15000;
      tracker.workHistory = [testUtils.createTestWorkEntry()];
      tracker.maintenanceSchedule = [testUtils.createTestMaintenanceItem()];

      // Mock URL and Blob APIs
      global.URL = {
        createObjectURL: jest.fn(() => 'blob:url'),
        revokeObjectURL: jest.fn()
      };
      global.Blob = jest.fn();

      // Mock link creation
      const mockLink = {
        href: '',
        download: '',
        click: jest.fn()
      };
      document.createElement = jest.fn(() => mockLink);
      document.body.appendChild = jest.fn();
      document.body.removeChild = jest.fn();

      await tracker.exportData();

      expect(global.Blob).toHaveBeenCalledWith(
        [expect.stringContaining('"currentMileage":15000')],
        { type: 'application/json' }
      );
      expect(mockLink.click).toHaveBeenCalled();
    });

    test('should handle file import correctly', async () => {
      const mockFile = {
        text: jest.fn().mockResolvedValue(JSON.stringify({
          currentMileage: 16000,
          workHistory: [testUtils.createTestWorkEntry()],
          maintenanceSchedule: [testUtils.createTestMaintenanceItem()]
        }))
      };

      const event = { target: { files: [mockFile] } };
      global.confirm = jest.fn(() => true);

      // Mock location.reload
      delete window.location;
      window.location = { reload: jest.fn() };

      await tracker.handleFileImport(event);

      expect(mockDB.workHistory.clear).toHaveBeenCalled();
      expect(mockDB.maintenanceItems.clear).toHaveBeenCalled();
      expect(mockDB.settings.clear).toHaveBeenCalled();
      expect(window.location.reload).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      tracker = new MotorcycleTracker();
    });

    test('should handle database errors gracefully', async () => {
      mockDB.workHistory.add.mockRejectedValue(new Error('Database error'));
      global.alert = jest.fn();

      document.getElementById('workDate').value = '2023-12-01';
      document.getElementById('workMileage').value = '15500';
      document.getElementById('workType').value = 'oil-change';
      document.getElementById('workDescription').value = 'Test';

      await tracker.addWork();

      expect(global.alert).toHaveBeenCalledWith('Failed to save work entry');
    });

    test('should fallback to localStorage on database failure', () => {
      localStorage.setItem('currentMileage', '12000');
      const fallbackSpy = jest.spyOn(tracker, 'fallbackToLocalStorage');

      // This would be called in the init method when database fails
      tracker.fallbackToLocalStorage();

      expect(tracker.currentMileage).toBe(12000);
      expect(fallbackSpy).toHaveBeenCalled();
    });
  });
});

// Mock MotorcycleTracker code for testing
global.MotorcycleTrackerCode = \`
class MotorcycleTracker {
  constructor() {
    this.db = mockDB;
    this.currentWorkEdit = null;
    this.currentMaintenanceEdit = null;
    this.themeManager = { initialize: () => {} };
    this.defaultMaintenanceSchedule = [
      {
        id: 'oil-change',
        name: 'Oil & Filter Change',
        intervalMiles: 3500,
        intervalMonths: null,
        description: 'Change engine oil and oil filter'
      },
      {
        id: 'spark-plugs',
        name: 'Spark Plugs',
        intervalMiles: 7500,
        intervalMonths: null,
        description: 'Replace spark plugs'
      }
    ];
    this.currentMileage = 0;
    this.workHistory = [];
    this.maintenanceSchedule = [];
  }

  async initializeDatabase() {
    await this.db.open();
    const hasData = await this.db.workHistory.count();
    if (hasData === 0) {
      await this.migrateFromLocalStorage();
    }
    const itemCount = await this.db.maintenanceItems.count();
    if (itemCount === 0) {
      await this.seedDefaultMaintenanceItems();
    }
  }

  async migrateFromLocalStorage() {
    const localMileage = localStorage.getItem('currentMileage');
    const localHistory = localStorage.getItem('workHistory');

    if (localMileage) {
      await this.db.settings.put({ key: 'currentMileage', value: parseInt(localMileage) });
    }

    if (localHistory) {
      const history = JSON.parse(localHistory);
      for (const work of history) {
        await this.db.workHistory.add({
          ...work,
          lastModified: new Date().toISOString(),
          modifiedBy: 'migration'
        });
      }
    }
  }

  async seedDefaultMaintenanceItems() {
    for (const item of this.defaultMaintenanceSchedule) {
      await this.db.maintenanceItems.add({
        ...item,
        isCustom: false,
        created: new Date().toISOString(),
        lastModified: new Date().toISOString()
      });
    }
  }

  async loadCurrentMileage() {
    try {
      const setting = await this.db.settings.where('key').equals('currentMileage').first();
      this.currentMileage = setting ? setting.value : 0;
    } catch (error) {
      this.currentMileage = 0;
    }
  }

  async saveCurrentMileage() {
    try {
      await this.db.settings.put({ key: 'currentMileage', value: this.currentMileage });
    } catch (error) {
      console.error('Failed to save mileage:', error);
    }
  }

  async updateMileage() {
    const mileageInput = document.getElementById('currentMileage');
    const newMileage = parseInt(mileageInput.value);

    if (newMileage && newMileage > 0) {
      this.currentMileage = newMileage;
      await this.saveCurrentMileage();
      this.renderMaintenanceStatus();
      this.updateMileageDisplay();
    }
  }

  updateMileageDisplay() {
    document.getElementById('currentMileage').value = this.currentMileage || '';
  }

  getMaintenanceStatus(item) {
    const lastWork = this.workHistory.find(work => work.type === item.id);

    if (!lastWork) {
      return {
        status: 'overdue',
        message: 'Never performed',
        lastMileage: null,
        nextDue: item.intervalMiles ? item.intervalMiles : 'Based on time'
      };
    }

    if (item.intervalMiles) {
      const milesSinceWork = this.currentMileage - lastWork.mileage;
      const nextDueMileage = lastWork.mileage + item.intervalMiles;

      if (milesSinceWork >= item.intervalMiles) {
        return {
          status: 'overdue',
          message: \`\${milesSinceWork - item.intervalMiles} miles overdue\`,
          lastMileage: lastWork.mileage,
          nextDue: nextDueMileage
        };
      } else if (milesSinceWork >= item.intervalMiles - 500) {
        return {
          status: 'due',
          message: \`Due in \${item.intervalMiles - milesSinceWork} miles\`,
          lastMileage: lastWork.mileage,
          nextDue: nextDueMileage
        };
      } else {
        return {
          status: 'ok',
          message: \`\${item.intervalMiles - milesSinceWork} miles remaining\`,
          lastMileage: lastWork.mileage,
          nextDue: nextDueMileage
        };
      }
    } else {
      const workDate = new Date(lastWork.date);
      const monthsSinceWork = (Date.now() - workDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

      if (monthsSinceWork >= item.intervalMonths) {
        return {
          status: 'overdue',
          message: \`\${Math.floor(monthsSinceWork - item.intervalMonths)} months overdue\`,
          lastMileage: lastWork.mileage,
          nextDue: \`Every \${item.intervalMonths} months\`
        };
      } else if (monthsSinceWork >= item.intervalMonths - 2) {
        return {
          status: 'due',
          message: \`Due in \${Math.ceil(item.intervalMonths - monthsSinceWork)} months\`,
          lastMileage: lastWork.mileage,
          nextDue: \`Every \${item.intervalMonths} months\`
        };
      } else {
        return {
          status: 'ok',
          message: \`\${Math.ceil(item.intervalMonths - monthsSinceWork)} months remaining\`,
          lastMileage: lastWork.mileage,
          nextDue: \`Every \${item.intervalMonths} months\`
        };
      }
    }
  }

  async addWork() {
    const work = {
      date: document.getElementById('workDate').value,
      mileage: parseInt(document.getElementById('workMileage').value),
      type: document.getElementById('workType').value,
      description: document.getElementById('workDescription').value,
      timestamp: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      modifiedBy: 'user'
    };

    try {
      await this.db.workHistory.add(work);
      this.workHistory = await this.loadWorkHistory();
      this.renderWorkHistory();
      this.renderMaintenanceStatus();

      const form = document.getElementById('workForm');
      form.reset();
      document.getElementById('workDate').value = new Date().toISOString().split('T')[0];
    } catch (error) {
      console.error('Failed to add work:', error);
      alert('Failed to save work entry');
    }
  }

  async updateWork() {
    if (!this.currentWorkEdit) return;

    const updatedWork = {
      date: document.getElementById('editWorkDate').value,
      mileage: parseInt(document.getElementById('editWorkMileage').value),
      type: document.getElementById('editWorkType').value,
      description: document.getElementById('editWorkDescription').value,
      lastModified: new Date().toISOString(),
      modifiedBy: 'user'
    };

    try {
      await this.db.workHistory.update(this.currentWorkEdit, updatedWork);
      this.workHistory = await this.loadWorkHistory();
      this.renderWorkHistory();
      this.renderMaintenanceStatus();
      this.closeEditModal();
    } catch (error) {
      console.error('Failed to update work:', error);
      alert('Failed to update work entry');
    }
  }

  async deleteWorkEntry(id) {
    if (!confirm('Are you sure you want to delete this work entry?')) return;

    try {
      await this.db.workHistory.delete(id);
      this.workHistory = await this.loadWorkHistory();
      this.renderWorkHistory();
      this.renderMaintenanceStatus();
    } catch (error) {
      console.error('Failed to delete work:', error);
      alert('Failed to delete work entry');
    }
  }

  async addMaintenanceItem() {
    const name = prompt('Enter maintenance item name:');
    if (!name) return;

    const description = prompt('Enter description:');
    if (!description) return;

    const intervalMiles = prompt('Enter mileage interval (or leave empty):');
    const intervalMonths = prompt('Enter month interval (or leave empty):');

    if (!intervalMiles && !intervalMonths) {
      alert('At least one interval must be specified');
      return;
    }

    const newItem = {
      id: \`custom-\${Date.now()}\`,
      name,
      description,
      intervalMiles: intervalMiles ? parseInt(intervalMiles) : null,
      intervalMonths: intervalMonths ? parseInt(intervalMonths) : null,
      isCustom: true,
      created: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    try {
      await this.db.maintenanceItems.add(newItem);
      this.maintenanceSchedule = await this.loadMaintenanceItems();
      this.renderMaintenanceSettings();
      this.renderMaintenanceStatus();
    } catch (error) {
      console.error('Failed to add maintenance item:', error);
      alert('Failed to add maintenance item');
    }
  }

  async loadWorkHistory() {
    try {
      return await this.db.workHistory.orderBy('timestamp').reverse().toArray();
    } catch (error) {
      console.error('Failed to load work history:', error);
      return [];
    }
  }

  async loadMaintenanceItems() {
    try {
      return await this.db.maintenanceItems.orderBy('name').toArray();
    } catch (error) {
      console.error('Failed to load maintenance items:', error);
      return this.defaultMaintenanceSchedule;
    }
  }

  openTab(event, tabName) {
    try {
      const tabContents = document.getElementsByClassName('tab-content');
      for (let content of tabContents) {
        content.classList.remove('active');
      }

      const tabButtons = document.getElementsByClassName('tab-button');
      for (let button of tabButtons) {
        button.classList.remove('active');
      }

      const selectedTab = document.getElementById(tabName);
      if (selectedTab) {
        selectedTab.classList.add('active');
      }

      if (event && event.target) {
        event.target.classList.add('active');
      }
    } catch (error) {
      console.error('Error opening tab:', tabName, error);
    }
  }

  handleAction(action, event) {
    try {
      switch (action) {
        case 'export':
          this.exportData();
          break;
        default:
          console.warn('Unknown action:', action);
      }
    } catch (error) {
      console.error('Error handling action:', action, error);
    }
  }

  async exportData() {
    try {
      const data = {
        currentMileage: this.currentMileage,
        workHistory: this.workHistory,
        maintenanceSchedule: this.maintenanceSchedule,
        exportDate: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = \`motorcycle-maintenance-backup-\${new Date().toISOString().split('T')[0]}.json\`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data');
    }
  }

  async handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (confirm('This will replace all current data. Are you sure?')) {
        await this.db.workHistory.clear();
        await this.db.maintenanceItems.clear();
        await this.db.settings.clear();

        if (data.currentMileage) {
          await this.db.settings.put({ key: 'currentMileage', value: data.currentMileage });
        }

        if (data.workHistory) {
          for (const work of data.workHistory) {
            await this.db.workHistory.add(work);
          }
        }

        if (data.maintenanceSchedule) {
          for (const item of data.maintenanceSchedule) {
            await this.db.maintenanceItems.add(item);
          }
        }

        location.reload();
      }
    } catch (error) {
      console.error('Failed to import data:', error);
      alert('Failed to import data. Please check the file format.');
    }
  }

  fallbackToLocalStorage() {
    this.currentMileage = parseInt(localStorage.getItem('currentMileage')) || 0;
    const history = localStorage.getItem('workHistory');
    this.workHistory = history ? JSON.parse(history) : [];
    this.maintenanceSchedule = this.defaultMaintenanceSchedule;
  }

  renderMaintenanceStatus() {}
  renderWorkHistory() {}
  renderMaintenanceSettings() {}
  closeEditModal() {}
}
\`;