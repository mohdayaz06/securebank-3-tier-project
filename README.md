SecureBank – 3-Tier DevOps Project

A 3-tier banking application deployed on AWS EKS using Docker, Kubernetes, Terraform, Jenkins, and Argo CD.

🏗️ Architecture

Frontend → Backend API → MySQL Database

Frontend: AngularJS
Backend: Node.js + Express
Database: MySQL
Containerization: Docker
Orchestration: Kubernetes / AWS EKS
Infrastructure: Terraform
CI/CD: Jenkins
GitOps: Argo CD
Ingress: AWS Application Load Balancer


🚀 Features
User registration and login
Account management
Account balance
Money transfers
Transaction history
Internal and external account transfers
MySQL database persistence
Kubernetes-based deployment
GitOps deployment using Argo CD
🔄 Deployment Flow
Developer
   ↓
GitHub
   ↓
Jenkins
   ↓
Docker Build
   ↓
Docker Hub
   ↓
Kubernetes / EKS
   ↓
Argo CD
   ↓
AWS ALB
   ↓
SecureBank Application
☁️ AWS Infrastructure

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
