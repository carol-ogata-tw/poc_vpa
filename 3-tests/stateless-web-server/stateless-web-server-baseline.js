import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * k6 More Stressful Baseline Load Test
 *
 * Simulates a busier but steady stream of traffic to your application.
 * VUs are increased and sleep time is reduced to generate more load.
 *
 * How to run:
 * 1. Make sure k6 is installed.
 * 2. Get the external IP of your 'nginx-load-balancer' service.
 * 3. Run the script from your terminal:
 * k6 run -e TARGET_URL='http://<YOUR_LOAD_BALANCER_IP>' baseline_load.js
 */

// A friendly message to remind the user to set the TARGET_URL
if (!__ENV.TARGET_URL) {
  console.error("Please set the TARGET_URL environment variable. Ex: k6 run -e TARGET_URL='http://123.45.67.89' baseline_load.js");
}

export const options = {
  // Stages define the ramp-up and ramp-down of virtual users (VUs)
  stages: [
    { duration: '1m', target: 50 }, // 1. Ramp-up to 50 users over 1 minute
    { duration: '3m', target: 50 }, // 2. Stay at 50 users for 3 minutes
    { duration: '1m', target: 0 },  // 3. Ramp-down to 0 users over 1 minute
  ],
  // Thresholds are the pass/fail criteria for the test
  thresholds: {
    'http_req_failed': ['rate<0.01'],   // HTTP errors should be less than 1%
    'http_req_duration': ['p(95)<250'], // 95% of requests should complete in under 250ms
  },
};

export default function () {
  // The main test function
  const target = __ENV.TARGET_URL || 'http://localhost';
  const res = http.get(target);

  // Check if the HTTP response status is 200 (OK)
  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  // --- CHANGE ---
  // Wait time is reduced to increase the request rate.
  sleep(0.5);
}
