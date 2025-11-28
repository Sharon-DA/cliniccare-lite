<div align="center">

# 🏥 ClinicCare Lite

### Offline-First Clinic Management System (EMR Lite)

[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**A real-world clinic management application following industry-standard EMR workflows used in hospitals across Nigeria, Kenya, Ghana, US, UK, and worldwide.**

[🚀 Live Demo](https://cliniccare-lite.vercel.app) • [📖 Documentation](#-complete-clinic-workflow) • [🛠️ Installation](#-quick-start) • [👤 Author](https://github.com/Sharon-DA)

---

</div>

## 📋 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Complete Clinic Workflow](#-complete-clinic-workflow)
- [User Roles](#-user-roles--dashboards)
- [Key Features](#-key-features)
- [Tech Stack](#-technology-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [Author](#-author)

---

## 🌟 Overview

**ClinicCare Lite** is the digital backbone of how a clinic operates. It replaces paper forms and organizes every step of the patient journey — from scheduling an appointment to generating the final visit summary.

This application follows the **exact same workflow** used in professional EMR systems like:
- OpenMRS
- Helium Health
- ClinifyEMR
- AthenaHealth EMR
- SmartClinic

### Why ClinicCare Lite?

| Real-World Problem | Our Solution |
|--------------------|--------------|
| 📁 Paper forms everywhere | Centralized digital patient records |
| 💊 Medicine stockouts & expiry | Real-time inventory alerts |
| 📅 Crowded waiting rooms | Digital queue management |
| 🏥 No patient history access | Complete visit summaries |
| 🌐 Unreliable internet | Fully offline-first architecture |
| 📊 No operational insights | Built-in analytics dashboard |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CLINICCARE LITE ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│   │ RECEPTION   │    │   TRIAGE    │    │   DOCTOR    │    │  PHARMACY   │  │
│   │  DASHBOARD  │───▶│  DASHBOARD  │───▶│  DASHBOARD  │───▶│  DASHBOARD  │  │
│   └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘  │
│         │                  │                  │                  │           │
│         │                  │                  │                  │           │
│         ▼                  ▼                  ▼                  ▼           │
│   ┌───────────────────────────────────────────────────────────────────┐     │
│   │                        LOCAL STORAGE / INDEXEDDB                   │     │
│   │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │     │
│   │  │ Patients │ │Appoint-  │ │ Triage   │ │Consulta- │ │Prescrip- │ │     │
│   │  │          │ │ments     │ │ Records  │ │tions     │ │tions     │ │     │
│   │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │     │
│   │  ┌──────────┐ ┌──────────┐ ┌──────────┐                          │     │
│   │  │Inventory │ │ Queue    │ │Lab Orders│                          │     │
│   │  └──────────┘ └──────────┘ └──────────┘                          │     │
│   └───────────────────────────────────────────────────────────────────┘     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Complete Clinic Workflow

This is the **standard, universal flow** used in hospitals and clinics worldwide:

### Step 1: Patient Registration
```
📝 Reception collects:
   • Full name, gender, date of birth
   • Phone number, address
   • Next of kin, allergies
   • Basic medical history
   
   → System creates patient profile with unique ID
```

### Step 2: Appointment Scheduling
```
📅 Book appointment based on:
   • Chosen clinic day
   • Doctor availability
   • Service type (consultation, follow-up, immunization, ANC)
   
   → System shows available time slots
```

### Step 3: Check-In at Clinic
```
✅ When patient arrives:
   • Reception verifies appointment
   • Marks status: CHECKED-IN
   • Patient enters triage queue
   
   → Triage nurse is notified
```

### Step 4: Triage / Vital Signs
```
💉 Triage Nurse collects:
   • Temperature, Blood pressure
   • Pulse, Oxygen saturation
   • Weight, Height, BMI
   • Pain score (0-10)
   
   → Status: TRIAGED → IN QUEUE
```

### Step 5: Queue Management
```
📋 System displays real-time queue:
   
   Patient A — WITH DOCTOR
   Patient B — NEXT
   Patient C — WAITING
   Patient D — IN TRIAGE
   
   → Solves crowding and confusion
```

### Step 6: Doctor Consultation
```
👨‍⚕️ Doctor records:
   
   SYMPTOMS: fever, cough, headache
   EXAMINATION: findings, assessment
   DIAGNOSIS: Malaria (B54), UTI (N39.0)
   MEDICATIONS: Paracetamol, Amoxicillin
   LAB TESTS: CBC, Malaria Parasite
   
   → Everything stored in medical record
```

### Step 7: Lab Tests (if ordered)
```
🔬 Lab Workflow:
   • Order appears on Lab page
   • Lab technician runs tests
   • Results uploaded to system
   • Doctor gets notified
   
   → Status: LAB → RESULTS READY
```

### Step 8: Pharmacy Dispensing
```
💊 Pharmacist sees:
   • Patient name
   • Prescription from doctor
   • Dosage instructions
   
   → Marks as: ✔ DISPENSED
```

### Step 9: Visit Summary
```
📋 Complete record compiled:
   • Vitals from triage
   • Consultation notes
   • Diagnosis
   • Lab results
   • Medications dispensed
   
   → Status: COMPLETED
```

---

## 👥 User Roles & Dashboards

| User Role | Dashboard | Primary Functions |
|-----------|-----------|-------------------|
| **Receptionist** | Check-In, Appointments | Register patients, schedule appointments, check-in |
| **Triage Nurse** | Triage | Record vital signs, assess urgency |
| **Doctor/Clinician** | Queue, Consultation | Diagnosis, prescriptions, lab orders |
| **Pharmacist** | Pharmacy | View prescriptions, dispense medications |
| **Lab Technician** | Lab | View orders, upload test results |
| **Admin/Manager** | Analytics, Settings | Reports, staff monitoring, system config |

---

## ⚡ Key Features

### 🏥 Clinical Workflow
- ✅ **Patient Registration** — Complete demographic capture
- ✅ **Appointment Scheduling** — Calendar-based booking
- ✅ **Check-In System** — Arrival verification
- ✅ **Triage Station** — Vital signs recording
- ✅ **Queue Management** — Real-time patient queue
- ✅ **Consultation Module** — SOAP notes, ICD-10 diagnosis
- ✅ **Lab Integration** — Order tests, record results
- ✅ **Pharmacy Module** — Prescription dispensing
- ✅ **Visit Summary** — Complete visit documentation

### 📊 Management Features
- ✅ **Inventory Tracking** — Stock levels, expiry alerts
- ✅ **Analytics Dashboard** — Appointment trends, no-show rates
- ✅ **Role-Based Access** — Clinician, Inventory Manager, Admin
- ✅ **Data Export** — CSV/JSON for all records
- ✅ **Backup/Restore** — Full data backup functionality

### 🔧 Technical Features
- ✅ **Offline-First** — Works without internet
- ✅ **Local Storage** — Data persists in browser
- ✅ **Responsive Design** — Mobile, tablet, desktop
- ✅ **Accessible UI** — ARIA labels, keyboard navigation

---

## 🛠️ Technology Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 18 (Functional Components + Hooks) |
| **Routing** | React Router v6 |
| **Styling** | Tailwind CSS 3.3 |
| **Charts** | Recharts |
| **Build Tool** | Vite 5.0 |
| **Data Storage** | localStorage / IndexedDB |
| **Deployment** | Vercel |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/Sharon-DA/cliniccare-lite.git

# Navigate to project
cd cliniccare-lite

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Demo Credentials
Create a new account with any username/password, or use the app to explore all features.

---

## 📁 Project Structure

```
cliniccare-lite/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── common/          # Reusable UI components
│   │   │   ├── Badge.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── SearchInput.jsx
│   │   │   └── ToastContainer.jsx
│   │   ├── layout/          # App layout
│   │   │   ├── Header.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── patients/        # Patient-related components
│   │   ├── inventory/       # Inventory components
│   │   └── appointments/    # Appointment components
│   ├── context/
│   │   ├── AuthContext.jsx      # Authentication state
│   │   └── NotificationContext.jsx
│   ├── hooks/
│   │   ├── useLocalDB.js        # CRUD operations for localStorage
│   │   └── useFormValidation.js # Form validation logic
│   ├── pages/
│   │   ├── Dashboard.jsx        # Main dashboard
│   │   ├── Patients.jsx         # Patient management
│   │   ├── PatientDetail.jsx    # Individual patient view
│   │   ├── Appointments.jsx     # Appointment scheduling
│   │   ├── CheckIn.jsx          # Patient check-in
│   │   ├── Triage.jsx           # Vital signs recording
│   │   ├── Queue.jsx            # Queue management
│   │   ├── Consultation.jsx     # Doctor consultation
│   │   ├── Lab.jsx              # Lab test management
│   │   ├── Pharmacy.jsx         # Medication dispensing
│   │   ├── Inventory.jsx        # Stock management
│   │   ├── Analytics.jsx        # Reports & charts
│   │   ├── Settings.jsx         # App configuration
│   │   └── VisitSummary.jsx     # Complete visit record
│   ├── utils/
│   │   ├── constants.js         # App constants & enums
│   │   ├── helpers.js           # Utility functions
│   │   └── exportUtils.js       # CSV/JSON export
│   ├── data/
│   │   └── seedData.js          # Sample data for testing
│   ├── App.jsx                  # Root component with routing
│   ├── index.jsx                # Entry point
│   └── index.css                # Global styles
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

---

## 🌐 Deployment

### Live Application
**🔗 https://cliniccare-lite.vercel.app**

### Deploy Your Own

#### Vercel (Recommended)
1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Deploy automatically

#### Netlify
1. Push code to GitHub
2. Import in [Netlify](https://netlify.com)
3. Build command: `npm run build`
4. Publish directory: `dist`

---

## 📊 Data Models

### Patient
```javascript
{
  id: "p_001",
  name: "Grace Adeyemi",
  dob: "1986-03-10",
  gender: "F",
  contact: "08012345678",
  address: "123 Main St, Lagos",
  visits: [...]
}
```

### Appointment
```javascript
{
  id: "a_001",
  patientId: "p_001",
  datetime: "2025-11-30T10:00",
  clinician: "Dr. Okonkwo",
  status: "scheduled" // → checked_in → in_queue → with_doctor → completed
}
```

### Consultation
```javascript
{
  id: "cons_001",
  appointmentId: "a_001",
  complaint: "Fever and headache for 3 days",
  diagnosis: [{ code: "B54", name: "Malaria" }],
  medications: [{ name: "Artemether-Lumefantrine", dosage: "..." }],
  labTests: [{ code: "MP", name: "Malaria Parasite Test" }]
}
```

---

## 🎯 Status Flow

```
SCHEDULED → CHECKED_IN → IN_QUEUE → WITH_DOCTOR → LAB/PHARMACY → COMPLETED
    ↓                                                    ↓
 NO_SHOW                                            CANCELLED
```

---

## 👤 Author

**Sharon**
- GitHub: [@Sharon-DA](https://github.com/Sharon-DA)
- Project: [ClinicCare Lite](https://github.com/Sharon-DA/cliniccare-lite)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

### 🏥 Built for the eHealth Africa Cohort

**ClinicCare Lite** — A real-world clinic management solution

*Offline-first • Role-based • Industry-standard workflow*

</div>
