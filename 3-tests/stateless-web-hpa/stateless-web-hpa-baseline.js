// =========================================================================
// GOAL: To simulate a steady, low-level load. This should keep the HPA
//       at its minimum replica count (1 pod) and allow VPA to see the
//       resource usage of a single, under-utilized pod.
//
// HOW TO RUN:
// Pass the URL as an environment variable using the -e flag.
// k6 run -e TARGET_URL=http://YOUR_LOAD_BALANCER_URL stateless-web-hpa-baseline.js
// =========================================================================

import http from 'k6/http';
import { sleep } from 'k6';
import { fail } from 'k6';

// --- Configuration ---
// The target URL is now read from an environment variable.
const TARGET_URL = __ENV.TARGET_URL;

export const options = {
  scenarios: {
    baseline_scenario: {
      executor: 'constant-vus',
      vus: 50, // A very low number of virtual users
      duration: '10m', // Run for 10 minutes
    },
  },
};

export default function () {
  if (!TARGET_URL) {
    fail('TARGET_URL environment variable not set! Please run with "-e TARGET_URL=http://..."');
  }
  http.get(TARGET_URL);
  sleep(1); // Wait 1 second between requests per user
}