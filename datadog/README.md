```bash

# Add the Datadog Helm repository
helm repo add datadog https://helm.datadoghq.com
helm repo update

# Create a namespace for Datadog (optional, but recommended):
kubectl create namespace datadog

# Then create a Kubernetes Secret using your Datadog API key:
kubectl create secret generic datadog-secret \
  --from-literal api-key='xxx' \
  --namespace datadog

helm upgrade datadog-agent \
        --set datadog.apiKey=xxx datadog/datadog \
        --namespace datadog

# Create your configuration file values.yaml

# Install the Datadog Agent using Helm

# This installs:
# DaemonSet for the Datadog Agent on each node.
# A Deployment for the Datadog Cluster Agent.
# All the necessary configurations.

helm install datadog-agent datadog/datadog \
  --namespace datadog --create-namespace \
  -f values.yaml

# You can verify that everything is running:
kubectl get pods -n datadog

# Also check logs if needed:
kubectl logs -f daemonset/datadog-agent -n datadog

```

