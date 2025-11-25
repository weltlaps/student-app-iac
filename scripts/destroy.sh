#!/bin/bash

set -e

echo "🗑️  Destroying Student Application Infrastructure"
echo "================================================"

# Destroy with Terraform
cd terraform
terraform destroy -auto-approve

echo "✅ Infrastructure destroyed successfully!"
echo ""
echo "Note: Docker volumes and networks created outside Terraform might still exist."
echo "To completely clean up, run:"
echo "  docker system prune -f"
echo "  docker volume prune -f"
echo "  docker network prune -f"
