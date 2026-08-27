# SecureBank Digital Banking System

### End-to-End DevOps & GitOps Project on AWS EKS

A production-style digital banking application deployed on **Amazon EKS** with containerization, Kubernetes orchestration, AWS ALB Ingress, and GitOps deployment using Argo CD.

The project demonstrates an end-to-end DevOps workflow from application development and Docker containerization to Kubernetes deployment and GitOps-based application management.

---

## 📌 Project Overview

SecureBank is a 3-tier banking application consisting of:

* AngularJS frontend
* Node.js/Express backend API
* MySQL database

The application provides basic banking functionality such as user registration, login, account management, balance management, money transfers, and transaction history.

The application is containerized using Docker and deployed on Amazon EKS using Kubernetes.

---

## 🏗️ Architecture

<img width="1600" alt="SecureBank Architecture" src="YOUR_ARCHITECTURE_IMAGE_URL">

### Application Flow

```text
User
  ↓
AWS Application Load Balancer
  ↓
Kubernetes Ingress
  ↓
Frontend Service
  ↓
Frontend Pods
  ↓
Backend Service
  ↓
Backend Pods
  ↓
MySQL
```

---

## 🛠️ Tech Stack

| Category                   | Technology                    |
| -------------------------- | ----------------------------- |
| ☁️ Cloud                   | AWS                           |
| ☸️ Container Orchestration | Amazon EKS                    |
| 🐳 Containerization        | Docker                        |
| 🔄 GitOps                  | Argo CD                       |
| 📦 Container Registry      | Docker Hub                    |
| 🌐 Load Balancer           | AWS Application Load Balancer |
| 🔀 Networking              | Kubernetes Ingress            |
| ⚙️ Backend                 | Node.js + Express             |
| 🖥️ Frontend               | AngularJS                     |
| 🗄️ Database               | MySQL                         |
| 🔐 Authentication          | JWT                           |
| 📊 Database Connectivity   | MySQL2                        |

---

## 🔄 Deployment Workflow

The application follows this deployment workflow:

* Develop application
* Build Docker images
* Push images to Docker Hub
* Store Kubernetes manifests in GitHub
* Argo CD monitors the GitHub repository
* Argo CD synchronizes Kubernetes manifests
* Application is deployed to Amazon EKS
* AWS ALB exposes the application externally

```text
GitHub
   ↓
Docker Build
   ↓
Docker Hub
   ↓
Kubernetes Manifests
   ↓
Argo CD
   ↓
Amazon EKS
   ↓
AWS ALB
   ↓
SecureBank
```

---

## 🚀 GitOps with Argo CD

Argo CD is used to manage the Kubernetes deployment using GitOps principles.

The Kubernetes manifests are stored in GitHub and Argo CD continuously monitors the repository.

When changes are pushed to GitHub:

* Argo CD detects the new commit.
* Kubernetes manifests are synchronized.
* Updated application versions are deployed to EKS.
* Argo CD reports the application health and synchronization status.

<img width="1915" alt="Argo CD" src="YOUR_ARGOCD_IMAGE_URL">

---

## ☸️ Kubernetes Architecture

The application is deployed on an Amazon EKS cluster using multiple Kubernetes resources.

### Components

* Frontend Deployment
* Backend Deployment
* MySQL Deployment
* Frontend Service
* Backend Service
* MySQL Service
* Kubernetes Ingress
* AWS Application Load Balancer

The AWS ALB receives external traffic and Kubernetes Ingress routes:

```text
/     → Frontend Service
/api  → Backend Service
```

---

## 💳 Banking Features

The application supports:

* User registration
* User login
* Account management
* Account balance
* Money transfers
* Transaction history
* Internal account transfers
* External recipient transfers
* Transaction records

---

## 🔐 Database

MySQL stores:

* Users
* Accounts
* Transactions
* Transfers

The backend connects to MySQL through the Kubernetes service:

```text
Backend → mysql:3306 → securebank
```

---

## 🐳 Docker

Separate Docker images are used for the application tiers:

```text
mohdayazz/securebank-frontend
mohdayazz/securebank-backend
```

The frontend and backend run as separate containers and are deployed independently using Kubernetes Deployments.

---

## 🔧 Troubleshooting & Problem Solving

During the deployment, I faced and resolved several real-world DevOps issues.

### 1. Frontend → Backend Connectivity

Initially, the frontend was configured with the EC2 public IP and backend port.

This caused connectivity issues after moving the application behind the Kubernetes Ingress.

**Solution:**

Changed the frontend API configuration to:

```text
/api
```

and configured Kubernetes Ingress to route `/api` requests to the backend service.

---

### 2. AWS ALB Health Checks

The ALB was configured to use:

```text
/healthz
```

The backend health endpoint was verified using Kubernetes logs and ALB health-check requests.

---

### 3. MySQL Connectivity

The backend initially experienced database connectivity/authentication issues.

Troubleshooting included:

```bash
kubectl logs
kubectl exec
mysql
```

The backend was ultimately configured to connect through the Kubernetes MySQL service:

```text
mysql:3306
```

---

### 4. Docker Image Version Mismatch

At one point, the Kubernetes Deployment was still running an older Docker image even though the GitHub manifest had been updated.

I verified the actual image running inside the cluster using:

```bash
kubectl get deployment
kubectl get pod
kubectl describe deployment
```

This helped identify the difference between the Git repository configuration and the currently deployed Kubernetes resources.

---

### 5. Argo CD Synchronization

After configuring Argo CD, changes in GitHub were not immediately reflected in the running deployment.

I verified:

```bash
git status
git log
kubectl get deployment
kubectl get pods
```

and confirmed that the correct image version was eventually deployed through Argo CD.

---

### 6. Transfer API 500 Error

The transfer API initially returned:

```text
500 Internal Server Error
```

I investigated the backend transfer service, transfer model, and MySQL schema.

The database schema was updated to support the recipient account information required by the application.

After rebuilding and deploying the backend image, transfers worked successfully.

---

## 📸 Application Screenshots

### Login Page

<img width="1920" alt="SecureBank Login" src="YOUR_LOGIN_IMAGE_URL">

### Dashboard

<img width="1920" alt="SecureBank Dashboard" src="YOUR_DASHBOARD_IMAGE_URL">

### Money Transfer

<img width="1920" alt="SecureBank Money Transfer" src="YOUR_TRANSFER_IMAGE_URL">

### Transaction History

<img width="1920" alt="SecureBank Transaction History" src="YOUR_TRANSACTION_IMAGE_URL">

---

## ☸️ Kubernetes Deployment

<img width="1920" alt="Kubernetes Deployment" src="YOUR_KUBERNETES_IMAGE_URL">

---

## 🎯 Key DevOps Learnings

Through this project I gained hands-on experience with:

* Docker containerization
* Kubernetes deployments
* Amazon EKS
* AWS Application Load Balancer
* Kubernetes Ingress
* GitHub-based deployment workflows
* Argo CD GitOps
* MySQL troubleshooting
* Application troubleshooting
* Network troubleshooting
* Docker image version management
* Kubernetes health checks
* Debugging HTTP 4xx/5xx errors

---

## 👨‍💻 Author

**Mohammed Ayaz**

DevOps Engineer | AWS | Kubernetes | Docker | Terraform | Jenkins | Argo CD
