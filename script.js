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
        document.getElementById('workForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addWork();
        });

        document.getElementById('editWorkForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateWork();
        });

        document.getElementById('editMaintenanceForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateMaintenanceItem();
        });

        document.getElementById('currentMileage').addEventListener('input', (e) => {
            if (e.target.value) {
                document.querySelector('.current-mileage button').style.display = 'block';
            }
        });
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
                            <button onclick="editWork(${work.id})" class="edit-btn">Edit</button>
                            <button onclick="deleteWorkEntry(${work.id})" class="delete-btn">Delete</button>
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

        if (this.maintenanceSchedule.length === 0) {
            container.innerHTML = '<div class="empty-state">No maintenance items configured.</div>';
            return;
        }

        container.innerHTML = this.maintenanceSchedule.map(item => {
            return `
                <div class="maintenance-setting-item">
                    <div class="maintenance-setting-info">
                        <h4>${item.name}</h4>
                        <p>${item.description}</p>
                        <p><strong>Interval:</strong> ${item.intervalMiles ? item.intervalMiles + ' miles' : ''}${item.intervalMiles && item.intervalMonths ? ' or ' : ''}${item.intervalMonths ? item.intervalMonths + ' months' : ''}</p>
                    </div>
                    <div class="maintenance-setting-actions">
                        <button onclick="editMaintenanceItem(${item.id})" class="edit-btn">Edit</button>
                        ${item.isCustom ? `<button onclick="deleteMaintenanceItemConfirm(${item.id})" class="delete-btn">Delete</button>` : ''}
                    </div>
                </div>
            `;
        }).join('');
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

function openTab(evt, tabName) {
    const tabContents = document.getElementsByClassName('tab-content');
    const tabButtons = document.getElementsByClassName('tab-button');

    for (let content of tabContents) {
        content.classList.remove('active');
    }

    for (let button of tabButtons) {
        button.classList.remove('active');
    }

    document.getElementById(tabName).classList.add('active');
    evt.currentTarget.classList.add('active');
}

async function updateMileage() {
    await tracker.updateMileage();
}

// Global functions for HTML onclick events
async function editWork(id) {
    const work = tracker.workHistory.find(w => w.id === id);
    if (!work) return;

    tracker.currentWorkEdit = id;
    document.getElementById('editWorkDate').value = work.date;
    document.getElementById('editWorkMileage').value = work.mileage;
    document.getElementById('editWorkType').value = work.type;
    document.getElementById('editWorkDescription').value = work.description;
    document.getElementById('editWorkModal').style.display = 'block';
}

async function deleteWorkEntry(id) {
    await tracker.deleteWorkEntry(id);
}

async function deleteWork() {
    if (tracker.currentWorkEdit) {
        await tracker.deleteWorkEntry(tracker.currentWorkEdit);
        tracker.closeEditModal();
    }
}

function closeEditModal() {
    tracker.closeEditModal();
}

async function editMaintenanceItem(id) {
    const item = tracker.maintenanceSchedule.find(i => i.id === id);
    if (!item) return;

    tracker.currentMaintenanceEdit = id;
    document.getElementById('editMaintenanceName').value = item.name;
    document.getElementById('editMaintenanceDescription').value = item.description;
    document.getElementById('editMaintenanceIntervalMiles').value = item.intervalMiles || '';
    document.getElementById('editMaintenanceIntervalMonths').value = item.intervalMonths || '';
    document.getElementById('editMaintenanceModal').style.display = 'block';
}

async function deleteMaintenanceItem() {
    if (tracker.currentMaintenanceEdit) {
        await tracker.deleteMaintenanceItemConfirm(tracker.currentMaintenanceEdit);
        tracker.closeMaintenanceModal();
    }
}

function closeMaintenanceModal() {
    tracker.closeMaintenanceModal();
}

async function addMaintenanceItem() {
    await tracker.addMaintenanceItem();
}

async function exportData() {
    await tracker.exportData();
}

function importData() {
    document.getElementById('importFile').click();
}

async function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const text = await file.text();
        const data = JSON.parse(text);

        if (confirm('This will replace all current data. Are you sure?')) {
            // Clear existing data
            await tracker.db.workHistory.clear();
            await tracker.db.maintenanceItems.clear();
            await tracker.db.settings.clear();

            // Import new data
            if (data.currentMileage) {
                await tracker.db.settings.put({ key: 'currentMileage', value: data.currentMileage });
            }

            if (data.workHistory) {
                for (const work of data.workHistory) {
                    await tracker.db.workHistory.add(work);
                }
            }

            if (data.maintenanceSchedule) {
                for (const item of data.maintenanceSchedule) {
                    await tracker.db.maintenanceItems.add(item);
                }
            }

            // Reload the app
            location.reload();
        }
    } catch (error) {
        console.error('Failed to import data:', error);
        alert('Failed to import data. Please check the file format.');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    window.tracker = new MotorcycleTracker();

    document.getElementById('workDate').value = new Date().toISOString().split('T')[0];
});