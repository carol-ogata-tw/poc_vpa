## 1. Create the necessary IAM Role for the driver

```bash

eksctl utils associate-iam-oidc-provider --cluster my-cluster --approve

eksctl create iamserviceaccount \
  --name ebs-csi-controller-sa \
  --namespace kube-system \
  --cluster my-cluster \
  --attach-policy-arn arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy \
  --approve \
  --role-only \
  --role-name AmazonEKS_EBS_CSI_DriverRole

```

## 2. Add the EBS CSI Driver as an EKS add-on

```bash

# Replace 'my-cluster' with your EKS cluster name
# Replace '111222333444' with your AWS Account ID
eksctl create addon \
  --name aws-ebs-csi-driver \
  --cluster my-cluster \
  --service-account-role-arn arn:aws:iam::111222333444:role/AmazonEKS_EBS_CSI_DriverRole \
  --force

````

## 3. Apply the StorageClass Manifest

```bash

kubectl apply -f default-storage-class.yaml

# Verify the Default StorageClass
kubectl get sc

```

## DELETE

```bash

kubectl delete sc gp3-default

eksctl delete addon --name aws-ebs-csi-driver --cluster my-cluster

eksctl delete iamserviceaccount --name ebs-csi-controller-sa --namespace kube-system --cluster my-cluster

```