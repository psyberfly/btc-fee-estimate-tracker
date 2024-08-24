#!/bin/sh

npx prisma db migrate && \
npm run start
 