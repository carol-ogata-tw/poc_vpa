// =========================================================================
// FILE: realistic-day-test.js
//
// GOAL: To simulate a full day of traffic with varying loads, including
//       baseline, peak, and spike scenarios in a single run. This provides
//       a comprehensive view of how HPA and VPA work together over time.
//
// HOW TO RUN:
// 1. Get the URL for your 'php-apache-hpa-service'.
// 2. Run the command, passing the URL as an environment variable:
//    k6 run -e TARGET_URL=http://YOUR_LOAD_BALANCER_URL realistic-day-test.js
// =========================================================================

import http from 'k6/http';
import { sleep } from 'k6';
import { fail } from 'k6';

// --- Configuration ---
// The target URL is read from the environment variable TARGET_URL.
const TARGET_URL = __ENV.TARGET_URL;

export const options = {
  scenarios: {
    realistic_day_scenario: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        // --- Morning Warm-up (Baseline Load) ---
        // Simulates traffic starting in the morning.
        { duration: '2m', target: 20 },  // Ramp up to 20 users
        { duration: '5m', target: 20 },  // Hold baseline load

        // --- Business Hours (Peak Load) ---
        // Simulates the main part of the workday with high, sustained traffic.
        { duration: '3m', target: 100 }, // Ramp up to peak
        { duration: '10m', target: 100 },// Hold peak load

        // --- Lunchtime Rush (Spike Load) ---
        // Simulates a sudden, intense burst of activity.
        { duration: '1m', target: 200 }, // Spike!
        { duration: '2m', target: 200 }, // Hold the spike
        { duration: '1m', target: 100 }, // Recover back to peak load

        // --- Afternoon (Peak Load) ---
        // Return to normal business hours traffic.
        { duration: '5m', target: 100 },

        // --- End of Day (Cooldown) ---
        // Traffic starts to die down.
        { duration: '5m', target: 0 },   // Ramp down to zero
      ],
    },
  },
};

export default function () {
  // Fail the test if the TARGET_URL is not provided
  if (!TARGET_URL) {
    fail('TARGET_URL environment variable not set! Please run with "-e TARGET_URL=http://..."');
  }

  http.get(TARGET_URL);
  // Add a small sleep to prevent overwhelming the load generator itself
  sleep(0.5);
}