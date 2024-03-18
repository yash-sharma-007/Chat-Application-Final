# Use the official Node.js image as a base
FROM node:16-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if present)
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Install TypeScript globally
RUN npm install -g typescript

# Copy the rest of your application code
COPY . .

# Build TypeScript code
RUN npm run build

# Expose the port your app runs on (if necessary)
EXPOSE 3001

# Command to run your app
CMD ["npm", "run","dev"]
