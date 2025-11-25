terraform {
  required_version = ">= 1.0"
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

provider "docker" {
  host = "unix:///var/run/docker.sock"
}

# Create Docker network
resource "docker_network" "student_network" {
  name   = "student_network"
  driver = "bridge"
}

# Create Docker volume for PostgreSQL data
resource "docker_volume" "postgres_data" {
  name = "postgres_data"
}

# Output important information
output "network_name" {
  value = docker_network.student_network.name
}

output "volume_name" {
  value = docker_volume.postgres_data.name
}

output "deployment_instructions" {
  value = <<EOT

Terraform infrastructure deployed successfully!

Next steps:
1. Run the Ansible playbook to deploy the application:
   cd ../ansible && ansible-playbook -i inventory.ini playbook.yml

2. Access the application at: http://localhost:3000

3. Check running containers:
   docker ps

4. View application logs:
   docker logs student_app

Infrastructure Details:
- Network: ${docker_network.student_network.name}
- Volume: ${docker_volume.postgres_data.name}
EOT
}
