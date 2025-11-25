#!/bin/bash

set -e

echo "🚀 Starting Student Application Deployment with Terraform and Ansible"
echo "====================================================================="

# Check if required tools are installed
command -v terraform >/dev/null 2>&1 || { echo "Terraform is required but not installed. Aborting." >&2; exit 1; }
command -v ansible >/dev/null 2>&1 || { echo "Ansible is required but not installed. Aborting." >&2; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "Docker is required but not installed. Aborting." >&2; exit 1; }

echo "✅ Required tools are installed"

# Initialize and apply Terraform
echo "📦 Setting up infrastructure with Terraform..."
cd terraform
terraform init
terraform apply -auto-approve

# Get outputs from Terraform
NETWORK_NAME=$(terraform output -raw network_name)
VOLUME_NAME=$(terraform output -raw volume_name)

echo "✅ Terraform infrastructure created:"
echo "   - Network: $NETWORK_NAME"
echo "   - Volume: $VOLUME_NAME"

# Deploy application with Ansible
echo "🎯 Deploying application with Ansible..."
cd ../ansible

# Install Ansible Docker community collection
ansible-galaxy collection install community.docker

# Run Ansible playbook
ansible-playbook -i inventory.ini playbook.yml

echo "✅ Application deployment completed!"
echo ""
echo "🌐 Access your application at: http://localhost:3000"
echo "📊 API available at: http://localhost:3000/api/students"
echo ""
echo "🛠️  Management commands:"
echo "   docker ps                          # Check running containers"
echo "   docker logs student_app           # View application logs"
echo "   docker logs student_db            # View database logs"
echo "   cd terraform && terraform destroy # Destroy infrastructure"
