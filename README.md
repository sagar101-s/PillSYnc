# Medication Tracking & History Module - Adherence Hub

A production-ready, full-stack **Medication Tracking & History Module** built with the MERN stack (MongoDB, Express, React, Node.js) and styled with glassmorphic Tailwind CSS. It features automated missed dose auditing, dynamic countdown alarms, visual charts (Recharts), calendar grids, and chronological treatment timelines.

---

## 🚀 Key Features

1. **Intake Tracking Checklist**: Live checklist of today's schedule, showing dosages, instructions, and status tags. Mark doses as *Taken*, *Missed*, or *Skipped* with custom text notes.
2. **Next Dose Countdown Alert**: Live countdown timers checking remaining time until next scheduled dose.
3. **Automated Missed Dose Detection**: A robust backend utility scans past schedules and automatically marks past-due items without logs as *Missed*.
4. **Monthly Tracker Calendar**: Color-coded calendar grids (Green = All Taken, Red = All Missed, Yellow = Partial compliance, Gray = No medications scheduled). Clicking any date triggers a slide drawer with audit details.
5. **Chronological Regimen Timeline**: A vertical vertical timeline charting regimen starts, dose logs, and treatment completions.
6. **Adherence Analytics Dashboard**: Dynamic rate calculations:
   $$\text{Adherence \%} = \frac{\text{Taken Doses}}{\text{Scheduled Doses}} \times 100$$
   Displays weekly adherence trends via Area Charts, Taken vs Missed volume via Bar Charts, and per-medicine compliance leaderboards.
7. **Simulator Settings**: Switch Patient Profiles (dynamic headers), toggle notifications, and wipe/re-seed the database in one click.

---

## 📁 Folder Structure

```
Medication-Tracking/
├── backend/
│   ├── config/              # MongoDB Connection
│   ├── controllers/         # CRUD, History, Adherence, Dashboard controllers
│   ├── middleware/          # Async handler, global error handling middleware
│   ├── models/              # Mongoose Schemas (Medication, MedicationLog)
│   ├── routes/              # Express API Routes
│   ├── utils/               # Log sync helper, missed dose audit, seeder
│   ├── app.js               # Express application config
│   ├── server.js            # Node listener entry
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # UI Cards, spinners, floating toasts
│   │   ├── context/         # Theme Context, Toast Context
│   │   ├── pages/           # Dashboard, Today, Forms, Calendars, Analytics, Timelines, Settings
│   │   ├── services/        # Axios API Client
│   │   ├── index.css        # Tailwind imports, calendar tiles, glassmorphism styles
│   │   ├── main.jsx         # React bootstrap
│   │   └── App.jsx          # Router layout shell
│   ├── index.html           # Font styles & HTML shell
│   ├── vite.config.js       # Vite configuration
│   ├── tailwind.config.js   # Tailwind theme configurations
│   └── package.json
├── .env.example             # Config template
├── package.json             # Root monorepo concurrent manager
└── README.md
```

---

## 🔧 Installation & Local Setup

### Prerequisites
* **Node.js** (v16.0 or higher)
* **MongoDB** (Local Community Edition or Atlas)

### Step 1: Install Dependencies
Run the concurrent root script to install node modules in the root, backend, and frontend directories:
```bash
npm run setup
```

### Step 2: Configure Environment Variables
Create a `.env` file in the root folder (or copy `.env.example`):
```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/medication_tracker
JWT_SECRET=super_secret_jwt_token_key_here
```

### Step 3: Run Database Seeder
Seed the database with a 30-day compliance history:
```bash
npm run seed
```
*(Alternatively, click **Re-Seed Database** in the Settings tab of the frontend UI!)*

### Step 4: Run Development Server
Launch both the Express backend server (port 5000) and the Vite frontend (port 5173) concurrently:
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🛡️ API Endpoints

### 💊 Medication Regimen CRUD
* `GET /api/medications` - Get user medications (supports `search`, `page`, `limit`, `isActive` filters)
* `GET /api/medications/:id` - Get a single medication configuration
* `POST /api/medications` - Add a new medication regimen
* `PUT /api/medications/:id` - Update medication parameters
* `DELETE /api/medications/:id` - Delete medication configuration and delete all corresponding logs

### 📝 Intake Status Logging
* `POST /api/medications/:id/taken` - Mark a scheduled dose slot as Taken (saves taken date-time)
* `POST /api/medications/:id/missed` - Mark a scheduled dose slot as Missed
* `POST /api/medications/:id/skipped` - Mark a scheduled dose slot as Skipped

### 📊 Audits & Analytics
* `GET /api/history` - Get dose logs history (Query filters: `date` (YYYY-MM-DD), `type` (day, week, month, year), `search`, `status`)
* `GET /api/adherence` - Retrieve daily, weekly, monthly, and overall compliance rates
* `GET /api/dashboard` - Aggregates today's KPI counts, upcoming countdown details, and timeline logs.

---

## 🗄️ Database Schemas

### 1. Medication
Stores the prescription schedule configuration:
```javascript
{
  userId: { type: String, default: 'default-user', index: true },
  medicineName: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, enum: ['daily', 'alternate_days', 'specific_days', 'weekly'], required: true },
  specificDays: { type: [Number], default: [] }, // 0 (Sun) to 6 (Sat)
  timesPerDay: { type: Number, default: 1 },
  scheduledTimes: { type: [String], required: true }, // ['08:00', '20:00']
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  instructions: { type: String },
  isActive: { type: Boolean, default: true }
}
```

### 2. MedicationLog
Tracks specific dose events recorded on the calendar:
```javascript
{
  userId: { type: String, default: 'default-user', index: true },
  medicationId: { type: ObjectId, ref: 'Medication', required: true },
  scheduledTime: { type: String, required: true },
  takenTime: { type: Date },
  status: { type: String, enum: ['Pending', 'Taken', 'Missed', 'Skipped'], default: 'Pending' },
  date: { type: Date, required: true, index: true },
  notes: { type: String }
}
```
*(Compound Unique Index: `{ medicationId: 1, date: 1, scheduledTime: 1 }` prevents double entries)*

---

## ⚙️ NPM CLI Scripts
* `npm run setup` - Installs package modules in root, backend, and frontend.
* `npm run dev` - Launches backend server and frontend concurrently in development mode.
* `npm run seed` - Runs backend database mock seeder utility directly.
