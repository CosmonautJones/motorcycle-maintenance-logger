# Motorcycle Maintenance Tracker

A simple web application to track maintenance work and schedules for your 2001 Suzuki Intruder Volusia 800.

## Features

- **Maintenance Dashboard**: View current status of all maintenance items
- **Work History**: Track all completed maintenance work
- **Add Work**: Record new maintenance work with date, mileage, and description
- **Local Storage**: Data persists in your browser
- **Mobile Responsive**: Works on desktop and mobile devices

## Pre-configured Maintenance Schedule

Based on the 2001 Suzuki VL800 Volusia service manual:

- **Oil & Filter Change**: Every 3,500 miles
- **Spark Plugs**: Every 7,500 miles (NGK DPR7EA-9)
- **Valve Adjustment**: Every 7,500 miles
- **Air Filter**: Every 15,000 miles
- **Brake Fluid**: Every 2 years
- **Coolant**: Every 2 years
- **Final Drive Oil**: Every 2 years

## Getting Started

1. Open `index.html` in your web browser
2. Set your current mileage
3. Start tracking your maintenance work

## Usage

1. **Set Current Mileage**: Enter your bike's current mileage at the top of the page
2. **View Dashboard**: See which maintenance items are due, overdue, or OK
3. **Add Work**: Record completed maintenance in the "Add Work" tab
4. **Review History**: Check your maintenance history in the "Maintenance Log" tab

## Technology

- Pure HTML, CSS, and JavaScript
- No external dependencies
- Uses browser LocalStorage for data persistence

## File Structure

```
/
├── index.html      # Main application interface
├── style.css       # Styling and responsive design
├── script.js       # Application logic and data handling
├── README.md       # This file
└── CLAUDE.md       # Development instructions
```