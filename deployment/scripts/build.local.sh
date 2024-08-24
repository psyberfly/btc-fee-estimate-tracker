#!/bin/bash

BUILD_TARGET=development docker compose --env-file ../config/.env.local -f ./docker-compose.yml -f ./docker-compose.dev.yml up --build --no-start -d 
