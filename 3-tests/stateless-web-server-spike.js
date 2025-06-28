import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * k6 Spike Test
 *
 * Simulates a sudden, massive surge in traffic to see how the system handles it.
 *
 * How to run:
 * 1. Make sure k6 is installed.
 * 2. Get the external IP of your 'nginx-load-balancer' service.
 * 3. Run the script from your terminal:
 * k6 run -e TARGET_URL='http://<YOUR_LOAD_BALANCER_IP>' spike_test.js
 */

// A friendly message to remind the user to set the TARGET_URL
if (!__ENV.TARGET_URL) {
  console.error("Please set the TARGET_URL environment variable. Ex: k6 run -e TARGET_URL='http://123.45.67.89' spike_test.js");
}

export const options = {
  // Stages for simulating a sudden spike
  stages: [
    { duration: '10s', target: 5 },    // Below normal load
    { duration: '1m', target: 5 },
    { duration: '10s', target: 200 },  // 1. Spike to 200 users over 10 seconds
    { duration: '2m', target: 200 },  // 2. Stay at 200 users for 2 minutes
    { duration: '10s', target: 5 },    // Scale down. Recovery stage.
    { duration: '2m', target: 5 },
    { duration: '10s', target: 0 },
  ],
  // Thresholds for spike conditions. The main goal is availability.
  thresholds: {
    'http_req_failed': ['rate<0.1'],      // Allow a higher error rate (less than 10%) during the spike
    'http_req_duration': ['p(95)<1500'], // 95% of requests should be under 1.5s
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

  sleep(1);
}
