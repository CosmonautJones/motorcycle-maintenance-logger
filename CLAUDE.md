# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Web-based motorcycle maintenance tracker for a 2001 Suzuki Intruder Volusia 800. Built with vanilla HTML, CSS, and JavaScript with no external dependencies.

## Development Commands
This is a static web application - simply open `index.html` in a browser to run.

For development:
- Open `index.html` in browser to test changes
- Use browser developer tools for debugging
- Data persists in browser LocalStorage

## Architecture
- **index.html**: Main application interface with tabs for dashboard, work history, and adding work
- **style.css**: Responsive CSS with mobile-first design, uses CSS Grid and Flexbox
- **script.js**: Main application logic in `MotorcycleTracker` class
  - Maintenance schedule pre-configured for 2001 Suzuki VL800 Volusia
  - LocalStorage persistence for current mileage and work history
  - Status calculation based on mileage/time intervals

## Key Components
- **MotorcycleTracker class**: Main application controller
- **maintenanceSchedule array**: Pre-configured maintenance items with intervals
- **Local Storage**: Saves `currentMileage` and `workHistory` arrays
- **Status calculation**: Compares current mileage/date against last work done

## Maintenance Schedule (Pre-configured)
- Oil & Filter: Every 3,500 miles
- Spark Plugs: Every 7,500 miles
- Valve Adjustment: Every 7,500 miles
- Air Filter: Every 15,000 miles
- Brake/Coolant/Final Drive: Every 2 years