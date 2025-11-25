variable "project_name" {}
variable "env" {}
variable "region" {}
variable "key_name" {}

variable "container_image" {
  type        = string
  description = "container image"
  default     = "dummy"
}

variable "ingress_allowed_cidrs_prod" {
  default     = ["10.0.0.0/16"]
  description = "List of allowed cidrs ranges"
}

variable "lb_ingress_ports" {
  default     = ["443", "80"]
  description = "List of allowed ports"
}

variable "health_check_path" {
  type        = string
  description = ":D"
  default     = "/health"
}

variable "grace_period" {
  type = number
  description = "Time in seconds after instance comes into service before checking health."
  default = 300
}

variable "dns_name_app" {
  type        = string
  description = "DNS name"
  default     = ""
}
