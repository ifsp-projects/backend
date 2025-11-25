terraform {
  required_version = ">=1.0.0"
  backend "s3" {
    encrypt = true
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

data "aws_vpc" "default" {
  default = true
}

resource "aws_security_group" "app_sg" {
  name        = "${var.project_name}-sg"
  description = "Enable SSH and application PORT"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
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
}

resource "aws_iam_role" "ec2_role" {
  name = "${var.project_name}-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
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

output "ecr_repository_url" {
  value = aws_ecr_repository.ecr_api_images_repository.repository_url
}

output "server_public_ip" {
  value = aws_instance.app_server.public_ip
  description = "IP to acecess the API (http://IP:8000) or SSH (ssh -i key.pem ec2-user@IP)"
}

output "server_dns" {
  value = aws_instance.app_server.public_dns
}
