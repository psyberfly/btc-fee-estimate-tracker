# FROM node:18

# WORKDIR /home/node/app

# # Copy package files and install dependencies
# COPY package*.json ./
# RUN npm install

# # Ensure proper ownership
# COPY --chown=node:node . .
# RUN chown -R node:node /home/node/app

# # Use non-root user
# USER node

# ENV SERVER_PORT=3583

# # Build the application
# RUN npm run build

# # Expose the application port
# EXPOSE 3583

# # Start the application
# CMD ["npm", "run", "start"]


# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /home/node/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Change ownership of the working directory to the 'node' user
RUN chown -R node:node /home/node/app

USER node

ENV SERVER_PORT=3583

# Install app dependencies
RUN npm install

# Copy app source
COPY --chown=node:node . .

# Expose the port the app runs on
EXPOSE 3583

# Command to run the app
CMD npx vite build && npm start
