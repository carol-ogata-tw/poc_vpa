#!/bin/bash

# This function queries and logs the current pod count and VPA recommendations.
log_status() {
    echo "============================================================"
    echo "STAGE: $1"
    echo "TIMESTAMP: $(date)"
    echo "------------------------------------------------------------"

    # Get pod count from the HorizontalPodAutoscaler
    POD_COUNT=$(kubectl get hpa php-apache-hpa -o=jsonpath='{.status.currentReplicas}')
    echo "POD COUNT: ${POD_COUNT:-"N/A"}"

    # Get VPA Recommendations
    VPA_TARGET=$(kubectl get vpa php-apache-vpa-test -o=jsonpath='{.status.recommendation.containerRecommendations[0].target.cpu}')
    VPA_LOWER=$(kubectl get vpa php-apache-vpa-test -o=jsonpath='{.status.recommendation.containerRecommendations[0].lowerBound.cpu}')
    VPA_UPPER=$(kubectl get vpa php-apache-vpa-test -o=jsonpath='{.status.recommendation.containerRecommendations[0].upperBound.cpu}')

    echo "VPA RECOMMENDATION:"
    echo "  - Target: ${VPA_TARGET:-"N/A"}"
    echo "  - Lower Bound: ${VPA_LOWER:-"N/A"}"
    echo "  - Upper Bound: ${VPA_UPPER:-"N/A"}"
    echo "============================================================"
    echo ""
}

# --- Test Timeline ---
# The sleep durations correspond to the stages in your K6 script.

log_status "Initial State (Before Test)"

echo "--> Starting test monitoring. Run your K6 script now."
echo ""

# Stage 1 & 2: Morning Warm-up (2m + 5m = 7m)
sleep 7m
log_status "After Morning Warm-up (20 VUs)"

# Stage 3 & 4: Business Hours Peak (3m + 10m = 13m)
sleep 13m
log_status "After Business Hours Peak (100 VUs)"

# Stage 5, 6, & 7: Lunchtime Spike (1m + 2m + 1m = 4m)
sleep 4m
log_status "After Lunchtime Spike (200 VUs)"

# Stage 8: Afternoon Peak (5m)
sleep 5m
log_status "After Afternoon Peak (100 VUs)"

# Stage 9: End of Day Cooldown (5m)
sleep 5m
log_status "Final State (Test Complete)"