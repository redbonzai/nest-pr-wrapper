# Base image
FROM node:21-alpine as development
# Alpine setup for pnpm
RUN apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app

COPY package*.json ./
COPY pnpm-lock.yaml ./

RUN npm install -g pnpm
RUN pnpm install

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Log the contents of the dist directory for debugging
RUN ls -R dist

# Command to run the application
CMD ["node", "/app/dist/src/main.js"]
