// This script requires the xk6-sql extension for k6.
// Build it by running: k6 build --with github.com/grafana/xk6-sql
//
// --- HOW TO RUN ---
// Use the -e flag to pass the SCENARIO environment variable.
//
// To run BASELINE test:
// k6 run -e SCENARIO=baseline_load postgres-test.js
//
// To run PEAK test:
// k6 run -e SCENARIO=peak_load postgres-test.js
//
// To run SPIKE test:
// k6 run -e SCENARIO=spike_load postgres-test.js

import sql from 'k6/x/sql';
import { check } from 'k6';
import { Trend } from 'k6/metrics';

// --- Configuration ---
// These settings match the StatefulSet manifest and the port-forward command.
const dbHost = '127.0.0.1'; // localhost, because of port-forwarding
const dbPort = 5432;
const dbUser = 'user';
const dbPassword = 'mysecretpassword';
const dbName = 'testdb';

// --- CHANGE ---
// Switched from a URL-based connection string to a key-value pair format.
// This is often more robust and can resolve parsing errors in the database driver.
// We are also explicitly disabling SSL, which is necessary for port-forwarding.
const connectionString = `host=${dbHost} port=${dbPort} user=${dbUser} password=${dbPassword} dbname=${dbName} sslmode=disable`;

// Open the database connection
const db = sql.open('postgres', connectionString);

// --- Custom Metrics ---
// We'll create custom trends to measure the duration of each query type.
const insertTrend = new Trend('db_insert_duration');
const selectTrend = new Trend('db_select_duration');
const countTrend = new Trend('db_count_duration');

// --- Test Scenarios ---
export const options = {
  scenarios: {
    // Scenario 1: A steady, low-level load
    baseline_load: {
      executor: 'constant-vus',
      vus: 10,
      duration: '5m',
      // Only run this scenario if SCENARIO is 'baseline_load' or not set
      env: { SCENARIO: 'baseline_load' },
      exec: 'db_operations',
    },
    // Scenario 2: A sustained high load
    peak_load: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '2m', target: 50 },
        { duration: '5m', target: 50 },
        { duration: '1m', target: 0 },
      ],
      env: { SCENARIO: 'peak_load' },
      exec: 'db_operations',
    },
    // Scenario 3: A sudden, short burst of traffic
    spike_load: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '30s', target: 150 },
        { duration: '1m', target: 150 },
        { duration: '30s', target: 0 },
      ],
      env: { SCENARIO: 'spike_load' },
      exec: 'db_operations',
    },
  },
  thresholds: {
    'db_insert_duration': ['p(95)<100'], // 95% of inserts should be under 100ms
  },
};

// --- Setup Function (runs once before the test) ---
export function setup() {
  // Create a table for our test if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS k6_test (
      id SERIAL PRIMARY KEY,
      value TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

// --- Teardown Function (runs once after the test) ---
export function teardown() {
  // Clean up by dropping the table and closing the connection
  db.exec('DROP TABLE IF EXISTS k6_test;');
  db.close();
}

// --- Main Test Function, now named for exporting ---
export function db_operations() {
  // 1. Write Operation: INSERT a new row
  const insertValue = `k6-test-value-${__VU}-${__ITER}`;
  let start = new Date();
  let res = db.exec(`INSERT INTO k6_test (value) VALUES ('${insertValue}') RETURNING id;`);
  insertTrend.add(new Date() - start);
  check(res, { 'insert successful': (r) => r.rowsAffected === 1 });

  // Extract the ID of the newly inserted row
  const newId = res.rows[0].id;

  // 2. Read Operation: SELECT the row we just inserted
  start = new Date();
  let row = db.query(`SELECT id, value FROM k6_test WHERE id = ${newId};`);
  selectTrend.add(new Date() - start);
  check(row, { 'select successful': (r) => r.length === 1 && r[0].id === newId });

  // 3. Read Operation: Perform a table scan
  start = new Date();
  let count = db.query('SELECT COUNT(*) FROM k6_test;');
  countTrend.add(new Date() - start);
  check(count, { 'count successful': (r) => r.length === 1 });
}