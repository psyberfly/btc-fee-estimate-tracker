# Base Stage: Shared dependencies and setup
FROM node:18-alpine AS base

# Set the working directory in the container
WORKDIR /home/node/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the application source code
COPY . .

# Development Stage
FROM base AS development

# Copy the entry point for development
COPY --chown=node:node ./entrypoint.dev.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh
# Set environment variables for development
ENV NODE_ENV=development
ENV SERVER_PORT=3561
ENV WSS_PORT=3572
ENV PATH_TO_CSV="/home/node/app/assets/fee_estimate_history.csv"

# Expose necessary ports for development
EXPOSE 3561
EXPOSE 3572

# Set entrypoint
ENTRYPOINT ["./entrypoint.sh"]

# Build Stage: Production build
FROM base AS build

# Copy the rest of the application source code
COPY --chown=node:node . .

# Generate Prisma client and build the application
RUN npx prisma generate
RUN npm run build

# Production Stage
FROM node:18-alpine AS production

USER root

# Create the application directory
RUN mkdir -p /home/node/app

# Change ownership of the working directory to the 'node' user
RUN chown -R node:node /home/node/app

# Switch to the 'node' user
USER node
WORKDIR /home/node/app

# Copy the built application and dependencies from the build stage
COPY --from=build --chown=node:node /home/node/app/node_modules ./node_modules
COPY --from=build --chown=node:node /home/node/app/dist ./dist
COPY --from=build --chown=node:node /home/node/app/package*.json ./
COPY --from=build --chown=node:node /home/node/app/assets ./assets
COPY --from=build --chown=node:node /home/node/app/prisma ./prisma
COPY --chown=node:node ./entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Set environment variables for production
ENV NODE_ENV=production
ENV SERVER_PORT=3561
ENV WSS_PORT=3572
ENV PATH_TO_CSV="/home/node/app/assets/fee_estimate_history.csv"

# Expose necessary ports for production
EXPOSE 3561
EXPOSE 3572

# Set entrypoint
ENTRYPOINT ["./entrypoint.sh"]

