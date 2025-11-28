<div align="center">

# 🏥 ClinicCare Lite

### Offline-First Clinic Management Application

[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**A comprehensive, MVP-ready clinic management solution for patient records, appointments, and inventory tracking.**

[🚀 Live Demo](#-deployment) • [📖 Documentation](#-key-functionalities) • [🛠️ Installation](#-quick-start) • [📸 Screenshots](#-screenshots)

---

</div>

## 📋 Table of Contents

- [Overview](#-overview)
- [Target Users](#-target-users)
- [Key Functionalities](#-key-functionalities)
- [Usage Scenarios](#-usage-scenarios)
- [Tech Stack](#-technology-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Sample Data](#-sample-data)
- [Deployment](#-deployment)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**ClinicCare Lite** is an **offline-first, React-based clinic management application** designed to improve patient care, streamline clinic operations, and optimize inventory management in healthcare facilities. It integrates **patient records, appointment scheduling, and inventory tracking** into a single, user-friendly interface.

### Why ClinicCare Lite?

| Challenge | Solution |
|-----------|----------|
| 📁 Fragmented paper records | Centralized digital patient management |
| 💊 Stockouts & expired medicines | Real-time inventory alerts |
| 📅 Appointment chaos | Visual day-view scheduling with queue |
| 🌐 Unreliable internet | Fully offline-first architecture |
| 📊 No visibility into operations | Built-in analytics dashboard |

The app is **MVP-ready**, fully functional, and deployable without a backend, using **localStorage/IndexedDB** for offline data persistence. It is designed to address real-world pain points in healthcare settings, including **fragmented record-keeping, stockouts, and appointment inefficiencies**.

---

## 👥 Target Users

### Primary Users

| Role | Responsibilities |
|------|------------------|
| **👨‍⚕️ Clinicians / Healthcare Providers** | Manage patient profiles and visit histories, record immunizations and treatment notes, view daily schedules |
| **📦 Inventory / Clinic Managers** | Track medicines, vaccines, and supplies, flag low-stock or near-expiry items, export reports for auditing |

### Secondary Users

| Role | Responsibilities |
|------|------------------|
| **👔 Admins / Supervisors** | Configure system thresholds, view high-level analytics dashboards |
| **🏃 Patients** | Receive better-organized healthcare services (no direct login required) |

---

## ⚡ Key Functionalities

### A. 🔐 Authentication & Roles

- Signup/Login system (client-side using localStorage)
- Role-based interface: **Clinician** vs **Inventory Manager**
- Different menus and access permissions for each role
- Persistent sessions across browser reloads

### B. 👥 Patient & Health Records (HMR Lite)

| Feature | Description |
|---------|-------------|
| Patient Profiles | Create, edit, delete (name, DOB, gender, contact, ID) |
| Visit Records | Date, reason, clinician notes, immunizations |
| Immunizations | Controlled vocabulary with age-appropriate suggestions |
| Search & Filter | Find patients by name, ID, or gender |
| Export | Download records as **JSON** or **CSV** |

### C. 📅 Appointment Booking & Queue Management

| Feature | Description |
|---------|-------------|
| Scheduling | Book appointments with date/time and clinician |
| Day View | Visual calendar with horizontal date navigation |
| Status Workflow | Scheduled → Checked In → In Progress → Completed |
| Walk-ins | Add unscheduled patients to today's queue |
| No-Show Tracking | Mark and track missed appointments |
| Export | Attendance and no-show reports as CSV |

### D. 📦 Inventory & Supply Management

| Feature | Description |
|---------|-------------|
| Item Management | Add, edit, delete (name, SKU, batch, quantity, unit, expiry) |
| Transactions | Track stock intake and outtake with logs |
| Smart Alerts | ⚠️ Low stock, ⏰ Near-expiry, ❌ Expired |
| Import/Export | CSV and JSON support for bulk operations |
| Categories | Vaccines, Medications, Supplies, Equipment |

### E. 📊 Analytics & Reports

| Chart | Data |
|-------|------|
| Bar Chart | Daily appointments (total, attended, no-show) |
| Pie Chart | Appointment status distribution |
| Pie Chart | Inventory health (healthy, low, expired) |
| Line Chart | Stock trends (in/out over time) |
| Table | Inventory breakdown by category |

**Filters:** Date range (7/14/30/90 days), Clinician

### F. 🔌 Offline-First / Data Persistence

```javascript
// Custom hook for all data operations
const { data, create, update, remove, exportData, importData } = useLocalDB('key');
```

- All data stored in **localStorage/IndexedDB**
- Custom `useLocalDB(key)` hook for CRUD operations
- Cross-tab synchronization via storage events
- Export/Import for backup and restore
- App fully functional **without internet**

### G. ⚙️ Settings & Backups

| Setting | Description |
|---------|-------------|
| Low Stock Threshold | Alert when quantity falls below this |
| Near-Expiry Days | Warning days before expiration |
| Clinic Info | Name, contact, address |
| Full Backup | Download all data as JSON |
| Restore | Upload previous backup to restore |
| Reset | Clear all data and start fresh |

---

## 📖 Usage Scenarios

### Scenario 1: Clinician Adding a Patient Visit

```
1. Log in as a clinician
2. Navigate to Patients → Search or create patient profile
3. Click on patient → Add Visit
4. Enter visit details, notes, and immunizations
5. Save → Optionally export patient record
```

### Scenario 2: Inventory Manager Tracking Stock

```
1. Log in as inventory manager
2. Go to Inventory → Add Item (new vaccine batch)
3. Click transaction icon → Record intake/outtake
4. Review dashboard for low-stock alerts
5. Export inventory report for audit
```

### Scenario 3: Daily Appointment Management

```
1. Open Appointments → Select today's date
2. View scheduled patients in day view
3. Click "Check In" when patient arrives
4. Click "Start" → "Complete" for workflow
5. Mark no-shows at end of day
6. Export attendance report
```

---

## 🛠️ Technology Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 18 (Functional Components + Hooks) |
| **Build Tool** | Vite 5 |
| **Routing** | React Router 6 |
| **Styling** | Tailwind CSS 3 (Mobile-First) |
| **Charts** | Recharts |
| **Date Handling** | date-fns |
| **CSV Parsing** | PapaParse |
| **Data Persistence** | localStorage + Custom Hooks |
| **Testing** | Vitest + React Testing Library |
| **Icons** | Heroicons (SVG) |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **yarn**

### Installation

```bash
# Clone the repository
git clone https://github.com/Sharon-DA/cliniccare-lite.git

# Navigate to project directory
cd cliniccare-lite

# Install dependencies
npm install

# Start development server
npm run dev
```

### Open in Browser

```
http://localhost:5173
```

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
ClinicCare-Lite/
├── public/
│   └── favicon.svg                    # App icon
├── src/
│   ├── components/
│   │   ├── common/                    # Reusable UI components
│   │   │   ├── Badge.jsx              # Status badges
│   │   │   ├── ConfirmDialog.jsx      # Confirmation modals
│   │   │   ├── EmptyState.jsx         # Empty state displays
│   │   │   ├── FileUpload.jsx         # File upload with drag-drop
│   │   │   ├── LoadingSpinner.jsx     # Loading indicator
│   │   │   ├── Modal.jsx              # Modal dialog
│   │   │   ├── SearchInput.jsx        # Search with clear button
│   │   │   └── ToastContainer.jsx     # Notification toasts
│   │   ├── layout/
│   │   │   ├── Header.jsx             # Top header bar
│   │   │   └── Sidebar.jsx            # Navigation sidebar
│   │   ├── patients/
│   │   │   ├── PatientForm.jsx        # Create/edit patient
│   │   │   └── VisitForm.jsx          # Add/edit visits
│   │   ├── inventory/
│   │   │   ├── InventoryForm.jsx      # Create/edit items
│   │   │   └── TransactionForm.jsx    # Stock in/out
│   │   └── appointments/
│   │       └── AppointmentForm.jsx    # Schedule appointments
│   ├── context/
│   │   ├── AuthContext.jsx            # Authentication state
│   │   └── NotificationContext.jsx    # Toast notifications
│   ├── hooks/
│   │   ├── useLocalDB.js              # Offline data persistence
│   │   ├── useFormValidation.js       # Form validation
│   │   └── __tests__/
│   │       └── useLocalDB.test.js     # Unit tests
│   ├── pages/
│   │   ├── Login.jsx                  # Login page
│   │   ├── Signup.jsx                 # Registration page
│   │   ├── Dashboard.jsx              # Main dashboard
│   │   ├── Patients.jsx               # Patient list
│   │   ├── PatientDetail.jsx          # Patient details & visits
│   │   ├── Inventory.jsx              # Inventory management
│   │   ├── Appointments.jsx           # Appointment scheduling
│   │   ├── Analytics.jsx              # Charts & reports
│   │   └── Settings.jsx               # App configuration
│   ├── utils/
│   │   ├── constants.js               # App constants & vocabularies
│   │   ├── helpers.js                 # Utility functions
│   │   └── exportUtils.js             # CSV/JSON export
│   ├── data/
│   │   └── seedData.js                # Sample data
│   ├── test/
│   │   └── setup.js                   # Test configuration
│   ├── App.jsx                        # Main app component
│   ├── index.jsx                      # Entry point
│   └── index.css                      # Tailwind styles
├── .gitignore                         # Git ignore rules
├── index.html                         # HTML template
├── LICENSE                            # MIT License
├── package.json                       # Dependencies
├── postcss.config.js                  # PostCSS config
├── sample-backup.json                 # Demo data backup
├── tailwind.config.js                 # Tailwind config
├── vite.config.js                     # Vite config
└── README.md                          # Documentation
```

---

## 📦 Sample Data

Load the included sample data to explore all features:

### Method 1: Via UI
1. Go to **Settings** → **Restore from Backup**
2. Select `sample-backup.json`
3. Click **Restore Data**

### Method 2: Programmatically
```javascript
import { loadSeedData } from './src/data/seedData';
loadSeedData(true); // Force overwrite existing data
```

### Sample Data Includes

| Type | Count | Examples |
|------|-------|----------|
| **Patients** | 5 | Grace Adeyemi, Chukwuemeka Okonkwo, Fatima Ibrahim |
| **Inventory** | 5 | Measles Vaccine, Paracetamol, Syringes, ORS |
| **Appointments** | 5 | Scheduled, Completed, No-show examples |

---

## 🌐 Deployment

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repo at [vercel.com](https://vercel.com) for auto-deploy.

### Option 2: Netlify

```bash
# Build the app
npm run build

# Deploy via Netlify CLI or drag-drop dist/ folder
```

### Option 3: GitHub Pages

1. Update `vite.config.js`:
```javascript
export default defineConfig({
  base: '/cliniccare-lite/',
  // ...
});
```

2. Build and deploy:
```bash
npm run build
# Deploy dist/ to gh-pages branch
```

### Live Demo

🔗 **[View Live Demo](https://cliniccare-lite.vercel.app)** *(Deploy to get your URL)*

---

## 📸 Screenshots

<details>
<summary>Click to view screenshots</summary>

### Login Page
![Login](screenshots/login.png)

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Patients List
![Patients](screenshots/patients.png)

### Inventory Management
![Inventory](screenshots/inventory.png)

### Appointments Day View
![Appointments](screenshots/appointments.png)

### Analytics Dashboard
![Analytics](screenshots/analytics.png)

</details>

---

## 🧪 Testing

```bash
# Run tests
npm run test

# Run with coverage
npm run test:coverage
```

---

## 🔒 Security Notes

> ⚠️ **This is a demo/portfolio application.** For production use:

- [ ] Implement proper backend authentication
- [ ] Hash passwords (never store plain text)
- [ ] Use HTTPS in production
- [ ] Implement session tokens
- [ ] Add input sanitization
- [ ] Enable CSP headers

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👩‍💻 Author

**Sharon A**

- GitHub: [@Sharon-DA](https://github.com/Sharon-DA)
- Profile: [github.com/Sharon-DA](https://github.com/Sharon-DA)

---

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI Library
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Recharts](https://recharts.org/) - Charts
- [Heroicons](https://heroicons.com/) - Icons
- [date-fns](https://date-fns.org/) - Date utilities

---

<div align="center">

**ClinicCare Lite** — Managing healthcare, one patient at a time. 💚

⭐ Star this repo if you found it helpful!

</div>
