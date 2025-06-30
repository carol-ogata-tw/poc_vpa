# Tests for the Workloads

## 1. Stateless-web-server
```bash
# Get the External-IP and use as the TARGET_URL in the k6 run command

# Copy the external-ip
kubectl get service nginx-load-balancer

# Replace in {EXTERNAL-IP}
k6 run -e TARGET_URL=http://{EXTERNAL-IP} stateless-web-server-xxxx.js

```

## 2. Stateless-web-hpa
```bash
# Get the External-IP and use as the TARGET_URL in the k6 run command

# Copy the external-ip
kubectl get service php-apache-hpa-service

# Replace in {EXTERNAL-IP}
k6 run -e TARGET_URL=http://{EXTERNAL-IP} stateless-web-hpa-xxxx.js

```