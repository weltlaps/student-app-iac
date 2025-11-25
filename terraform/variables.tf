variable "network_name" {
  description = "Name of the Docker network"
  type        = string
  default     = "student_network"
}

variable "volume_name" {
  description = "Name of the PostgreSQL data volume"
  type        = string
  default     = "postgres_data"
}
