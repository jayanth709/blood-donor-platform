const http = require('http');
const app = require('./app');
const { connectDB } = require('./src/config/db');
const { createTables } = require('./src/config/schema');
const seedDatabase = require('./src/utils/seedAdmin');

// Ensure DB is ready
connectDB();
createTables();
seedDatabase();

const server = http.createServer(app);
const TEST_PORT = 5099;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: `/api${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

server.listen(TEST_PORT, async () => {
  console.log(`\n======================================================`);
  console.log(`🩸 BLOODLINK SYSTEM INTEGRATION & END-TO-END TEST SUITE`);
  console.log(`======================================================\n`);

  const results = [];
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      const res = await fn();
      passed++;
      results.push({ name, status: 'PASSED', details: res });
      console.log(`  ✓ [PASS] ${name}`);
    } catch (err) {
      failed++;
      results.push({ name, status: 'FAILED', error: err.message });
      console.log(`  ✗ [FAIL] ${name} -> ${err.message}`);
    }
  }

  let adminToken = '';
  let hospitalToken = '';
  let donorToken = '';
  let createdRequestId = '';

  // 1. Health Check
  await test('TC01: System Health Check API (GET /health)', async () => {
    const res = await request('GET', '/health');
    if (res.status !== 200 || !res.body.success) throw new Error(`Unexpected status ${res.status}`);
    return `Status 200, DB: ${res.body.database}`;
  });

  // 2. Public Platform Statistics
  await test('TC02: Public Platform Statistics (GET /public/stats)', async () => {
    const res = await request('GET', '/public/stats');
    if (res.status !== 200 || !res.body.success) throw new Error(`Status ${res.status}`);
    return `Donors: ${res.body.stats.totalDonors}, Hospitals: ${res.body.stats.totalHospitals}`;
  });

  // 3. Admin Authentication
  await test('TC03: Admin User Login (POST /auth/login)', async () => {
    const res = await request('POST', '/auth/login', {
      email: 'admin@bloodlink.gov.in',
      password: 'Admin@BloodLink2025'
    });
    if (res.status !== 200 || !res.body.token) throw new Error(`Login failed: ${res.body.message || res.status}`);
    adminToken = res.body.token;
    return `JWT Token acquired, Role: ${res.body.user.role}`;
  });

  // 4. Hospital Authentication
  await test('TC04: Hospital User Login (POST /auth/login)', async () => {
    const res = await request('POST', '/auth/login', {
      email: 'emergency@apollohospitals.org',
      password: 'Hospital@123'
    });
    if (res.status !== 200 || !res.body.token) throw new Error(`Hospital login failed: ${res.body.message || res.status}`);
    hospitalToken = res.body.token;
    return `Hospital authenticated: ${res.body.user.name}`;
  });

  // 5. Donor Authentication
  await test('TC05: Donor User Login (POST /auth/login)', async () => {
    const res = await request('POST', '/auth/login', {
      email: 'karthik.donor@example.com',
      password: 'Donor@123'
    });
    if (res.status !== 200 || !res.body.token) throw new Error(`Donor login failed: ${res.body.message || res.status}`);
    donorToken = res.body.token;
    return `Donor authenticated: ${res.body.user.name}`;
  });

  // 6. Token Verification & Role Check
  await test('TC06: Current User Verification (GET /auth/me)', async () => {
    const res = await request('GET', '/auth/me', null, donorToken);
    if (res.status !== 200 || res.body.user.role !== 'donor') throw new Error(`Verify failed: ${res.status}`);
    return `Verified user: ${res.body.user.name} (${res.body.user.role})`;
  });

  // 7. Hospital Profile & Dashboard Data
  await test('TC07: Hospital Dashboard Data Fetch (GET /hospital/dashboard)', async () => {
    const res = await request('GET', '/hospital/dashboard', null, hospitalToken);
    if (res.status !== 200 || !res.body.success) throw new Error(`Dashboard fetch failed: ${res.status}`);
    return `Hospital profile retrieved: ${res.body.data.profile.hospital_name}`;
  });

  // 8. Hospital Creates Emergency Broadcast Request
  await test('TC08: Create Emergency Blood Request (POST /hospital/emergency-request)', async () => {
    const res = await request('POST', '/hospital/emergency-request', {
      patient_blood_group: 'A+',
      required_units: 2,
      urgency: 'CRITICAL',
      patient_case_details: 'Emergency cardiac bypass requiring immediate transfusion',
      street: 'Greams Road',
      area: 'Thousand Lights',
      city: 'Chennai',
      pincode: '600006'
    }, hospitalToken);
    if (res.status !== 201 || !res.body.data.id) throw new Error(`Create request failed: ${res.body.message || res.status}`);
    createdRequestId = res.body.data.id;
    return `Request created ID: ${createdRequestId}, Matching Donors: ${res.body.matchingDonors}`;
  });

  // 9. Donor Emergency Alerts Fetch
  await test('TC09: Donor Fetch Compatible Emergency Alerts (GET /donor/emergency-alerts)', async () => {
    const res = await request('GET', '/donor/emergency-alerts', null, donorToken);
    if (res.status !== 200 || !res.body.success) throw new Error(`Fetch alerts failed: ${res.status}`);
    return `Compatible emergency requests found: ${res.body.data.length}`;
  });

  // 10. Donor Responds to Emergency
  await test('TC10: Donor Accepts Emergency Alert (POST /donor/respond/:requestId)', async () => {
    const res = await request('POST', `/donor/respond/${createdRequestId}`, {
      status: 'ACCEPTED',
      response_notes: 'Donor ready and arriving in 20 minutes.'
    }, donorToken);
    if (res.status !== 200 && res.status !== 201) throw new Error(`Response failed: ${res.body.message || res.status}`);
    return `Donor response recorded with status ACCEPTED`;
  });

  // 11. Hospital Views Responded Donors
  await test('TC11: Hospital Views Donor Response & Contact (GET /hospital/emergency-request/:id/donors)', async () => {
    const res = await request('GET', `/hospital/emergency-request/${createdRequestId}/donors`, null, hospitalToken);
    if (res.status !== 200 || !res.body.success) throw new Error(`Fetch donors failed: ${res.status}`);
    const accepted = res.body.responses.find(r => r.status === 'ACCEPTED');
    if (!accepted) throw new Error('Accepted donor not found in hospital view');
    return `Accepted donor found: ${accepted.donor_name}, Phone: ${accepted.phone}`;
  });

  // 12. Hospital Updates Request Status to FULFILLED
  await test('TC12: Hospital Marks Request FULFILLED (PUT /hospital/emergency-request/:id/status)', async () => {
    const res = await request('PUT', `/hospital/emergency-request/${createdRequestId}/status`, {
      status: 'FULFILLED'
    }, hospitalToken);
    if (res.status !== 200 || !res.body.success) throw new Error(`Update status failed: ${res.status}`);
    return `Request marked as FULFILLED`;
  });

  // 13. Donor Donation History Recorded
  await test('TC13: Donor Donation History Retrieval (GET /donor/history)', async () => {
    const res = await request('GET', '/donor/history', null, donorToken);
    if (res.status !== 200 || !res.body.success) throw new Error(`History fetch failed: ${res.status}`);
    return `Donation history records retrieved: ${res.body.data.length}`;
  });

  // 14. Admin Statistics
  await test('TC14: Admin Platform Metrics (GET /admin/stats)', async () => {
    const res = await request('GET', '/admin/stats', null, adminToken);
    if (res.status !== 200 || !res.body.stats) throw new Error(`Admin stats failed: ${res.status}`);
    return `Platform stats: ${res.body.stats.totalUsers} users, ${res.body.stats.totalRequests} requests`;
  });

  // 15. Admin Donors & Hospitals List
  await test('TC15: Admin Entity Management (GET /admin/donors & /admin/hospitals)', async () => {
    const resDonors = await request('GET', '/admin/donors', null, adminToken);
    const resHosp = await request('GET', '/admin/hospitals', null, adminToken);
    if (resDonors.status !== 200 || resHosp.status !== 200) throw new Error('Admin listing failed');
    return `Donors: ${resDonors.body.data.length}, Hospitals: ${resHosp.body.data.length}`;
  });

  // 16. Security & Authorization Test (Forbidden access check)
  await test('TC16: Role-Based Authorization Enforcement (Donor blocked from Admin API)', async () => {
    const res = await request('GET', '/admin/stats', null, donorToken);
    if (res.status !== 403) throw new Error(`Expected status 403 Forbidden, got ${res.status}`);
    return `Correctly blocked with 403 Forbidden`;
  });

  console.log(`\n======================================================`);
  console.log(`🏁 TEST EXECUTION SUMMARY`);
  console.log(`   Total Tests: ${results.length}`);
  console.log(`   Passed:      ${passed}`);
  console.log(`   Failed:      ${failed}`);
  console.log(`   Pass Rate:   ${((passed / results.length) * 100).toFixed(1)}%`);
  console.log(`======================================================\n`);

  server.close();
  process.exit(failed > 0 ? 1 : 0);
});
