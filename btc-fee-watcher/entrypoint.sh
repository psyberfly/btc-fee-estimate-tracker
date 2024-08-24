#!/bin/sh

npx prisma migrate resolve --applied 0_init && \
npx prisma migrate deploy && \
npm run start
 