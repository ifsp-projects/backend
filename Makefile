SHELL := /bin/bash
.DEFAULT_GOAL := help

ENV_FILE := .env.development
-include $(ENV_FILE)
export

COMPOSE     := docker compose
APP_SERVICE := api
DB_SERVICE  := postgres

help:
	@echo "Uso: make <comando>"
	@echo ""
	@echo "  up               Sobe os containers (build + logs no terminal)"
	@echo "  up-d             Sobe os containers em background"
	@echo "  down             Derruba os containers"
	@echo "  down-v           Derruba os containers e remove volumes"
	@echo "  restart          Reinicia os containers (down + up-d)"
	@echo "  ps               Lista os containers em execução"
	@echo "  build            Rebuild da imagem da API sem cache"
	@echo "  logs             Logs de todos os containers"
	@echo "  logs-api         Logs apenas da API"
	@echo "  sh-db            Abre um shell psql no banco"
	@echo "  prisma-generate  Gera o client do Prisma"
	@echo "  migrate          Executa as migrations pendentes"
	@echo "  db-push          Push do schema sem gerar migration (dev rápido)"
	@echo "  lint             Roda o linter"
	@echo "  format-check     Verifica formatação"
	@echo "  test             Roda a suíte de testes"
	@echo ""
	@echo "Envs carregadas a partir de: $(ENV_FILE)"

up:
	$(COMPOSE) up --build

up-d:
	$(COMPOSE) up --build -d

down:
	$(COMPOSE) down

down-v:
	$(COMPOSE) down -v

restart: down up-d

ps:
	$(COMPOSE) ps

build:
	$(COMPOSE) build --no-cache $(APP_SERVICE)

logs:
	$(COMPOSE) logs -f

logs-api:
	$(COMPOSE) logs -f $(APP_SERVICE)

sh-db:
	$(COMPOSE) exec $(DB_SERVICE) psql -U $(POSTGRES_USER) -d $(POSTGRES_DB)

prisma-generate:
	$(COMPOSE) exec $(APP_SERVICE) pnpm exec prisma generate --schema ./prisma/schema

migrate:
	$(COMPOSE) exec $(APP_SERVICE) pnpm prisma:migrate

db-push:
	$(COMPOSE) exec $(APP_SERVICE) pnpm prisma:push

lint:
	$(COMPOSE) exec $(APP_SERVICE) pnpm lint

format-check:
	$(COMPOSE) exec $(APP_SERVICE) pnpm format:check

test:
	$(COMPOSE) exec $(APP_SERVICE) pnpm test

.PHONY: help up up-d down down-v restart ps build logs logs-api sh-db prisma-generate migrate db-push lint format-check test
