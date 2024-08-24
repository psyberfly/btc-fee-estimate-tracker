#!/bin/sh

# Check if the migration is already applied
MIGRATION_NAME="0_init"
APPLIED=$(npx prisma migrate status --schema=./prisma/schema.prisma --json | grep -o "$MIGRATION_NAME" | wc -l)

if [ "$APPLIED" -eq "0" ]; then
  echo "Migration $MIGRATION_NAME not applied. Resolving and deploying..."
  npx prisma migrate resolve --applied $MIGRATION_NAME
  npx prisma migrate deploy
else
  echo "Migration $MIGRATION_NAME already applied. Skipping..."
fi

# Start the application
npm run start
