class MotorcycleTracker {
    constructor() {
        this.maintenanceSchedule = [
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

        this.currentMileage = this.loadCurrentMileage();
        this.workHistory = this.loadWorkHistory();

        this.init();
    }

    init() {
        this.updateMileageDisplay();
        this.renderMaintenanceStatus();
        this.renderWorkHistory();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('workForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addWork();
        });

        document.getElementById('currentMileage').addEventListener('input', (e) => {
            if (e.target.value) {
                document.querySelector('.current-mileage button').style.display = 'block';
            }
        });
    }

    updateMileage() {
        const mileageInput = document.getElementById('currentMileage');
        const newMileage = parseInt(mileageInput.value);

        if (newMileage && newMileage > 0) {
            this.currentMileage = newMileage;
            this.saveCurrentMileage();
            this.renderMaintenanceStatus();
            this.updateMileageDisplay();
        }
    }

    updateMileageDisplay() {
        document.getElementById('currentMileage').value = this.currentMileage || '';
    }

    addWork() {
        const form = document.getElementById('workForm');
        const formData = new FormData(form);

        const work = {
            id: Date.now(),
            date: document.getElementById('workDate').value,
            mileage: parseInt(document.getElementById('workMileage').value),
            type: document.getElementById('workType').value,
            description: document.getElementById('workDescription').value,
            timestamp: new Date().toISOString()
        };

        this.workHistory.unshift(work);
        this.saveWorkHistory();
        this.renderWorkHistory();
        this.renderMaintenanceStatus();

        form.reset();
        document.getElementById('workDate').value = new Date().toISOString().split('T')[0];
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
                    <h4>${typeName}</h4>
                    <div class="work-meta">
                        <span><strong>Date:</strong> ${new Date(work.date).toLocaleDateString()}</span>
                        <span><strong>Mileage:</strong> ${work.mileage.toLocaleString()} miles</span>
                    </div>
                    <div class="work-description">${work.description}</div>
                </div>
            `;
        }).join('');
    }

    loadCurrentMileage() {
        return parseInt(localStorage.getItem('currentMileage')) || 0;
    }

    saveCurrentMileage() {
        localStorage.setItem('currentMileage', this.currentMileage.toString());
    }

    loadWorkHistory() {
        const history = localStorage.getItem('workHistory');
        return history ? JSON.parse(history) : [];
    }

    saveWorkHistory() {
        localStorage.setItem('workHistory', JSON.stringify(this.workHistory));
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

function updateMileage() {
    tracker.updateMileage();
}

document.addEventListener('DOMContentLoaded', function() {
    window.tracker = new MotorcycleTracker();

    document.getElementById('workDate').value = new Date().toISOString().split('T')[0];
});