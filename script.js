// Enhanced Theme Management System with System Preference Detection
class ThemeManager {
    constructor() {
        this.themes = {
            light: {
                name: 'Light Mode',
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
                }
            },
            dark: {
                name: 'Dark Mode',
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
                }
            }
        };

        this.themePreference = this.loadThemePreference();
        this.systemMediaQuery = this.safeMatchMedia('(prefers-color-scheme: dark)');
        this.currentTheme = this.determineTheme();
        this.initialize();
    }

    safeMatchMedia(query) {
        // Fallback for browsers that don't support matchMedia
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

        // Delay DOM-dependent operations until DOM is ready
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

    setupSystemThemeListener() {
        // Listen for system theme changes
        this.systemMediaQuery.addEventListener('change', (e) => {
            if (this.themePreference === 'system') {
                const newTheme = e.matches ? 'dark' : 'light';
                this.applyTheme(newTheme);
                this.updateThemeControls();
            }
        });
    }

    setupThemeControls() {
        // Setup theme toggle button
        const themeToggle = document.getElementById('themeToggle');
        const themePreferenceSelect = document.getElementById('themePreference');

        if (themeToggle) {
            // Set initial ARIA state
            themeToggle.setAttribute('aria-checked', this.currentTheme === 'dark' ? 'true' : 'false');

            // Update label
            const label = themeToggle.querySelector('.theme-label');
            if (label) {
                label.textContent = this.currentTheme === 'dark' ? 'Dark Mode' : 'Light Mode';
            }

            // Add keyboard support
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
                this.updateThemeControls();
            });

            // Enhanced keyboard navigation
            themeToggle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleTheme();
                    this.updateThemeControls();
                }
            });
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
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const isDark = this.currentTheme === 'dark';
            themeToggle.setAttribute('aria-checked', isDark ? 'true' : 'false');

            const label = themeToggle.querySelector('.theme-label');
            if (label) {
                label.textContent = isDark ? 'Dark Mode' : 'Light Mode';
            }

            // Announce theme change to screen readers
            this.announceThemeChange(isDark ? 'Dark mode activated' : 'Light mode activated');
        }
    }

    announceThemeChange(message) {
        // Create a temporary ARIA live region for announcements
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.style.position = 'absolute';
        announcement.style.left = '-10000px';
        announcement.style.width = '1px';
        announcement.style.height = '1px';
        announcement.style.overflow = 'hidden';
        announcement.textContent = message;

        document.body.appendChild(announcement);

        // Remove after announcement
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    applyTheme(themeName) {
        if (!this.themes[themeName]) {
            console.warn(`Theme "${themeName}" not found, falling back to light theme`);
            themeName = 'light';
        }

        const theme = this.themes[themeName];
        const root = document.documentElement;

        // Apply all theme properties
        Object.entries(theme.properties).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });

        // Update body class for theme-specific styling
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        document.body.classList.add(`theme-${themeName}`);

        this.currentTheme = themeName;

        // Dispatch theme change event
        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme: themeName, properties: theme.properties }
        }));
    }

    switchTheme(themeName) {
        if (themeName === this.currentTheme) return;

        // Add transition class for smooth switching
        document.body.classList.add('theme-transitioning');

        setTimeout(() => {
            this.applyTheme(themeName);

            // Remove transition class after animation
            setTimeout(() => {
                document.body.classList.remove('theme-transitioning');
            }, 300);
        }, 50);
    }

    toggleTheme() {
        const nextTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        // When manually toggling, save the explicit preference
        this.saveThemePreference(nextTheme);
        this.switchTheme(nextTheme);
    }

    addTransitionClasses() {
        // Add CSS for smooth transitions
        const style = document.createElement('style');
        style.textContent = `
            .theme-transitioning * {
                transition: background-color var(--transition-normal),
                           color var(--transition-normal),
                           border-color var(--transition-normal),
                           box-shadow var(--transition-normal) !important;
            }
        `;
        document.head.appendChild(style);
    }

    getCurrentTheme() {
        return this.currentTheme;
    }

    getThemeList() {
        return Object.keys(this.themes).map(key => ({
            key,
            name: this.themes[key].name
        }));
    }
}

// Database setup
const db = new Dexie('MotorcycleTrackerDB');
db.version(1).stores({
    settings: '++id, key, value',
    workHistory: '++id, date, mileage, type, description, timestamp, lastModified, modifiedBy',
    maintenanceItems: '++id, name, description, intervalMiles, intervalMonths, isCustom, created, lastModified'
});

class MotorcycleTracker {
    constructor() {
        this.db = db;
        this.currentWorkEdit = null;
        this.currentMaintenanceEdit = null;
        this.themeManager = new ThemeManager();
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
                description: 'Replace spark plugs (NGK DPR7EA-9)'
            },
            {
                id: 'valve-adjustment',
                name: 'Valve Adjustment',
                intervalMiles: 7500,
                intervalMonths: null,
                description: 'Check and adjust valve clearance'
            },
            {
                id: 'air-filter',
                name: 'Air Filter',
                intervalMiles: 15000,
                intervalMonths: null,
                description: 'Replace air filter element'
            },
            {
                id: 'brake-fluid',
                name: 'Brake Fluid',
                intervalMiles: null,
                intervalMonths: 24,
                description: 'Replace brake fluid and inspect brake lines'
            },
            {
                id: 'coolant',
                name: 'Coolant',
                intervalMiles: null,
                intervalMonths: 24,
                description: 'Replace engine coolant'
            },
            {
                id: 'final-drive',
                name: 'Final Drive Oil',
                intervalMiles: null,
                intervalMonths: 24,
                description: 'Change final drive gear oil'
            }
        ];

        this.init();
    }

    async init() {
        try {
            await this.initializeDatabase();
            await this.loadCurrentMileage();
            this.maintenanceSchedule = await this.loadMaintenanceItems();
            this.workHistory = await this.loadWorkHistory();

            this.updateMileageDisplay();
            this.renderMaintenanceStatus();
            this.renderWorkHistory();
            this.renderMaintenanceSettings();
            this.setupEventListeners();
        } catch (error) {
            console.error('Failed to initialize database:', error);
            this.fallbackToLocalStorage();
        }
    }

    async initializeDatabase() {
        await this.db.open();

        // Check if we need to migrate from localStorage
        const hasData = await this.db.workHistory.count();
        if (hasData === 0) {
            await this.migrateFromLocalStorage();
        }

        // Ensure default maintenance items exist
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

    fallbackToLocalStorage() {
        this.currentMileage = parseInt(localStorage.getItem('currentMileage')) || 0;
        const history = localStorage.getItem('workHistory');
        this.workHistory = history ? JSON.parse(history) : [];
        this.maintenanceSchedule = this.defaultMaintenanceSchedule;

        this.updateMileageDisplay();
        this.renderMaintenanceStatus();
        this.renderWorkHistory();
        this.renderMaintenanceSettings();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Form submissions
        const workForm = document.getElementById('workForm');
        if (workForm) {
            workForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addWork();
            });
        }

        const editWorkForm = document.getElementById('editWorkForm');
        if (editWorkForm) {
            editWorkForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateWork();
            });
        }

        const editMaintenanceForm = document.getElementById('editMaintenanceForm');
        if (editMaintenanceForm) {
            editMaintenanceForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateMaintenanceItem();
            });
        }

        // Mileage input
        const currentMileageInput = document.getElementById('currentMileage');
        if (currentMileageInput) {
            currentMileageInput.addEventListener('input', (e) => {
                const updateBtn = document.getElementById('updateMileageBtn');
                if (updateBtn) {
                    updateBtn.style.display = e.target.value ? 'block' : 'none';
                }
            });
        }

        // Update mileage button
        const updateMileageBtn = document.getElementById('updateMileageBtn');
        if (updateMileageBtn) {
            updateMileageBtn.addEventListener('click', () => {
                this.updateMileage();
            });
        }

        // Tab navigation using event delegation
        const tabContainer = document.querySelector('.tabs');
        if (tabContainer) {
            tabContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('tab-button')) {
                    const tabName = e.target.getAttribute('data-tab');
                    if (tabName) {
                        this.openTab(e, tabName);
                    }
                }
            });
        }

        // File import
        const importFile = document.getElementById('importFile');
        if (importFile) {
            importFile.addEventListener('change', (e) => {
                this.handleFileImport(e);
            });
        }

        // Global click handler for data-action buttons
        document.addEventListener('click', (e) => {
            const action = e.target.getAttribute('data-action');
            if (action) {
                this.handleAction(action, e);
            }
        });
    }

    handleAction(action, event) {
        try {
            const target = event.target;
            const workId = target.getAttribute('data-work-id');
            const itemId = target.getAttribute('data-item-id');

            switch (action) {
                case 'export':
                    this.exportData();
                    break;
                case 'import':
                    this.importData();
                    break;
                case 'add-maintenance':
                    this.addMaintenanceItem();
                    break;
                case 'close-edit-modal':
                    this.closeEditModal();
                    break;
                case 'close-maintenance-modal':
                    this.closeMaintenanceModal();
                    break;
                case 'delete-work':
                    this.deleteWork();
                    break;
                case 'delete-maintenance':
                    this.deleteMaintenanceItem();
                    break;
                case 'edit-work':
                    if (workId) this.editWork(parseInt(workId));
                    break;
                case 'delete-work-entry':
                    if (workId) this.deleteWorkEntry(parseInt(workId));
                    break;
                case 'edit-maintenance-item':
                    if (itemId) this.editMaintenanceItem(itemId);
                    break;
                case 'delete-maintenance-item':
                    if (itemId) this.deleteMaintenanceItemConfirm(itemId);
                    break;
                default:
                    console.warn('Unknown action:', action);
            }
        } catch (error) {
            console.error('Error handling action:', action, error);
        }
    }

    openTab(event, tabName) {
        try {
            // Hide all tab contents
            const tabContents = document.getElementsByClassName('tab-content');
            for (let content of tabContents) {
                content.classList.remove('active');
            }

            // Remove active class from all tab buttons
            const tabButtons = document.getElementsByClassName('tab-button');
            for (let button of tabButtons) {
                button.classList.remove('active');
            }

            // Show selected tab content
            const selectedTab = document.getElementById(tabName);
            if (selectedTab) {
                selectedTab.classList.add('active');
            }

            // Add active class to clicked button
            if (event && event.target) {
                event.target.classList.add('active');
            }
        } catch (error) {
            console.error('Error opening tab:', tabName, error);
        }
    }

    importData() {
        const importFile = document.getElementById('importFile');
        if (importFile) {
            importFile.click();
        }
    }

    editWork(id) {
        try {
            const work = this.workHistory.find(w => w.id === id);
            if (!work) {
                console.error('Work entry not found:', id);
                alert('Work entry not found');
                return;
            }

            this.currentWorkEdit = id;
            document.getElementById('editWorkDate').value = work.date;
            document.getElementById('editWorkMileage').value = work.mileage;
            document.getElementById('editWorkType').value = work.type;
            document.getElementById('editWorkDescription').value = work.description;
            document.getElementById('editWorkModal').style.display = 'block';
        } catch (error) {
            console.error('Failed to edit work entry:', error);
            alert('Failed to open work entry editor');
        }
    }

    editMaintenanceItem(id) {
        try {
            const item = this.maintenanceSchedule.find(i =>
                String(i.id) === String(id) || i.id === id
            );
            if (!item) {
                console.error('Maintenance item not found:', id);
                alert('Maintenance item not found');
                return;
            }

            this.currentMaintenanceEdit = id;
            document.getElementById('editMaintenanceName').value = item.name;
            document.getElementById('editMaintenanceDescription').value = item.description;
            document.getElementById('editMaintenanceIntervalMiles').value = item.intervalMiles || '';
            document.getElementById('editMaintenanceIntervalMonths').value = item.intervalMonths || '';
            document.getElementById('editMaintenanceModal').style.display = 'block';
        } catch (error) {
            console.error('Failed to edit maintenance item:', error);
            alert('Failed to open maintenance item editor');
        }
    }

    deleteMaintenanceItemConfirm(id) {
        if (!confirm('Are you sure you want to delete this maintenance item?')) return;

        this.deleteMaintenanceItemById(id);
    }

    async deleteMaintenanceItemById(id) {
        try {
            await this.db.maintenanceItems.delete(id);
            this.maintenanceSchedule = await this.loadMaintenanceItems();
            this.renderMaintenanceSettings();
            this.renderMaintenanceStatus();
        } catch (error) {
            console.error('Failed to delete maintenance item:', error);
            alert('Failed to delete maintenance item');
        }
    }

    handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const text = e.target.result;
                const data = JSON.parse(text);

                if (confirm('This will replace all current data. Are you sure?')) {
                    // Clear existing data
                    await this.db.workHistory.clear();
                    await this.db.maintenanceItems.clear();
                    await this.db.settings.clear();

                    // Import new data
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

                    // Reload the app
                    location.reload();
                }
            } catch (error) {
                console.error('Failed to import data:', error);
                alert('Failed to import data. Please check the file format.');
            }
        };
        reader.readAsText(file);
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
                    message: `${milesSinceWork - item.intervalMiles} miles overdue`,
                    lastMileage: lastWork.mileage,
                    nextDue: nextDueMileage
                };
            } else if (milesSinceWork >= item.intervalMiles - 500) {
                return {
                    status: 'due',
                    message: `Due in ${item.intervalMiles - milesSinceWork} miles`,
                    lastMileage: lastWork.mileage,
                    nextDue: nextDueMileage
                };
            } else {
                return {
                    status: 'ok',
                    message: `${item.intervalMiles - milesSinceWork} miles remaining`,
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
                    message: `${Math.floor(monthsSinceWork - item.intervalMonths)} months overdue`,
                    lastMileage: lastWork.mileage,
                    nextDue: `Every ${item.intervalMonths} months`
                };
            } else if (monthsSinceWork >= item.intervalMonths - 2) {
                return {
                    status: 'due',
                    message: `Due in ${Math.ceil(item.intervalMonths - monthsSinceWork)} months`,
                    lastMileage: lastWork.mileage,
                    nextDue: `Every ${item.intervalMonths} months`
                };
            } else {
                return {
                    status: 'ok',
                    message: `${Math.ceil(item.intervalMonths - monthsSinceWork)} months remaining`,
                    lastMileage: lastWork.mileage,
                    nextDue: `Every ${item.intervalMonths} months`
                };
            }
        }
    }

    renderMaintenanceStatus() {
        const container = document.getElementById('maintenanceStatus');

        if (!this.currentMileage) {
            container.innerHTML = '<div class="empty-state">Please set your current mileage to see maintenance status.</div>';
            return;
        }

        container.innerHTML = this.maintenanceSchedule.map(item => {
            const status = this.getMaintenanceStatus(item);
            return `
                <div class="maintenance-item ${status.status}">
                    <div class="maintenance-info">
                        <h3>${item.name}</h3>
                        <p>${item.description}</p>
                        <p><strong>Interval:</strong> ${item.intervalMiles ? item.intervalMiles + ' miles' : item.intervalMonths + ' months'}</p>
                        ${status.lastMileage ? `<p><strong>Last done at:</strong> ${status.lastMileage} miles</p>` : ''}
                    </div>
                    <div class="maintenance-status status-${status.status}">
                        ${status.message}
                    </div>
                </div>
            `;
        }).join('');
    }

    renderWorkHistory() {
        const container = document.getElementById('workHistory');

        if (this.workHistory.length === 0) {
            container.innerHTML = '<div class="empty-state">No work history recorded yet.</div>';
            return;
        }

        container.innerHTML = this.workHistory.map(work => {
            const workType = this.maintenanceSchedule.find(item => item.id === work.type);
            const typeName = workType ? workType.name : work.type;

            return `
                <div class="work-entry">
                    <div class="work-header">
                        <h4>${typeName}</h4>
                        <div class="work-actions">
                            <button class="edit-btn" data-action="edit-work" data-work-id="${work.id}">Edit</button>
                            <button class="delete-btn" data-action="delete-work-entry" data-work-id="${work.id}">Delete</button>
                        </div>
                    </div>
                    <div class="work-meta">
                        <span><strong>Date:</strong> ${new Date(work.date).toLocaleDateString()}</span>
                        <span><strong>Mileage:</strong> ${work.mileage.toLocaleString()} miles</span>
                    </div>
                    <div class="work-description">${work.description}</div>
                    ${work.lastModified ? `<div class="work-modified">Last modified: ${new Date(work.lastModified).toLocaleDateString()}</div>` : ''}
                </div>
            `;
        }).join('');
    }

    async loadCurrentMileage() {
        try {
            const setting = await this.db.settings.where('key').equals('currentMileage').first();
            this.currentMileage = setting ? setting.value : 0;
        } catch (error) {
            console.error('Failed to load mileage:', error);
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

    renderMaintenanceSettings() {
        const container = document.getElementById('maintenanceSettings');

        // Add theme toggle section first
        const themeToggleHtml = `
            <div class="theme-toggle-section">
                <h4>Theme Settings</h4>
                <p class="theme-description">Choose between light and dark mode for the best viewing experience</p>
                <div class="theme-toggle-wrapper">
                    <span class="theme-label">Light</span>
                    <label class="theme-toggle">
                        <input type="checkbox" id="themeToggle" ${this.themeManager.getCurrentTheme() === 'dark' ? 'checked' : ''} onchange="toggleTheme()">
                        <span class="theme-slider"></span>
                    </label>
                    <span class="theme-label">Dark</span>
                </div>
            </div>
        `;

        if (this.maintenanceSchedule.length === 0) {
            container.innerHTML = themeToggleHtml + '<div class="empty-state">No maintenance items configured.</div>';
            return;
        }

        const maintenanceItemsHtml = this.maintenanceSchedule.map(item => {
            return `
                <div class="maintenance-setting-item">
                    <div class="maintenance-setting-info">
                        <h4>${item.name}</h4>
                        <p>${item.description}</p>
                        <p><strong>Interval:</strong> ${item.intervalMiles ? item.intervalMiles + ' miles' : ''}${item.intervalMiles && item.intervalMonths ? ' or ' : ''}${item.intervalMonths ? item.intervalMonths + ' months' : ''}</p>
                    </div>
                    <div class="maintenance-setting-actions">
                        <button class="edit-btn" data-action="edit-maintenance-item" data-item-id="${item.id}">Edit</button>
                        ${item.isCustom ? `<button class="delete-btn" data-action="delete-maintenance-item" data-item-id="${item.id}">Delete</button>` : ''}
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = themeToggleHtml + maintenanceItemsHtml;
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

    async updateMaintenanceItem() {
        if (!this.currentMaintenanceEdit) return;

        const updatedItem = {
            name: document.getElementById('editMaintenanceName').value,
            description: document.getElementById('editMaintenanceDescription').value,
            intervalMiles: parseInt(document.getElementById('editMaintenanceIntervalMiles').value) || null,
            intervalMonths: parseInt(document.getElementById('editMaintenanceIntervalMonths').value) || null,
            lastModified: new Date().toISOString()
        };

        try {
            await this.db.maintenanceItems.update(this.currentMaintenanceEdit, updatedItem);
            this.maintenanceSchedule = await this.loadMaintenanceItems();
            this.renderMaintenanceSettings();
            this.renderMaintenanceStatus();
            this.closeMaintenanceModal();
        } catch (error) {
            console.error('Failed to update maintenance item:', error);
            alert('Failed to update maintenance item');
        }
    }

    async deleteMaintenanceItemConfirm(id) {
        if (!confirm('Are you sure you want to delete this maintenance item?')) return;

        try {
            await this.db.maintenanceItems.delete(id);
            this.maintenanceSchedule = await this.loadMaintenanceItems();
            this.renderMaintenanceSettings();
            this.renderMaintenanceStatus();
        } catch (error) {
            console.error('Failed to delete maintenance item:', error);
            alert('Failed to delete maintenance item');
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
            id: `custom-${Date.now()}`,
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

    closeEditModal() {
        document.getElementById('editWorkModal').style.display = 'none';
        this.currentWorkEdit = null;
    }

    closeMaintenanceModal() {
        document.getElementById('editMaintenanceModal').style.display = 'none';
        this.currentMaintenanceEdit = null;
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
            a.download = `motorcycle-maintenance-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to export data:', error);
            alert('Failed to export data');
        }
    }
}

// Legacy support for any remaining global function calls
// These should not be needed after the event handler refactoring

document.addEventListener('DOMContentLoaded', function() {
    window.tracker = new MotorcycleTracker();

    document.getElementById('workDate').value = new Date().toISOString().split('T')[0];
});