# SecureBank Digital Banking System

### End-to-End DevOps & GitOps Project on AWS EKS

SecureBank is a 3-tier banking application deployed on **Amazon EKS** using Docker, Kubernetes, AWS ALB Ingress, and Argo CD.

## 🏗️ Architecture

**User → AWS ALB → Kubernetes Ingress → Frontend → Backend → MySQL**

## 🛠️ Tech Stack

| Category           | Technology              |
| ------------------ | ----------------------- |
| Cloud              | AWS                     |
| Containerization   | Docker                  |
| Orchestration      | Amazon EKS / Kubernetes |
| GitOps             | Argo CD                 |
| Load Balancer      | AWS ALB                 |
| Frontend           | AngularJS               |
| Backend            | Node.js / Express       |
| Database           | MySQL                   |
| Container Registry | Docker Hub              |

## 🚀 Features

* User registration & login
* Account management
* Balance management
* Money transfers
* Transaction history
* Internal & external transfers

AWS Infrastructure

The application is deployed on AWS using:

EKS
EC2 worker nodes
Application Load Balancer
IAM
VPC networking
Kubernetes Services & Ingress

🐳 Docker

Separate Docker images are used for the frontend and backend.

securebank-frontend
securebank-backend
☸️ Kubernetes

Kubernetes resources include:

Frontend Deployment
Backend Deployment
Frontend Service
Backend Service
MySQL Deployment
MySQL Service
AWS ALB Ingress

🔁 GitOps with Argo CD

Argo CD continuously monitors the GitHub repository and synchronizes Kubernetes manifests with the EKS cluster.

When Kubernetes configuration changes are pushed to GitHub, Argo CD can synchronize the changes to the cluster.

🛠️ Troubleshooting Experience

During deployment, I worked through several real-world issues, including:

Frontend unable to reach backend API
AWS ALB health-check issues
Kubernetes service and ingress routing problems
MySQL authentication and connectivity issues
Database schema/seed issues
Docker image version mismatches
Argo CD synchronization issues
GitHub changes not being reflected in Kubernetes
Backend 500 Internal Server Error during transfers
External account transfer validation changes

These issues were diagnosed using:

kubectl get pods
kubectl describe pod
kubectl logs
kubectl get deployment
kubectl describe ingress
kubectl exec
curl
git
docker

## 🔄 CI/CD Pipeline

<img width="1023" height="317" alt="CI/CD Pipeline" src="https://github.com/user-attachments/assets/6e436c45-09be-4b49-b070-8777f1d7a917" />

## 📸 Application Screenshots

### Login Page

<img width="1903" height="816" alt="Login Page" src="https://github.com/user-attachments/assets/b5482ac2-620a-45b9-8b13-13f4883f3e60" />

### Money Transfer

<img width="1909" height="709" alt="Money Transfer" src="https://github.com/user-attachments/assets/97d0ce80-9e1b-4791-a66c-a29fecc57118" />

### Successful Money Transfer

<img width="1918" height="793" alt="Successful Money Transfer" src="https://github.com/user-attachments/assets/0337ed30-379c-45dd-8142-2dae31759466" />

### Dashboard — Balance & Transaction History

<img width="1901" height="983" alt="Dashboard" src="https://github.com/user-attachments/assets/6d5ebbd8-e2b6-405d-bd0d-0b5ec4654b59" />

## 🚀 Argo CD — Healthy & Synced

<img width="1916" height="965" alt="Argo CD Healthy and Synced" src="https://github.com/user-attachments/assets/1828a692-0211-4e30-9106-b785d8d8ee38" />
