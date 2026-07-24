# Ascendra Overview

Ascendra is a productivity and personal-growth web app designed to help users manage tasks, build habits, track goals, reflect through journaling, and stay organized in one place.

The project focuses on making productivity feel more motivating, visual, and personal. Instead of acting like a plain checklist app, Ascendra uses progress tracking, XP, levels, streaks, and achievements to make self-improvement feel more rewarding.

## Live Website

Ascendra is available through GitHub Pages:

https://jedicuber.github.io/Ascendra/

## Main Features

### Home Dashboard

The home page gives users a quick overview of their day.

It includes:

- A personalized greeting
- Today's progress
- Active tasks
- Upcoming calendar events
- Habit progress
- Quick navigation to the rest of the app

### To-Dos

The task system allows users to:

- Add tasks
- Set priorities
- Add estimated completion times
- Mark tasks as completed
- Undo completed tasks
- Delete tasks
- Filter tasks by active or completed status

Completed tasks are shown with a strikethrough, while active tasks remain clearly visible.

### Habits

The habits section helps users build routines and track consistency.

Features include:

- Creating habits
- Selecting habit schedules
- Marking habits complete
- Preventing off-schedule habits from being checked
- Tracking habit statistics
- Saving habit data locally

### Calendar

The calendar allows users to organize events and important dates.

Features include:

- Monthly calendar view
- Highlighting the current date
- Adding events
- Validating event dates
- Rejecting invalid or past events
- Displaying upcoming events on the dashboard
- Saving events in the browser

### Journal

The journal gives users a space to reflect on their day.

Users can record:

- Their mood
- How their day went
- What they are grateful for
- What they learned
- Personal reflections

The journal includes a calendar interface that allows users to select previous dates and review saved entries.

### Goals

The goals section is designed for larger achievements that take longer than normal tasks.

Goals may include:

- A title
- A description
- A target date
- Progress tracking
- Milestones
- Related tasks

### Alerts

The alerts section displays important reminders and updates related to tasks, habits, goals, and calendar events.

### Breathing

The breathing page provides a simple wellness tool to help users pause, reset, and manage stress.

### Menu

The menu provides access to additional Ascendra pages, including:

- Profile
- Statistics
- Settings
- Privacy
- Terms of Service
- About
- Credits
- Extras

### Profile and Statistics

The profile section displays user information and activity.

The statistics section tracks progress across Ascendra, including tasks, habits, and completed activities.

### Settings

The settings page includes:

- Dark mode
- Reset settings
- Delete all locally stored data

Dark mode changes the app's colors, cards, forms, navigation, popups, and background pattern for improved nighttime readability.

## Design

Ascendra uses a modern interface with:

- Purple accents
- Rounded cards
- Soft shadows
- Clear navigation
- Responsive layouts
- A custom hand-drawn background pattern
- Light and dark themes

The background pattern uses abstract lines, squares, curves, and dots. Its opacity is reduced so it adds personality without making the interface feel cluttered.

## Technology

Ascendra is built using:

- HTML
- CSS
- JavaScript
- GitHub Pages
- Browser localStorage

The project does not currently use a frontend framework.

## Single-Page App Structure

Ascendra works as a single-page application.

Navigation is handled through URL hash routes such as:

- `#/home`
- `#/todos`
- `#/habits`
- `#/calendar`
- `#/journal`
- `#/menu`

Pages are stored inside HTML templates and loaded dynamically with JavaScript.

## Local Storage

Ascendra stores user data inside the browser using `localStorage`.

This includes:

- Tasks
- Habits
- Calendar events
- Journal entries
- Settings
- Profile data
- Progress statistics

Because the data is stored locally:

- No server is required
- The app can load quickly
- User data stays on the device
- Data does not automatically sync between devices
- Clearing browser data may remove Ascendra data

## Accessibility

Accessibility improvements include:

- Clear form labels
- Keyboard-accessible search
- Better dialog controls
- Improved landmarks
- More readable color contrast
- Mobile-friendly layouts
- Accessible buttons and navigation

## Recent Improvements

Recent updates included:

- Completing dark mode across all major pages
- Fixing remaining white cards and forms
- Improving text contrast
- Fixing daily progress calculations
- Preventing future tasks from affecting today's progress
- Improving habit scheduling and statistics
- Rejecting invalid or past calendar events
- Fixing journal editing rules
- Improving profile statistics
- Fixing route loading
- Improving logout behavior
- Making search keyboard accessible
- Replacing the embedded favicon with `favicon.png`

## Current Status

Ascendra is a working public productivity web app.

The main systems are functional, including:

- Navigation
- Tasks
- Habits
- Calendar
- Journal
- Settings
- Dark mode
- Local data saving
- Profile statistics
- Responsive design

Some advanced features are still planned.

## Planned Features

Possible future improvements include:

- Secure user accounts
- Cloud syncing
- Notifications
- Recurring tasks
- Advanced habit streaks
- More detailed statistics
- Achievements
- XP rewards
- Goal milestones
- Search improvements
- Installable Progressive Web App support
- Cross-device syncing
- More customization options

## Project Goal

Ascendra's goal is to help users organize their responsibilities while also supporting personal growth, reflection, and healthy routines.

The app is built around the idea that progress does not have to be perfect. Small actions, repeated consistently, can help users keep climbing.
