# Use an official Node.js runtime as a parent image
FROM node:20

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Port the application will run on container
EXPOSE 3000

# Command to run the application in development mode, binding to all interfaces
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]