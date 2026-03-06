terraform {
  required_version = ">=1.0.0"

  backend "gcs" {
    bucket = "ifsp-extensao-tfstate"
    prefix = "tf/terraform.tfstate"
  }

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">=5.0.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

resource "google_artifact_registry_repository" "repo" {
  location      = var.region
  repository_id = "${var.project_name}-repo"
  format        = "DOCKER"
}

resource "google_compute_address" "static_ip" {
  name   = "${var.project_name}-ip"
  region = var.region
}

resource "google_compute_firewall" "rules" {
  name    = "${var.project_name}-firewall"
  network = "default"

  allow {
    protocol = "tcp"
    ports    = ["22", "80", "8000"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = [var.project_name]
}

resource "google_service_account" "vm_sa" {
  account_id   = "${var.project_name}-sa"
  display_name = "Service Account for ${var.project_name} VM"
}

resource "google_project_iam_member" "artifact_reader" {
  project = var.project_id
  role    = "roles/artifactregistry.reader"
  member  = "serviceAccount:${google_service_account.vm_sa.email}"
}

resource "google_compute_instance" "vm" {
  name         = "${var.project_name}-vm"
  machine_type = "e2-micro"
  zone         = var.zone
  tags         = [var.project_name]

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
      size  = 30
    }
  }

  network_interface {
    network = "default"
    access_config {
      nat_ip = google_compute_address.static_ip.address
    }
  }

  service_account {
    email  = google_service_account.vm_sa.email
    scopes = ["cloud-platform"]
  }

  metadata = {
    ssh-keys = "gcpuser:${var.ssh_public_key}"
  }

  metadata_startup_script = <<-EOF
    #!/bin/bash
    apt-get update -y
    apt-get install -y docker.io ca-certificates curl
    curl -fsSL https://packages.cloud.google.com/apt/doc/apt-key.gpg | gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg
    echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" > /etc/apt/sources.list.d/google-cloud-sdk.list
    apt-get update -y && apt-get install -y google-cloud-cli
    systemctl start docker
    systemctl enable docker
    usermod -a -G docker gcpuser
  EOF
}

output "vm_public_ip" {
  value       = google_compute_address.static_ip.address
  description = "Public IP to access the API or SSH"
}

output "artifact_registry_url" {
  value = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.repo.repository_id}"
}
