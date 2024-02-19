#!/bin/bash

# Ensure this script is executable with: chmod +x setup.sh

prompt_user() {
    read -p "Enter value for $1: " value
    echo "$1=$value" >>.env
}

cp .example.env .env

echo "Please update the environment variables in .env:"
prompt_user "DB_HOST"
prompt_user "DB_USER"
prompt_user "DB_PASSWORD"
prompt_user "DB_NAME"

npm install
npx prisma migrate deploy
tsc

exit 0
