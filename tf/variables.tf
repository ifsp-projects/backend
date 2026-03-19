variable "project_name" {}
variable "env" {}
variable "project_id" {}

variable "region" {
  default = "us-east1"
}

variable "zone" {
  default = "us-east1-d"
}

variable "ssh_public_key" {
  type        = string
  description = "SSH public key content for the VM"
}
