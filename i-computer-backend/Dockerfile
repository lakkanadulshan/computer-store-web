# Use official Node.js image (version 20 - stable)
FROM node:20  

# Set working directory inside container
WORKDIR /app  

# Copy package.json and package-lock.json first
# (helps Docker cache dependencies layer)
COPY package*.json ./  

# Install dependencies
RUN npm install  

# Copy all project files into container
COPY . .  

# Tell Docker that app runs on port 5000
EXPOSE 5000  

# Command to start the app
CMD ["npm", "start"]