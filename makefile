.PHONY: dev test help
.DEFAULT_GOAL: help

default: help

help: ## Output available commands
	@echo "Available commands:"
	@echo
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'

local_test: ## local test
	@docker-compose build local_test
	@docker-compose run --rm local_test

local_test_update: ## local test to update baseline snapshots
	@docker-compose build local_test_update
	@docker-compose run --rm local_test_update