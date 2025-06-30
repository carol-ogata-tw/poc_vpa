# Vertical Pod Autoscaling

[YouTube Tutorial](https://youtu.be/3h-vDDTZrm8)

## 1. Create EKS Cluster Using eksctl

```bash

# Create EKS cluster
eksctl create cluster -f eks.yaml

# Verify that you can connect to the cluster
kubectl get svc

```

## 2. Deploy Datadog Agent

```bash

# Add the Datadog Helm repository
helm repo add datadog https://helm.datadoghq.com 
helm repo update 

# Create a namespace for Datadog (optional, but recommended):
kubectl create namespace datadog 

# Create your configuration file values.yaml
kubectl create secret generic datadog-secret \
--from-literal api-key='e38cc5df46d8d253efcd2b45fe11501a' \
--from-literal app-key='f21d3178f3bbfb802c884e926fb76cf245a84dec' \
-n datadog

# # Install the agent using your values.yaml file
helm install datadog-agent datadog/datadog \
  -n datadog \
  -f datadog/values.yaml

# # Install the Datadog Agent using Helm
# helm install datadog-agent datadog/datadog \
#   --namespace datadog --create-namespace \
#   -f values.yaml

# # Upgrade the apiKey
# helm upgrade datadog-agent \
#         --set datadog.apiKey='XXXX' datadog/datadog\
#         --namespace datadog

# # Upgrade the appKey
# helm upgrade datadog-agent \
#         --set datadog.appKey='XXXX' datadog/datadog\
#         --namespace datadog


# You can verify that everything is running
kubectl get pods -n datadog

# Also check logs if needed
kubectl logs -f daemonset/datadog-agent -n datadog

```

## 3. Deploy Metrics server (if needed)

```bash

# List api services
kubectl get apiservice

# Use grep and filter by `metrics`
kubectl get apiservice | grep metrics

# Use kubectl to get metrics
kubectl top pods -n kube-system
# In case of 'error: Metrics API not available', run:
# kubectl patch deployment metrics-server -n kube-system --type='json' -p='[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--kubelet-insecure-tls"}]'

# Access metrics API
kubectl get --raw /apis/metrics.k8s.io/v1beta1 | jq

# Apply created files
kubectl apply -f 0-metrics-server

# Verify deployment
kubectl get pods -n kube-system

# List api services
kubectl get apiservice

# List services in `kube-system` namespace
kubectl get svc -n kube-system

# Access metrics API
kubectl get --raw /apis/metrics.k8s.io/v1beta1 | jq

# Get metrics for pods using raw command
kubectl get --raw /apis/metrics.k8s.io/v1beta1/pods | jq

# Use kubectl to get metrics
kubectl top pods -n kube-system

```

<!-- ## 3. Deploy Metrics server (HELM) -->

<!-- - Find default values for metrics-server [chart](https://github.com/bitnami/charts/tree/master/bitnami/metrics-server)
- Create `values.yaml` file
- Add `bitnami` helm repo
```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
```

- Search for `metrics-server`
```bash
helm search repo metrics-server --max-col-width 23
```

- Install `metrics-server` Helm Chart
```bash
helm install metrics bitnami/metrics-server \
--namespace kube-system \
--version 7.4.6 \
--values values.yaml
``` -->

## 4. Install Vertical Pod Autoscaler

```bash

# Clone VPA repo
git clone https://github.com/kubernetes/autoscaler.git

# Change directory
cd autoscaler/vertical-pod-autoscaler

# Preview installation
./hack/vpa-process-yamls.sh print

# Install VPA
./hack/vpa-up.sh

# Tear down VPA
./hack/vpa-down.sh

```

## 5. Upgrade LibreSSL on Mac/OS X (if needed)


```bash

# Get OpenSSL version
openssl version

# Upgrade LibreSSL with Homebew
brew install libressl

# Get OpenSSL version
openssl version

# Check instalation path of OpenSSL
which openssl

# Check version of the LibreSSL installed with Homebew
/opt/homebrew/opt/libressl/bin/openssl version

# Try to create a soft link
sudo ln -s /opt/homebrew/opt/libressl/bin/openssl /usr/bin/openssl

# Try to rename openssl
sudo mv /usr/bin/openssl /usr/bin/openssl-old

# Create soft link to /usr/local/bin/ which should take precedence on your path over /usr/bin.
sudo ln -s /opt/homebrew/opt/libressl/bin/openssl /usr/local/bin/openssl

# Open new tab and run version command
openssl version
```

## 5. Install Vertical Pod Autoscaler (Continue)

```bash

# Open new tab and change directory
cd autoscaler/vertical-pod-autoscaler

# Install VPA
./hack/vpa-up.sh

```

<!-- ## 6. Demo (or Workloads)
- Create deployment files under `1-demo` directory
 - `0-deployment.yaml`
 - `1-vpa.yaml`

- Open two tabs
```bash
watch -n 1 -t kubectl top pods
```

- Deploy sample app
```bash
kubectl apply -f 1-demo
```

- Let's run 5-10 min and in a new tab get VPA
```bash
kubectl get vpa
```

- Describe VPA
```bash
kubectl describe vpa hamster-vpa
```

- Update deployment and reapply
```bash
kubectl apply -f 1-demo/0-deployment.yaml
``` -->

## 7. Workloads

### 1. cpu-batch-job workload
#### Deploy cpu-batch-job workload

```bash

# Apply the CronJob
kubectl apply -f 2-workloads/stateless-jobs/pi-cronjob.yaml

# Apply the VPA
kubectl apply -f 2-workloads/stateless-jobs/pi-job-vpa.yaml

# Verify the CronJob
kubectl get cronjob pi-calculation-cronjob
kubectl get pods

# Verify the VPA
kubectl describe vpa pi-job-vpa


```

### 2. memory-leak-app workload
#### Build, push the image and deploy memory-leak-app

```bash
docker build -t poc-ecr/memory-leak-app:latest .
docker push poc-ecr/memory-leak-app:latest 

kubectl apply -f 2-workloads/memory-leak-app/deployment.yaml
```

### 3. stateful-db workload

- Prerequisites:
  - First you'll need to enable IAM OIDC for the EKS cluster. Please refer to [this guide](./2-workloads/stateful-db/README.md)

```bash

# Apply the statefulset
kubectl apply -f 2-workloads/stateful-db/deployment.yaml

# Apply the vpa
kubectl apply -f 2-workloads/stateful-db/postgres-db-vpa.yaml

# Verify the statefulset
kubectl get statefulset postgres-db
kubectl get pods

# Verify the VPA
kubectl describe vpa postgres-db-vpa


```

### 4. stateless-web-server workload

```bash

# Apply the Deployment and Service
kubectl apply -f 2-workloads/stateless-web/deployment.yaml

# Apply the VPA
kubectl apply -f 2-workloads/stateless-web/nginx-vpa.yaml

# Verify the Deployment
kubectl get deployment stateless-nginx
kubectl get pods

# Verify the Service
kubectl get svc nginx-load-balancer

# Verify the VPA
kubectl describe vpa nginx-vpa


```

### 5. stateless-web-hpa workload

```bash

# Apply the Deployment, Service, HPA and VPA
kubectl apply -f 2-workloads/stateless-web-hpa/deployment.yaml

# Get the Service URL
kubectl get service php-apache-hpa-service

# Generate Load - Replace YOUR_LOAD_BALANCER_URL with the URL from the previous step
while true; do wget -q -O- http://YOUR_LOAD_BALANCER_URL; done

# Observe the HPA in Action 
# You will see the TARGETS go above 50% and the REPLICAS count increase from 1 up to 10.
kubectl get hpa -w

# Check the VPA Recommendation
kubectl describe vpa php-apache-vpa

```

# VPAs

## Clean Up

- Delete EKS cluster
```
eksctl delete cluster -f eks.yaml
sudo rm /usr/local/bin/openssl
brew remove libressl
helm repo remove bitnami
rm -rf Developer/autoscaler
```
# poc_vpa
