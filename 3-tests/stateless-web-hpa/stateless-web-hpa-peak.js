// =========================================================================
// GOAL: To simulate a sustained high load that forces the HPA to scale
//       out to its maximum number of replicas. This allows VPA to observe
//       the pods' resource usage under heavy, consistent traffic.
//
// HOW TO RUN:
// Pass the URL as an environment variable using the -e flag.
// k6 run -e TARGET_URL=http://YOUR_LOAD_BALANCER_URL stateless-web-hpa-peak.js
// =========================================================================

import http from 'k6/http';
import { fail } from 'k6';

// --- Configuration ---
const TARGET_URL = __ENV.TARGET_URL;

export const options = {
  scenarios: {
    peak_scenario: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        // Ramp up to a high number of users and hold it
        { duration: '2m', target: 500 },
        { duration: '10m', target: 500 },
        { duration: '1m', target: 0 }, // Ramp down at the end
      ],
    },
  },
};

export default function () {
  if (!TARGET_URL) {
    fail('TARGET_URL environment variable not set! Please run with "-e TARGET_URL=http://..."');
  }
  http.get(TARGET_URL);
  // No sleep, to generate as much load as possible per user
}