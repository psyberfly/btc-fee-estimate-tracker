# Base Stage: Shared dependencies and setup
FROM node:18-alpine AS base

# Set the working directory in the container
WORKDIR /home/node/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Development Stage
FROM base AS development

# Copy the application source code for development
COPY . .

# Set environment variables for development
ENV NODE_ENV=development
ENV SERVER_PORT=3583

# Expose necessary ports for development
EXPOSE 3583

# Command to run the app in development mode (with live reloading)
CMD ["npm", "run", "dev"]

# Build Stage: Production build
FROM base AS build

# Copy the application source code for building
COPY . .

# Build the application
RUN npm run build

# Production Stage
FROM node:18-alpine AS production

# Set the working directory in the container
WORKDIR /home/node/app

# Copy only the necessary files from the build stage
COPY --from=build /home/node/app/node_modules ./node_modules
COPY --from=build /home/node/app/dist ./dist
COPY --from=build /home/node/app/package*.json ./
COPY --from=build /home/node/app/vite.config.js ./vite.config.js 

# Change ownership of the working directory to the 'node' user
RUN chown -R node:node /home/node/app

# Switch to the 'node' user
USER node

# Set environment variables for production
ENV NODE_ENV=production
ENV SERVER_PORT=3583

# Expose the port the app runs on
EXPOSE 3583

# Command to run the app in production mode
CMD ["npm", "start"]
