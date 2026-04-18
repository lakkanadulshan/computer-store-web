From node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

# Vite requires --host to be exposed outside the Docker container
CMD ["npm", "run", "dev", "--", "--host"]