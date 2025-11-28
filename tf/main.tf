terraform {
  required_version = ">=1.0.0"
  backend "s3" {
    encrypt = true
    key     = "tf/terraform.tfstate"
    bucket  = "ifsp-extensao-api-tf-states"
    region  = "us-east-1"
  }
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 4.22.0"
    }
  }
}

provider "aws" {
  region = var.region
  default_tags {
    tags = {
      Environment = var.env
      Project     = var.project_name
      ManagedBy   = "terraform"
    }
  }
}

resource "aws_ecr_repository" "ecr_api_images_repository" {
  name                 = "ifsp-extensao-api-module-prod"
  image_tag_mutability = "MUTABLE"
  force_delete         = true
}

resource "aws_default_vpc" "default" {
  tags = {
    Name = "Default VPC"
  }
}

locals {
  cloudflare_ipv4_ranges = [
    "173.245.48.0/20",
    "103.21.244.0/22",
    "103.22.200.0/22",
    "103.31.4.0/22",
    "141.101.64.0/18",
    "108.162.192.0/18",
    "190.93.240.0/20",
    "188.114.96.0/20",
    "197.234.240.0/22",
    "198.41.128.0/17",
    "162.158.0.0/15",
    "104.16.0.0/13",
    "104.24.0.0/14",
    "172.64.0.0/13",
    "131.0.72.0/22"
  ]
}

resource "aws_security_group" "app_sg" {
  name        = "${var.project_name}-sg"
  description = "Enable SSH and application PORT"
  vpc_id      = aws_default_vpc.default.id

  dynamic "ingress" {
    for_each = local.cloudflare_ipv4_ranges
    content {
      from_port   = 80
      to_port     = 80
      protocol    = "tcp"
      cidr_blocks = [ingress.value]
      description = "HTTP from Cloudflare"
    }
  }

  dynamic "ingress" {
    for_each = local.cloudflare_ipv4_ranges
    content {
      from_port   = 443
      to_port     = 443
      protocol    = "tcp"
      cidr_blocks = [ingress.value]
      description = "HTTPS from Cloudflare"
    }
  }

  ingress {
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-sg"
  }
}

resource "aws_iam_role" "ec2_role" {
  name = "${var.project_name}-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecr_read_only" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "${var.project_name}-profile"
  role = aws_iam_role.ec2_role.name
}

data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }
}

resource "aws_instance" "app_server" {
  ami           = data.aws_ami.amazon_linux.id
  instance_type = "t2.micro"

  key_name = var.key_name

  vpc_security_group_ids = [aws_security_group.app_sg.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name

  associate_public_ip_address = true

  # Install Docker and Start
  user_data = <<-EOF
              #!/bin/bash
              dnf update -y
              dnf install -y docker
              systemctl start docker
              systemctl enable docker
              usermod -a -G docker ec2-user
              EOF

  tags = {
    Name = "${var.project_name}-server"
  }
}

resource "aws_eip" "lb" {
  instance = aws_instance.app_server.id
  domain   = "vpc"
}

output "ecr_repository_url" {
  value = aws_ecr_repository.ecr_api_images_repository.repository_url
}

output "server_public_ip" {
  value       = aws_eip.lb.public_ip
  description = "IP to acecess the API (http://IP:8000) or SSH (ssh -i key.pem ec2-user@IP)"
}

output "server_dns" {
  value = aws_instance.app_server.public_dns
}
