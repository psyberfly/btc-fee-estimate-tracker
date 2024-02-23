# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /home/node/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Change ownership of the working directory to the 'node' user
RUN chown -R node:node /home/node/app

USER node

ENV SERVER_PORT=3561
ENV WSS_PORT=3572

# Install app dependencies
RUN npm install
RUN npm install typescript

# Define the health check command
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
CMD curl -f http://localhost:3561/ || exit 1

# Copy app source
COPY --chown=node:node . .

# Expose the port the app runs on
EXPOSE 3561
EXPOSE 3572

CMD npx prisma migrate deploy && npx prisma generate && npx tsc && npm start
