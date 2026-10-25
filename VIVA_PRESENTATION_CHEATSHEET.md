# BloodLink — Final Review Viva & Demonstration Cheatsheet
## Everything You Need to Say and Do in Front of Mam & HOD

---

## ⚡ 1. QUICK SETUP (Just Press `F5` in VS Code)

You have **3 easy ways** to launch the entire platform:

### 👉 Method 1 (Recommended): Just Press `F5` (or `Ctrl + F5`) in VS Code
- Pressing **`F5`** automatically runs [`start.bat`](file:///c:/Users/jayanth/OneDrive/Desktop/Blood%20Donor%20Platform/start.bat).
- It opens both the **Backend** (`http://localhost:5000`) and the **Frontend** (`http://localhost:5173`) in their own dedicated command prompts!

### 👉 Method 2: Double-Click `start.bat`
- Go to the project folder on your Desktop and simply **double-click [`start.bat`](file:///c:/Users/jayanth/OneDrive/Desktop/Blood%20Donor%20Platform/start.bat)**. Both servers start instantly.

### 👉 Method 3: Change to any Custom Shortcut (e.g., `Ctrl + Shift + S`)
- In VS Code, press **`Ctrl + K`**, then **`Ctrl + S`** (opens Keyboard Shortcuts).
- Search for: `Run Build Task`.
- Double-click it and press whatever shortcut you like (e.g. `Ctrl + Shift + S` or `Ctrl + Shift + D`).

---

## 🔑 2. DEMO LOGIN CREDENTIALS TO USE

You don't need to create accounts from scratch; these 3 are already in the database:

| Role | Email | Password | What to show |
|---|---|---|---|
| **Hospital** | `emergency@apollohospitals.org` | `Hospital@123` | Apollo Speciality Hospitals (creates emergency requests) |
| **Donor** | `karthik.donor@example.com` | `Donor@123` | Karthik (O+ blood group, accepts alerts) |
| **Admin** | `admin@bloodlink.gov.in` | `Admin@BloodLink2025` | Platform Administrator (monitors stats, verifies hospitals) |

*(Alternative accounts configured for Postman suite: `citycare@hospital.org` / `Hosp@12345`, `john.donor@example.com` / `Donor@12345`, `admin@blooddonor.org` / `Admin@12345`)*

---

## 🎯 3. EXACT 3-MINUTE DEMO SCRIPT (Follow This Step-by-Step)

### Step 1: Show the Landing Page (30 seconds)
- **What to say**:
  > *"Mam, this is BloodLink — a real-time emergency response platform connecting hospital ICUs directly with compatible voluntary blood donors. These live counters on the home page are directly queried from our SQLite database via our `/api/public/stats` endpoint."*

### Step 2: Hospital Creates Emergency Request (45 seconds)
- Log in as Hospital: `emergency@apollohospitals.org` / `Hospital@123`.
- Click **"Create Emergency Request"**.
- Select:
  - Patient Blood Group: **A+**
  - Urgency: **CRITICAL**
  - Required Units: **2**
  - Area: **Thousand Lights**, City: **Chennai**, Pincode: **600006**.
- Click **"Broadcast Emergency Request"**.
- **What to say**:
  > *"Mam, when Apollo Hospital posts this emergency, our backend blood compatibility algorithm triggers automatically. It calculates that an A+ patient can accept blood from A+, A-, O+, and O- donors, and filters only available donors in Chennai without chronic illnesses."*

### Step 3: Donor Receives & Accepts the Alert (45 seconds)
- In the Incognito tab, log in as Donor: `karthik.donor@example.com` / `Donor@123`.
- Go to **"Emergency Requests"**. The Apollo Hospital request is right at the top.
- Click **"Accept"**, type note: *"On my way, reaching in 15 mins"*, and submit.
- **What to say**:
  > *"Mam, Karthik is O+ (universal red cell donor). The alert appeared on his dashboard immediately. As soon as Karthik accepted, the database status changed from SEARCHING to RESPONSE_RECEIVED, and his availability was temporarily marked busy to prevent double-booking."*

### Step 4: Hospital Sees Donor Contact Details & Fulfills (30 seconds)
- Switch back to the Hospital tab.
- Click **"Active Requests"** $\rightarrow$ Click on the request.
- Show Karthik's name and direct contact phone number (`+91 98401 23456`).
- Click **"Mark as Fulfilled"**.
- **What to say**:
  > *"Mam, the hospital immediately gets the donor's contact phone number to coordinate arrival. Once the transfusion is complete, the hospital marks it FULFILLED, which automatically logs a verified entry in Karthik's permanent donation history."*

### Step 5: Admin Portal (30 seconds)
- Log in as Admin: `admin@bloodlink.gov.in` / `Admin@BloodLink2025`.
- Show Platform Statistics, Donors list, Hospitals verification, and emergency requests monitoring.
- **What to say**:
  > *"Mam, the Admin dashboard provides real-time oversight of all requests across all hospitals, allows approving or rejecting hospital licenses, and can suspend fraudulent accounts instantly."*

---

## 🛠️ 4. WHAT TO SHOW IF MAM ASKS SPECIFIC QUESTIONS

### Question 1: "Show me the Database!"
- **Action**: Open `server/database.sqlite` in **DB Browser for SQLite**.
- **What to say**:
  > *"Mam, we are using an ACID-compliant relational SQLite database with 6 tables connected via foreign keys and CASCADE delete:*
  > 1. `users`: Stores login credentials with bcrypt hashed passwords and user roles.
  > 2. `donors`: Stores blood group, weight, chronic illness status, and location.
  > 3. `hospitals`: Stores hospital license number, emergency hotline, and verification status.
  > 4. `emergency_requests`: Stores patient blood group, units needed, urgency level, and request status.
  > 5. `donor_responses`: Stores whether donors accepted or rejected with notes.
  > 6. `donation_history`: Stores verified permanent donation records.*
  > *All tables use foreign keys and transactions to ensure zero data corruption."*

### Question 2: "Show me your API / Postman!"
- **Action**: Switch to Postman or run `node test_runner.js`.
- In Postman:
  - Click on `Blood Donor Emergency Response Platform API` collection.
  - Show the 5 folders:
    1. *System Health* (`GET /api/health`)
    2. *Authentication* (Register & Login with JWT token storage)
    3. *Hospital Management* (Create request, view responses)
    4. *Donor Operations* (Toggle availability, accept alerts)
    5. *Admin Operations* (Platform statistics, donor/hospital rosters)
- Run collection or run terminal:
  ```powershell
  node test_runner.js
  ```
- **What to say**:
  > *"Mam, we tested all 16 endpoints end-to-end. Our automated test suite checks health, authentication, token verification, emergency broadcasting, donor responses, fulfillment, and role-based 403 Forbidden security checks. All 16 passed with 100% success rate."*

### Question 3: "How is security handled?"
- **What to say**:
  > *"Mam, security is handled at three levels:*
  > 1. **Password Security**: Passwords are never stored in plaintext — we hash them with bcrypt with 10 salt rounds.
  > 2. **Token Security**: We use JSON Web Tokens (JWT) signed with HMAC-SHA256 with a 7-day expiration.
  > 3. **Role-Based Authorization (RBAC)**: Our `authMiddleware` checks user roles on every request. If a donor attempts to call an admin API or hospital API, the backend immediately blocks them with HTTP 403 Forbidden."*

### Question 4: "What is your Blood Compatibility Logic?"
- **What to say**:
  > *"Mam, blood transfusion follows strict biological rules:
  > - O- is the universal donor — can donate to all 8 blood groups.
  > - AB+ is the universal recipient — can receive from all groups.
  > - An A+ patient can only receive from A+, A-, O+, and O-.
  > We implemented this compatibility matrix directly in our business logic (`bloodCompatibility.js`), so when a hospital asks for blood, only medically compatible donors are queried and notified."*
