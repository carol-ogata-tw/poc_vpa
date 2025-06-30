// =========================================================================
// GOAL: To simulate a sudden, massive burst of traffic to test the
//       reaction time of the HPA.
//
// HOW TO RUN:
// Pass the URL as an environment variable using the -e flag.
// k6 run -e TARGET_URL=http://YOUR_LOAD_BALANCER_URL spike-test.js
// =========================================================================

import http from 'k6/http';
import { fail } from 'k6';

// --- Configuration ---
const TARGET_URL = __ENV.TARGET_URL;

export const options = {
  scenarios: {
    spike_scenario: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        // A very fast ramp-up to a very high number of users
        { duration: '30s', target: 200 },
        // Hold the spike for a short period
        { duration: '1m', target: 200 },
        // Quickly ramp down
        { duration: '30s', target: 0 },
      ],
    },
  },
};

export default function () {
  if (!TARGET_URL) {
    fail('TARGET_URL environment variable not set! Please run with "-e TARGET_URL=http://..."');
  }
  http.get(TARGET_URL);
}