variable "project_name" {}
variable "env" {}

variable "region" {
  description = "Azure region, e.g. eastus, westeurope"
  default     = "westus2"
}

variable "ssh_public_key" {
  type        = string
  description = "SSH public key content for the VM admin user"
}

variable "container_image" {
  type        = string
  description = "Container image"
  default     = "dummy"
}

variable "health_check_path" {
  type    = string
  default = "/health"
}

variable "grace_period" {
  type    = number
  default = 300
}

variable "dns_name_app" {
  type    = string
  default = ""
}
