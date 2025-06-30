import http from 'k6/http';
import { check } from 'k6';

/**
 * k6 More Stressful Peak Load Test
 *
 * Simulates very heavy traffic. VUs are much higher and there is no
 * artificial pause between requests, leading to a much higher request rate.
 *
 * How to run:
 * 1. Make sure k6 is installed.
 * 2. Get the external IP of your 'nginx-load-balancer' service.
 * 3. Run the script from your terminal:
 * k6 run -e TARGET_URL='http://<YOUR_LOAD_BALANCER_IP>' peak_load.js
 */

// A friendly message to remind the user to set the TARGET_URL
if (!__ENV.TARGET_URL) {
  console.error("Please set the TARGET_URL environment variable. Ex: k6 run -e TARGET_URL='http://123.45.67.89' peak_load.js");
}

export const options = {
  // Stages for simulating more stressful peak traffic
  stages: [
    { duration: '2m', target: 500 }, // 1. Ramp-up to 500 users over 2 minutes
    { duration: '5m', target: 500 }, // 2. Stay at 500 users for 5 minutes
    { duration: '2m', target: 0 },   // 3. Ramp-down to 0 users over 2 minutes
  ],
  // Thresholds for peak load conditions
  thresholds: {
    'http_req_failed': ['rate<0.05'],   // Allow a slightly higher error rate (less than 5%)
    'http_req_duration': ['p(95)<800'], // 95% of requests should complete in under 800ms
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
  // sleep() is removed to send requests as fast as possible.
}
