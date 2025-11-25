output "created_resources" {
  description = "List of created resources"
  value = {
    network = docker_network.student_network.name
    volume  = docker_volume.postgres_data.name
  }
}

output "application_url" {
  description = "URL to access the student application"
  value       = "http://localhost:3000"
}
