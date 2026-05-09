<div align="center">

<img src="docs/screenshots/logo.png" width="100" alt="GlucoseGoose Logo" />

# GlucoseGoose 

**Real-time CGM diabetes management**

[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)

</div>


## Overview

GlucoseGoose connects to a [Nightscout](https://nightscout.github.io/) CGM server to display real-time glucose readings, log meals and activities, analyze long-term trends, and send smart glucose alerts. Built as a personal project for real daily use.

## Features

**Real-time Glucose Monitoring**
- Live SGV readings with color-coded range indicators and trend arrows
- Custom SVG glucose chart with scrollable time windows (2h / 12h / 24h)
- Event overlays on the chart: meals, activities, insulin — tap any to see details
- Smart alerts: low, high, urgent low, rapid drop, stale data, back-in-range
- Persistent live status notification showing current glucose
- Optional goose sound alert mode 🪿

**Meal Logging**
- Log meals by type (Breakfast, Lunch, Dinner, Snacks) with time picker
- AI-powered meal photo analysis via Google Gemini — photograph food, get per-item nutrition breakdown (calories, carbs, protein, fat, fiber) with confidence rating
- Manual nutrition entry as fallback
- Posts all meals to Nightscout as treatments

**Activity Logging**
- 10 activity types with MET-based calorie estimation
- Intensity multipliers (Low / Medium / High) with full calculation breakdown shown before saving
- Posts to Nightscout as activity treatments

**Trends & Analytics**
- Long-term analysis: 7 / 14 / 30 / 90 days or custom date range
- Key metrics: average glucose, time-in-range %, HbA1c estimate, hypo event count, standard deviation
- Daily average chart and 24-hour hourly pattern chart
- TTL-based local analysis cache

**Health Connect (Android)**
- Syncs steps, heart rate, calories, exercise sessions, and nutrition from Health Connect
- Auto-sync mode runs in the background
- Posts synced data directly to Nightscout

**Profile & Alerts**
- Fully configurable glucose thresholds, cooldown periods, and sound modes
- User profile with weight, height, age, gender (used for calorie calculations)
- Goose avatar picker 🪿

---

## Screenshots
<!-- Row 1: Login, Home, Food Modal -->
<div align="center">
<img src="docs/screenshots/01_login.PNG" width="24%"/>
<img src="docs/screenshots/03_main.PNG" width="24%"/>
<img src="docs/screenshots/04c_modal_food.PNG" width="24%"/>
  <img src="docs/screenshots/11b_goose_avatar.PNG" width="24%"/>

</div>

<!-- Row 2: Journal charts -->
<div align="center">
<img src="docs/screenshots/07_journal_charts.PNG" width="24%"/>
<img src="docs/screenshots/07b_journal_charts.PNG" width="24%"/>
<img src="docs/screenshots/10b_metrics.PNG" width="24%"/>
<img src="docs/screenshots/10e_trends_info.PNG" width="24%"/>
</div>

<!-- Row 3: Meals -->
<div align="center">
<img src="docs/screenshots/08_meals.PNG" width="24%"/>
<img src="docs/screenshots/08d_add_meal.PNG" width="24%"/>
<img src="docs/screenshots/08e_meal_results.PNG" width="24%"/>
  <img src="docs/screenshots/08f_today_meals.png" width="24%"/>

</div>

<!-- Row 5: Notification (full width, landscape) -->
<div align="center">
<img src="docs/screenshots/notification_live_graoh.png" width="50%"/>
</div>

[See all screenshots](docs/screenshots/)


## Architecture

The app follows a C4 architecture model documented in [`docs/architecture/`](docs/architecture/).

<div align="center">

| System Context | Container Diagram |
|:--------------:|:-----------------:|
| ![Context](docs/architecture/c4-context.png) | ![Components](docs/architecture/c4-container.png) |

</div>

| Data | Storage |
|------|---------|
| User profile, alerts config | Firebase Firestore |
| Auth session | Firebase Authentication |
| Glucose readings | Nightscout REST API |
| Treatments (meals, activities, notes) | Nightscout REST API |
| Nightscout API secret | expo-secure-store |
| Gemini API key | expo-secure-store |
| Trends analysis cache | AsyncStorage (TTL-based) |


## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native 0.81.5, Expo ~54 |
| Language | TypeScript |
| Auth & Database | Firebase (Auth + Firestore) |
| CGM Data | Nightscout REST API |
| AI | Google Gemini via Firebase Cloud Functions |
| Health Data | Google Health Connect (Android) |
| Charts | react-native-svg |
| Notifications | expo-notifications |
| Secure Storage | expo-secure-store |


## Setup

```bash
git clone https://github.com/wlaszkiewicz/GlucoseGoose.git
cd GlucoseGoose
npm install
npx expo start
```

**Requirements:**
- A running [Nightscout](https://nightscout.github.io/) instance
- Firebase project with Auth and Firestore enabled
- Google Gemini API key for AI meal analysis (optional — can be entered at login or configured server-side)


## Known Limitations

- Mood, Medication, and Sleep logging are planned but not yet implemented
- Health Connect integration is Android only
- Web/desktop platform support are present in the codebase but not actively maintained
