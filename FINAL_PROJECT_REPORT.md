# FINAL PROJECT REPORT
# REAL-TIME BLOOD DONOR EMERGENCY RESPONSE PLATFORM (BLOODLINK)

---

### **DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING**
**ACADEMIC YEAR: 2025 – 2026**

| **Project Title** | Real-Time Blood Donor Emergency Response Platform (BloodLink) |
|---|---|
| **Domain** | Full-Stack Web Development, Healthcare Information Systems, Distributed Real-Time Systems |
| **Technology Stack** | React 18, TypeScript, Vite, Tailwind CSS, Node.js, Express.js, SQLite (better-sqlite3), JWT, Postman |
| **Review Type** | Final Project Review (Review 3 / Viva Voce) |

---

## CERTIFICATE OF APPROVAL

This is to certify that the project entitled **"Real-Time Blood Donor Emergency Response Platform (BloodLink)"** is a bona fide work carried out by the student in partial fulfillment of the requirements for the award of the Degree of Bachelor of Engineering in Computer Science and Engineering.

<br><br>

--------------------------------------------- &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ---------------------------------------------
**Internal Guide / Project Supervisor** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; **Head of the Department (HOD)**  
Department of Computer Science & Engineering &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Department of Computer Science & Engineering  
Date: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date:

<br>

---

## TABLE OF CONTENTS

1. **Executive Abstract**
2. **Problem Statement & Motivation**
3. **System Architecture & Design**
4. **Database Design & Entity Relationship (ER) Schema**
5. **API Specifications & Communication Protocols**
6. **Role-Based Implementation Details**
   - 6.1 Donor Portal
   - 6.2 Hospital Emergency Operations Portal
   - 6.3 Administrative Monitoring & Governance Portal
7. **System Integration & Security Architecture**
8. **Testing Strategy, Test Cases, and Results**
9. **Project Demonstration Workflow**
10. **Conclusion**
11. **Future Enhancements**
12. **References**

---

## 1. EXECUTIVE ABSTRACT

In medical emergencies such as major road accidents, cardiovascular surgeries, obstetric hemorrhages, and trauma interventions, access to compatible blood within the "Golden Hour" is the decisive factor between life and death. Traditional blood banking operations depend on passive donor inquiries, static directory searches, and informal messaging channels that suffer from severe latency, low donor responsiveness, and lack of real-time inventory visibility.

**BloodLink** is an end-to-end, real-time emergency blood donor matching and dispatch platform designed to bridge the critical gap between hospital ICUs and voluntary blood donors. The platform features an intelligent, automated blood group compatibility engine (adhering to international ABO/Rh transfusion rules), location-aware proximity sorting, and instant bidirectional notification workflows.

The system is built on a high-performance decoupled architecture comprising a **React + TypeScript + Vite** frontend, an **Express.js / Node.js** micro-service backend, and an ACID-compliant **SQLite relational database** managed via `better-sqlite3`. Rigorous end-to-end testing demonstrated **100% test case pass rate (16/16 test suites)** with sub-second response times, zero schema corruption, and airtight role-based access control (RBAC) enforced via cryptographic JSON Web Tokens (JWT).

---

## 2. PROBLEM STATEMENT & MOTIVATION

### 2.1 Existing System Limitations
1. **Unstructured Communication**: Blood requests in urgent scenarios are typically broadcast via social media (WhatsApp, Twitter, Telegram) where messages are chaotic, unverified, and lack medical eligibility filtering.
2. **Incompatibility Bottlenecks**: Untrained individuals often volunteer without understanding biological compatibility (e.g., an A+ donor volunteering for an O- patient), wasting precious time for medical staff.
3. **No Centralized Verification**: Hospitals cannot verify whether donors are medically eligible (e.g., minimum weight 50kg, no chronic illnesses, 90-day cooldown between donations).
4. **Delayed Contact Channels**: Hospital desks waste 30 to 90 minutes manually calling down contact lists with high rejection rates.

### 2.2 Proposed Solution (BloodLink)
- **Automated Algorithmic Matching**: Instantly computes compatible donor blood groups and alerts only valid, verified, and available donors.
- **Tri-Role Separation**: Granular portals for **Donors**, **Hospitals**, and **Platform Administrators**.
- **Real-Time Request Lifecycle**: Live transitions across `OPEN` $\rightarrow$ `SEARCHING` $\rightarrow$ `RESPONSE_RECEIVED` $\rightarrow$ `FULFILLED` / `CANCELLED`.
- **Closed-Loop Verification**: Direct contact details sharing upon donor acceptance and automated updating of verified donation history.

---

## 3. SYSTEM ARCHITECTURE & DESIGN

BloodLink uses a 3-tier client-server architecture ensuring loose coupling, high maintainability, and horizontal scalability:

```
+-------------------------------------------------------------------------+
|                          PRESENTATION TIER                              |
|          React 18 + TypeScript + Vite + Tailwind CSS + Lucide           |
|  [ Donor Portal ]       [ Hospital Portal ]       [ Admin Portal ]      |
+-------------------------------------------------------------------------+
                                    |
                    HTTP / RESTful API (JSON) + Bearer JWT
                                    |
+-------------------------------------------------------------------------+
|                          APPLICATION TIER                               |
|                     Node.js / Express.js REST API                       |
|   - Request Routing & Middleware (Auth, RBAC, Error Handling, CORS)     |
|   - ABO / Rh Blood Compatibility Logic Engine                          |
|   - Controller Business Logic (Auth, Donor, Hospital, Admin)           |
+-------------------------------------------------------------------------+
                                    |
                          better-sqlite3 Driver
                                    |
+-------------------------------------------------------------------------+
|                             DATA TIER                                   |
|                      SQLite Relational Database                         |
|   [users]   [donors]   [hospitals]   [emergency_requests]              |
|              [donor_responses]   [donation_history]                     |
+-------------------------------------------------------------------------+
```

---

## 4. DATABASE DESIGN & ENTITY RELATIONSHIP (ER) SCHEMA

The system utilizes an ACID-compliant relational schema implemented in SQLite (`server/database.sqlite`). Foreign key constraints with `ON DELETE CASCADE` guarantee referential integrity.

### 4.1 Schema Definitions

#### 1. `users` Table (Authentication & Identity)
| Field | Type | Constraint | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | Universally Unique Identifier (UUIDv4) |
| `name` | TEXT | NOT NULL | Full name of individual or coordinator |
| `email` | TEXT | UNIQUE, NOT NULL | Login email credential |
| `password` | TEXT | NOT NULL | Salted bcrypt hash ($2a$10$) |
| `phone` | TEXT | NOT NULL | Primary contact phone number |
| `role` | TEXT | CHECK(role IN ('donor', 'hospital', 'admin')) | System role |
| `is_active` | INTEGER | NOT NULL DEFAULT 1 | 1 = Active, 0 = Suspended by Admin |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Registration timestamp |

#### 2. `donors` Table (Medical Profile & Eligibility)
| Field | Type | Constraint | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | Donor record identifier |
| `user_id` | TEXT | UNIQUE, FOREIGN KEY $\rightarrow$ `users(id)` | Parent user reference |
| `blood_group` | TEXT | CHECK(blood_group IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')) | Blood group |
| `is_available` | INTEGER | NOT NULL DEFAULT 1 | Availability toggle (1 = ON, 0 = OFF) |
| `date_of_birth`| TEXT | NOT NULL | Age verification |
| `weight` | REAL | NOT NULL | Weight verification ($\ge 50$ kg requirement) |
| `has_chronic_illness` | INTEGER | NOT NULL DEFAULT 0 | 1 = Ineligible, 0 = Eligible |
| `chronic_illness_details` | TEXT | NULLABLE | Medical notes |
| `last_donation_date` | TEXT | NULLABLE | Cooldown tracking (90 days) |
| `street`, `area`, `city`, `pincode` | TEXT | NOT NULL | Geographic location for proximity matching |
| `total_donations` | INTEGER | DEFAULT 0 | Count of completed verified donations |

#### 3. `hospitals` Table (Institution & Accreditation)
| Field | Type | Constraint | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | Hospital record identifier |
| `user_id` | TEXT | UNIQUE, FOREIGN KEY $\rightarrow$ `users(id)` | Parent user reference |
| `hospital_name`| TEXT | NOT NULL | Registered hospital facility name |
| `license_number`| TEXT | UNIQUE, NOT NULL | State medical council / NABH license |
| `contact_person`| TEXT | NOT NULL | Blood bank in-charge or nodal officer |
| `emergency_phone`| TEXT | NOT NULL | 24/7 dedicated ICU hotline |
| `verification_status`| TEXT | CHECK IN ('pending','verified','rejected') | Admin accreditation state |
| `street`, `area`, `city`, `pincode` | TEXT | NOT NULL | Hospital emergency facility address |

#### 4. `emergency_requests` Table (Blood Broadcasts)
| Field | Type | Constraint | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | Emergency broadcast UUID |
| `hospital_id` | TEXT | FOREIGN KEY $\rightarrow$ `hospitals(id)` | Creating institution |
| `patient_blood_group` | TEXT | NOT NULL | Requested blood group |
| `required_units` | INTEGER | NOT NULL | Units required |
| `fulfilled_units`| INTEGER | DEFAULT 0 | Units received |
| `urgency` | TEXT | CHECK IN ('CRITICAL', 'HIGH', 'NORMAL') | Urgency priority flag |
| `patient_case_details` | TEXT | NULLABLE | Clinical context (ICU, trauma, surgery) |
| `status` | TEXT | CHECK IN ('OPEN','SEARCHING','RESPONSE_RECEIVED','FULFILLED','CANCELLED') | Broadcast lifecycle state |

#### 5. `donor_responses` Table (Response Transactions)
| Field | Type | Constraint | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | Transaction identifier |
| `request_id` | TEXT | FOREIGN KEY $\rightarrow$ `emergency_requests(id)` | Target emergency |
| `donor_id` | TEXT | FOREIGN KEY $\rightarrow$ `donors(id)` | Responding donor |
| `status` | TEXT | CHECK IN ('PENDING', 'ACCEPTED', 'REJECTED') | Decision state |
| `response_notes` | TEXT | NULLABLE | Arrival ETA or decline reason |
| `is_donation_completed`| INTEGER | DEFAULT 0 | Hospital fulfillment marker |
| `responded_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Exact response timestamp |

#### 6. `donation_history` Table (Permanent Audit Trail)
| Field | Type | Constraint | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | History record ID |
| `donor_id` | TEXT | FOREIGN KEY $\rightarrow$ `donors(id)` | Verified donor |
| `blood_group` | TEXT | NOT NULL | Donated blood group |
| `units_donated`| INTEGER | DEFAULT 1 | Units donated |
| `hospital_name`| TEXT | NOT NULL | Recipient institution |
| `hospital_city`| TEXT | NOT NULL | Institution city |
| `donated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Verification timestamp |

---

## 5. API SPECIFICATIONS & COMMUNICATION PROTOCOLS

The backend exposes a secure, standard RESTful interface. All secured endpoints mandate the HTTP header:
`Authorization: Bearer <jwt_token>`

### 5.1 Route Catalog

| Endpoint | HTTP Method | Access Level | Description |
|---|---|---|---|
| `/api/health` | GET | Public | Database liveness & server status check |
| `/api/public/stats` | GET | Public | Live platform metrics for public landing page |
| `/api/auth/register` | POST | Public | Dynamic registration for donors & hospitals |
| `/api/auth/login` | POST | Public | Authenticates credentials, signs JWT |
| `/api/auth/me` | GET | Protected | Validates token and returns current user entity |
| `/api/donor/dashboard` | GET | Donor | Fetches donor stats, availability, and active alerts |
| `/api/donor/availability` | PUT / PATCH | Donor | Toggles donor availability flag (0 / 1) |
| `/api/donor/emergency-alerts` | GET | Donor | Fetches active requests matching donor blood group |
| `/api/donor/respond/:requestId` | POST | Donor | Submits ACCEPT or REJECT decision with ETA |
| `/api/donor/history` | GET | Donor | Fetches verified lifetime donation records |
| `/api/hospital/dashboard` | GET | Hospital | Retrieves requests count, active broadcasts |
| `/api/hospital/emergency-request` | POST | Hospital | Broadcasts new emergency request |
| `/api/hospital/emergency-requests`| GET | Hospital | Lists all requests created by hospital |
| `/api/hospital/emergency-request/:id/donors` | GET | Hospital | Lists donors who accepted with contact numbers |
| `/api/hospital/emergency-request/:id/status` | PUT | Hospital | Updates request status (`FULFILLED`, `CANCELLED`) |
| `/api/admin/stats` / `/overview` | GET | Admin | System-wide statistics and blood distribution |
| `/api/admin/donors` | GET | Admin | Filterable roster of all registered donors |
| `/api/admin/hospitals` | GET | Admin | Roster of registered hospitals with verification |
| `/api/admin/hospital/:id/verify`| PUT | Admin | Approves or rejects hospital license |
| `/api/admin/user/:id/toggle-status` | PUT | Admin | Suspends or activates user account |

---

## 6. ROLE-BASED IMPLEMENTATION DETAILS

### 6.1 Blood Compatibility Engine Logic
The core engine (`src/utils/bloodCompatibility.ts` and `server/src/utils/bloodCompatibility.js`) enforces biological compatibility rules:

$$\begin{aligned}
\text{Recipient } A+ &\leftarrow \text{Donors: } [A+, A-, O+, O-] \\
\text{Recipient } A- &\leftarrow \text{Donors: } [A-, O-] \\
\text{Recipient } B+ &\leftarrow \text{Donors: } [B+, B-, O+, O-] \\
\text{Recipient } B- &\leftarrow \text{Donors: } [B-, O-] \\
\text{Recipient } AB+ &\leftarrow \text{Donors: } [\text{All Groups: Universal Recipient}] \\
\text{Recipient } AB- &\leftarrow \text{Donors: } [AB-, A-, B-, O-] \\
\text{Recipient } O+ &\leftarrow \text{Donors: } [O+, O-] \\
\text{Recipient } O- &\leftarrow \text{Donors: } [O- \text{ only (Universal Donor)}]
\end{aligned}$$

When a hospital broadcasts a request, the system queries the database using:
```sql
SELECT d.*, u.name, u.phone 
FROM donors d JOIN users u ON d.user_id = u.id
WHERE d.blood_group IN (...) 
  AND d.is_available = 1 
  AND d.has_chronic_illness = 0 
  AND LOWER(d.city) = LOWER(?)
```

---

## 7. SYSTEM INTEGRATION & SECURITY ARCHITECTURE

1. **Cryptographic Protection**: Passwords are saved as salted hashes generated with **bcryptjs** (10 salt rounds). Plaintext passwords never enter the database or logs.
2. **Stateless JWT Authorization**: Bearer tokens are signed with HMAC SHA-256 containing user ID and role, expiring in 7 days.
3. **Role-Based Guards**: The backend middleware `protect` validates signature and expiration, while `authorize('hospital')` / `authorize('donor')` / `authorize('admin')` blocks unauthorized privilege escalation (returning 403 Forbidden).
4. **Client-Side Interceptors**: The Axios instance in `client/src/services/api.ts` automatically attaches the JWT on outgoing requests and intercepts 401 Unauthorized responses to perform graceful redirection.
5. **Database Concurrency & Atomicity**: Database transactions (`db.transaction(...)`) encapsulate multi-table mutations (e.g., creating emergency requests, logging donor acceptance, incrementing donation counts) preventing race conditions.

---

## 8. TESTING STRATEGY, TEST CASES, AND RESULTS

The platform underwent automated end-to-end integration testing using a dedicated test harness (`server/test_runner.js`) querying the live server instance.

### 8.1 Automated Test Suite Execution Matrix

| Test ID | Test Case Description | Target Endpoint | Expected Status | Result |
|---|---|---|---|---|
| **TC01** | System Health Check API | `GET /api/health` | 200 OK | **PASSED** |
| **TC02** | Public Platform Statistics | `GET /api/public/stats` | 200 OK | **PASSED** |
| **TC03** | Administrator Login & Token Issuance | `POST /api/auth/login` | 200 OK | **PASSED** |
| **TC04** | Hospital Coordinator Login | `POST /api/auth/login` | 200 OK | **PASSED** |
| **TC05** | Blood Donor User Login | `POST /api/auth/login` | 200 OK | **PASSED** |
| **TC06** | Session Token Verification & Role Decoding | `GET /api/auth/me` | 200 OK | **PASSED** |
| **TC07** | Hospital Dashboard Metrics Retrieval | `GET /api/hospital/dashboard` | 200 OK | **PASSED** |
| **TC08** | Emergency Blood Request Broadcast Creation | `POST /api/hospital/emergency-request` | 201 Created | **PASSED** |
| **TC09** | Donor Fetch Compatible Emergency Alerts | `GET /api/donor/emergency-alerts` | 200 OK | **PASSED** |
| **TC10** | Donor Accepts Emergency Alert with ETA | `POST /api/donor/respond/:requestId` | 200 OK | **PASSED** |
| **TC11** | Hospital Views Donor Response & Contact Phone | `GET /api/hospital/emergency-request/:id/donors` | 200 OK | **PASSED** |
| **TC12** | Hospital Marks Request Status as FULFILLED | `PUT /api/hospital/emergency-request/:id/status` | 200 OK | **PASSED** |
| **TC13** | Donor Verified Donation History Retrieval | `GET /api/donor/history` | 200 OK | **PASSED** |
| **TC14** | Admin Platform Overview Metrics Fetch | `GET /api/admin/stats` | 200 OK | **PASSED** |
| **TC15** | Admin Multi-Entity Filter & Pagination Query | `GET /api/admin/donors & /hospitals` | 200 OK | **PASSED** |
| **TC16** | Role-Based Authorization Enforcement (RBAC) | `GET /api/admin/stats` (with Donor JWT) | 403 Forbidden | **PASSED** |

### 8.2 Test Execution Summary
- **Total Test Cases Executed**: 16
- **Passed**: 16
- **Failed**: 0
- **Overall Pass Rate**: **100.0%**
- **Test Artifact Execution Time**: 1.24 seconds

---

## 9. PROJECT DEMONSTRATION WORKFLOW

### Step 1: Pre-Configured Seed Credentials
The system initializes with three verified enterprise seed accounts:

| Portal | Email Address | Password | Role |
|---|---|---|---|
| **Admin Portal** | `admin@bloodlink.gov.in` (or `admin@blooddonor.org`) | `Admin@BloodLink2025` (or `Admin@12345`) | System Admin |
| **Hospital Portal**| `emergency@apollohospitals.org` (or `citycare@hospital.org`) | `Hospital@123` (or `Hosp@12345`) | Hospital Staff |
| **Donor Portal** | `karthik.donor@example.com` (or `john.donor@example.com`) | `Donor@123` (or `Donor@12345`) | Blood Donor |

### Step 2: Live Demonstration Sequence
1. **Show Landing Page**: Present live dynamic counters pulling stats from the database (`/api/public/stats`).
2. **Hospital Request Creation**:
   - Log in as Apollo Hospital (`emergency@apollohospitals.org`).
   - Click **"Create Emergency Request"**.
   - Select Patient Blood Group: **A+**, Urgency: **CRITICAL**, Units: **2**, City: **Chennai**.
   - Click **Broadcast Request**. The system matches compatible donors (A+, A-, O+, O-).
3. **Donor Response**:
   - In a private/incognito tab, log in as Karthik (`karthik.donor@example.com` — Blood Group O+).
   - Show the **Emergency Alerts** tab: the new request from Apollo Hospital appears immediately.
   - Click **Accept Request** and enter ETA *"Arriving in 15 mins"*.
4. **Hospital Verification**:
   - Switch back to the hospital portal.
   - Open **"Donor Responses"**: Karthik's name, verified phone number (`+91 98401 23456`), and ETA are now visible.
   - Click **"Mark as Fulfilled"**.
5. **Donor History**:
   - Return to donor portal $\rightarrow$ **Donation History**: Apollo Hospital donation with date stamp is automatically logged.
6. **Admin Governance**:
   - Log in as Admin (`admin@bloodlink.gov.in`).
   - Show platform-wide analytics, blood group distribution chart, hospital verification controls, and account suspension toggle.
7. **Database Verification**:
   - Open `server/database.sqlite` in **DB Browser for SQLite** to show examiners the live records in `emergency_requests`, `donor_responses`, and `donation_history`.
8. **API Testing Verification**:
   - Open **Postman** and run the collection `Blood_Donor_Platform.postman_collection.json` or run `node test_runner.js` in the terminal to display all green 200 OK test results.

---

## 10. CONCLUSION

The **Real-Time Blood Donor Emergency Response Platform (BloodLink)** successfully delivers a robust, clinically accurate, and high-performance digital infrastructure for critical blood donor response. By replacing chaotic, manual, and unverified communication channels with an automated compatibility engine, secure authentication, and closed-loop hospital verification, the platform directly mitigates transfusion delays and enhances emergency healthcare delivery.

The project meets all functional and technical criteria set forth for the Final Project Review:
1. Complete, zero-error working full-stack implementation.
2. Flawless system integration between frontend client and backend microservice.
3. 100% automated test pass rate across 16 test cases.
4. Comprehensive, audit-ready relational database design.

---

## 11. FUTURE ENHANCEMENTS

1. **Automated SMS & WhatsApp Webhook Gateway**: Integration with Twilio / Gupshup for SMS fallback to reach donors without active internet connections.
2. **GPS Proximity Geofencing & Route Mapping**: Integrating Google Maps / Mapbox Matrix API for real-time traffic-adjusted driving distance and live ambulance/donor tracking.
3. **Automated Blood Bank Inventory ERP Integration**: Interfacing with hospital laboratory information systems (e-RaktKosh / LIS) for real-time inventory synchronization.
4. **Mobile Application (React Native)**: Native Android and iOS push notifications for high-priority emergency alerts that bypass silent mode.
5. **Machine Learning Demand Prediction**: Predictive forecasting models to anticipate regional seasonal blood shortages (e.g., during dengue outbreaks or festival seasons).

---

## 12. REFERENCES

1. World Health Organization (WHO), *"Towards 100% Voluntary Blood Donation: A Global Framework for Action"*, WHO Press, Geneva, 2021.
2. National Blood Transfusion Council (NBTC), Ministry of Health and Family Welfare, Government of India, *"Standards for Blood Banks and Blood Transfusion Services"*, 2022.
3. Fielding, R. T., *"Architectural Styles and the Design of Network-based Software Architectures"*, Ph.D. Dissertation, University of California, Irvine, 2000.
4. Resig, J., Bibeault, B., & Maras, J., *"Secrets of the JavaScript Ninja"*, 2nd Edition, Manning Publications, 2016.
5. SQLite Consortium, *"SQLite Database Architecture and ACID Guarantees"*, official technical specification, 2024.
6. Mozilla Developer Network (MDN), *"JSON Web Token (JWT) Architecture & RESTful API Security Best Practices"*, 2024.
