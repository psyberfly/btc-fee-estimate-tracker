#!/bin/bash

BUILD_TARGET=production docker compose --env-file ../config/.env.prod up --build --no-start -d 
