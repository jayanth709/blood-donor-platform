# BloodLink — Complete Review 2 Guide
## Everything You Need to Tell Mam

---

## PART 1 — CLIENT FOLDER STRUCTURE (What to Say)

### What is the `client/` folder?
> "Mam, the `client` folder contains the entire frontend of our application — the visual part that users see and interact with in the browser. It is built using React with TypeScript and Vite as the build tool."

---

### `client/src/` — Source Code Root

#### `main.tsx`
> "This is the entry point of the React application. It mounts the entire app into the HTML `div` with id `root`. It wraps everything in providers like `AuthProvider` and `ToastProvider` so those features are available everywhere."

#### `App.tsx`
> "This file contains all the routes of our application using React Router. It defines which page component is shown for each URL path — for example `/donor/dashboard` shows the donor dashboard, `/hospital/dashboard` shows the hospital dashboard, and `/login` shows the login page. It also handles role-based access — if a donor tries to go to a hospital page, it redirects them away."

#### `index.css`
> "This file contains the global CSS styles — colors, fonts, animations, glassmorphism card effects, and the dark theme design system for the entire application."

---

### `src/pages/` — All UI Pages

#### `public/` — Pages anyone can see (no login needed)
| File | What to say |
|---|---|
| `LandingPage.tsx` | "This is the home page of the platform. It has animations, shows live statistics from the database, explains how the platform works, and has buttons to register as donor or hospital." |
| `LoginPage.tsx` | "The login page. Users enter their email and password. The frontend sends it to our backend API, which checks the SQLite database and returns a JWT token if valid." |
| `DonorRegisterPage.tsx` | "Registration form for blood donors. Collects name, blood group, date of birth, weight, address. On submit, this data goes to the backend and is saved in the `users` and `donors` tables in SQLite." |
| `HospitalRegisterPage.tsx` | "Registration form for hospitals. Collects hospital name, license number, emergency contact person, 24/7 hotline, address. Saved to the `users` and `hospitals` tables in SQLite." |

#### `donor/` — Donor Dashboard Pages
| File | What to say |
|---|---|
| `DonorDashboard.tsx` | "The main dashboard a donor sees after login. Shows their blood group, availability status, recent emergency requests compatible with their blood group, and donation statistics." |
| `DonorProfilePage.tsx` | "Allows the donor to view and update their profile — weight, address, chronic illness status. Changes are saved to the SQLite `donors` table via the backend API." |
| `DonorEmergencyRequestsPage.tsx` | "Shows all active hospital emergency requests that match the donor's blood group. The donor can Accept or Reject each request from here." |
| `DonorResponsesPage.tsx` | "Shows the history of all emergencies the donor has responded to — accepted, rejected, pending." |
| `DonorHistoryPage.tsx` | "Shows the donor's full donation history — past fulfilled donations with hospital name, date, and blood group." |

#### `hospital/` — Hospital Dashboard Pages
| File | What to say |
|---|---|
| `HospitalDashboard.tsx` | "The main dashboard for a hospital after login. Shows active emergency requests, hospital stats, and quick-access buttons." |
| `CreateEmergencyRequestPage.tsx` | "A form where the hospital creates a blood emergency request — selects blood group needed, number of units, urgency level (CRITICAL/HIGH/NORMAL), and location. On submit, this is saved to the `emergency_requests` table in SQLite, and the platform identifies matching available donors." |
| `HospitalActiveRequestsPage.tsx` | "Lists all currently open emergency requests created by this hospital." |
| `HospitalHistoryPage.tsx` | "Shows past fulfilled and cancelled requests for the hospital." |
| `HospitalDonorResponsesPage.tsx` | "Shows which donors have responded to this hospital's emergency requests — with their blood group, contact number, and response status (Accepted/Rejected/Pending)." |
| `MatchedDonorsPage.tsx` | "Shows the list of donors who were automatically matched to an emergency request based on blood compatibility, eligibility, and location." |

#### `admin/` — Admin Dashboard Pages
| File | What to say |
|---|---|
| `AdminDashboard.tsx` | "Platform-wide statistics — total donors, hospitals, emergency requests, fulfilled requests. The admin gets a bird's-eye view of everything." |
| `AdminDonorsPage.tsx` | "Allows the admin to view all registered donors, filter by blood group, and suspend/activate accounts." |
| `AdminHospitalsPage.tsx` | "Allows the admin to view all hospitals, verify or reject their registration." |
| `AdminEmergencyMonitoringPage.tsx` | "Real-time monitoring of all emergency requests across all hospitals — the admin can see the status of every request on the platform." |

---

### `src/components/` — Reusable Building Blocks

> "Mam, we followed component-based architecture. Instead of writing the same code again and again in each page, we created reusable components."

| Folder / File | What to say |
|---|---|
| `layout/DashboardLayout.tsx` | "The common layout wrapper for all dashboard pages — includes the sidebar navigation, header with user info, and the main content area. All role-specific dashboards use this." |
| `layout/Sidebar.tsx` | "The left-side navigation menu that changes based on the role — different menu items for donor, hospital, and admin." |
| `common/Button.tsx` | "A reusable button component with variants like primary, danger, outline. Used on every page." |
| `common/Card.tsx` | "A reusable card container with title, subtitle, and content. Used in dashboards and forms." |
| `common/FormField.tsx` | "Reusable form input, select, and label components with consistent styling." |
| `common/Modal.tsx` | "A reusable popup dialog — used for confirming critical actions like broadcasting an emergency request." |
| `common/AvailabilityToggle.tsx` | "A toggle switch specific to donors — turns their availability ON/OFF so hospitals know if they can be alerted." |
| `common/StatusBadge.tsx` | "A colored badge that shows status labels like CRITICAL, FULFILLED, SEARCHING with appropriate colors." |

---

### `src/services/` — API Communication Layer

> "Mam, we separated all backend API calls into service files. No page directly makes HTTP requests — everything goes through these services. This is called the Service Layer pattern."

| File | What to say |
|---|---|
| `api.ts` | "This is the central Axios instance. It automatically attaches the JWT token to every request header. If the server returns a 401 Unauthorized, it clears the token and redirects the user to login." |
| `authService.ts` | "Handles login, donor registration, hospital registration, and logout. On successful login, the JWT token is saved in `localStorage`." |
| `donorService.ts` | "Handles all donor-specific API calls — getting dashboard data, updating profile, toggling availability, fetching compatible emergency requests, responding to alerts." |
| `hospitalService.ts` | "Handles hospital-specific API calls — getting dashboard, creating emergency requests, viewing donor responses, updating status." |
| `emergencyRequestService.ts` | "Handles emergency request operations used across multiple roles." |
| `adminService.ts` | "Handles all admin-specific API calls — platform stats, managing donors and hospitals, verifying hospitals." |
| `mockData.ts` | "This file has the 3 seed accounts (admin, one hospital, one donor) pre-loaded. These are the only demo accounts — all real registrations go to the SQLite database." |

---

### `src/context/` — Global State Management

> "Mam, we used React Context API for global state — data that needs to be accessible from any page without passing it through every component."

| File | What to say |
|---|---|
| `AuthContext.tsx` | "Stores the currently logged-in user's information and profile. Any page can call `useAuth()` to get the current user, login, logout, or register. On startup, it reads the JWT from localStorage and verifies it with the backend `/me` endpoint." |
| `ToastContext.tsx` | "Provides a global notification system — success, error, warning toasts that appear at the top of the screen when something happens." |

---

### `src/types/` — TypeScript Type Definitions

> "Mam, since we use TypeScript, we defined the shape of our data objects here. For example, what fields a User has, what a DonorProfile looks like. TypeScript uses these to catch errors at development time before they happen in production."

---

### `src/utils/` — Helper Utilities

| File | What to say |
|---|---|
| `bloodCompatibility.ts` | "Contains the blood group compatibility matrix. Given a donor's blood group, it checks if they are compatible with the patient's blood group. For example, O− donors can donate to all groups — they are universal donors. This is pure logic — no API needed." |

---

### Root Config Files

| File | What to say |
|---|---|
| `vite.config.ts` | "Vite is our build tool and development server. It compiles TypeScript and React JSX into regular JavaScript the browser can run. It also enables Hot Module Replacement — when we edit a file, the browser updates instantly without a full page refresh." |
| `tailwind.config.js` | "Tailwind CSS is the utility-class styling framework we use. This config extends it with our custom colors, animations like heartbeat pulse, and font families." |
| `tsconfig.json` | "TypeScript configuration — tells the TypeScript compiler what rules to follow when checking our code." |
| `package.json` | "Lists all the third-party packages the frontend depends on — React, Vite, Framer Motion (animations), Axios (HTTP calls), Lucide (icons), React Router (page navigation)." |

---

## PART 2 — WHY EACH TECHNOLOGY WAS CHOSEN

| Technology | Why we used it |
|---|---|
| **React** | Industry-standard frontend library. Component-based — we build small reusable pieces and compose them into full pages. |
| **TypeScript** | Adds strict type checking to JavaScript. Catches bugs before they happen. Professional standard in all real-world projects. |
| **Vite** | Much faster than the old Create React App. Starts the dev server in under 1 second. |
| **Framer Motion** | Smooth, production-quality animations — page transitions, scroll effects, counters. |
| **Tailwind CSS** | Utility-first CSS — no separate CSS files needed for each component. Much faster to style. |
| **Axios** | Better than `fetch()` — automatic JSON parsing, interceptors for JWT, better error handling. |
| **React Router** | Handles client-side navigation. Switching between pages without full page reload. |
| **Lucide Icons** | Clean, consistent icon set used throughout the UI. |
| **JWT (JSON Web Token)** | Stateless authentication. Server issues a signed token on login — no session storage needed on server. |
| **SQLite (better-sqlite3)** | Relational database. Zero server setup — just a file. ACID-compliant. Perfect for demonstrating a working project. |
| **Express.js** | Minimal Node.js backend framework. Handles routing, middleware, and JSON responses. |
| **bcrypt** | Password hashing — passwords are NEVER stored as plain text in the database. |

---

## PART 3 — POSTMAN GUIDE (How to Show Mam)

### What is Postman?
> "Mam, Postman is an API testing tool. Since our backend is a REST API, we can't test POST and PUT requests just by typing a URL in the browser. Postman lets us send any type of HTTP request with custom JSON body and headers — it's the standard tool used in all professional backend development to test and document APIs."

### How to Install
1. Go to **https://www.postman.com/downloads/**
2. Download and install the desktop app
3. Open Postman — no account needed, click **"Skip and go to app"**

---

### Step-by-Step Demo for Mam

#### Step 1 — Test Health Check (no auth needed)
```
Method: GET
URL: http://localhost:5000/api/health
```
Click **Send** → Shows the server is ONLINE with database info.

---

#### Step 2 — Register a New Donor
```
Method: POST
URL: http://localhost:5000/api/auth/register/donor
Headers: Content-Type: application/json
Body (raw JSON):
{
  "name": "Demo Donor",
  "email": "demo@donor.in",
  "password": "Demo@123",
  "phone": "+91 99001 88888",
  "blood_group": "O+",
  "date_of_birth": "1998-06-15",
  "weight": 70,
  "area": "Anna Nagar",
  "city": "Chennai",
  "pincode": "600040"
}
```
Click **Send** → Response shows `success: true`, the new user object, and a JWT token.

> "Mam, you can now open DB Browser for SQLite, open `server/database.sqlite`, click the `users` table — you will see this new donor's record was just inserted."

---

#### Step 3 — Login and Get JWT Token
```
Method: POST
URL: http://localhost:5000/api/auth/login
Headers: Content-Type: application/json
Body:
{
  "email": "demo@donor.in",
  "password": "Demo@123"
}
```
**Copy the `token` value from the response.**

---

#### Step 4 — Access Protected Donor Dashboard (with token)
```
Method: GET
URL: http://localhost:5000/api/donor/dashboard
Headers:
  Authorization: Bearer <paste token here>
```
Click **Send** → Returns the donor's profile, stats, and active emergency alerts from the database.

> "Mam, without the token, this returns 401 Unauthorized. The token proves who the user is — this is JWT authentication."

---

#### Step 5 — Register a Hospital
```
Method: POST
URL: http://localhost:5000/api/auth/register/hospital
Headers: Content-Type: application/json
Body:
{
  "name": "Demo Hospital",
  "email": "demo@hospital.in",
  "password": "Hospital@123",
  "phone": "+91 44 9900 1234",
  "hospital_name": "Demo Hospital",
  "license_number": "TN-DEMO-2024-0001",
  "contact_person": "Dr. Demo Kumar",
  "emergency_phone": "+91 98001 77777",
  "area": "T. Nagar",
  "city": "Chennai",
  "pincode": "600017"
}
```

---

#### Step 6 — Login as Hospital and Create Emergency Request
```
Method: POST
URL: http://localhost:5000/api/auth/login
Body: { "email": "demo@hospital.in", "password": "Hospital@123" }
```
Copy the hospital's token. Then:
```
Method: POST
URL: http://localhost:5000/api/hospital/emergency-request
Headers: Authorization: Bearer <hospital token>
Body:
{
  "patient_blood_group": "O+",
  "required_units": 2,
  "urgency": "CRITICAL",
  "patient_case_details": "Road accident trauma patient in ICU",
  "area": "T. Nagar",
  "city": "Chennai",
  "pincode": "600017"
}
```
Response shows the created request AND the list of matching donors found in the database.

> "Mam, this is the core feature — the backend automatically finds all donors with compatible blood groups, who are available and eligible, within the same city."

---

#### Step 7 — Login as Admin and View Stats
```
Method: POST
URL: http://localhost:5000/api/auth/login
Body: { "email": "admin@bloodlink.gov.in", "password": "Admin@BloodLink2025" }
```
Copy admin token. Then:
```
Method: GET
URL: http://localhost:5000/api/admin/stats
Headers: Authorization: Bearer <admin token>
```
Returns live counts of donors, hospitals, requests — all from the SQLite database.

---

### What Mam Will Ask About Postman

| Question | Answer |
|---|---|
| "Why can't you test this in the browser?" | "Browser only supports GET requests by typing a URL. POST/PUT/DELETE with JSON body and Authorization headers require Postman." |
| "What is the Authorization header?" | "It carries the JWT token that proves who the user is. Format is `Bearer <token>`. Without it, the server returns 401 Unauthorized." |
| "What does 200 status mean?" | "200 OK — request succeeded. 201 — new resource created. 401 — not authenticated. 404 — not found. 500 — server error." |
| "What is JSON?" | "JavaScript Object Notation — a lightweight text format for sending data between frontend and backend. Easy for both humans and machines to read." |
| "Where is the data stored?" | "In `server/database.sqlite`. You can open it in DB Browser for SQLite to see every table with actual rows." |

---

## PART 4 — LOGIN CREDENTIALS FOR DEMO

| Role | Email | Password |
|---|---|---|
| 🔴 **Donor** | `karthik.donor@example.com` | `Donor@123` |
| 🟠 **Hospital** | `emergency@apollohospitals.org` | `Hospital@123` |
| 🟣 **Admin** | `admin@bloodlink.gov.in` | `Admin@BloodLink2025` |

**Website:** http://localhost:5173  
**Backend API:** http://localhost:5000
