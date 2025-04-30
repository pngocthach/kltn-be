# syntax=docker/dockerfile:1

ARG NODE_VERSION=23

# Build stage for all packages
FROM node:${NODE_VERSION}-alpine AS build

WORKDIR /app

# Copy root package.json and yarn.lock
COPY package.json yarn.lock ./

# Create package directories
RUN mkdir -p packages/server packages/web packages/contract

# Copy individual package.json files
COPY packages/server/package.json ./packages/server/
COPY packages/web/package.json ./packages/web/
COPY packages/contract/package.json ./packages/contract/

# Install all dependencies (including dev dependencies)
RUN yarn install --frozen-lockfile

# Copy all source code
COPY . .

# Build packages in the correct order
RUN yarn workspace @kltn/contract build
RUN yarn workspace @kltn/server build
RUN yarn workspace @kltn/web build

# Server production stage
FROM node:${NODE_VERSION}-alpine AS server

WORKDIR /app

# Copy root package.json and yarn.lock
COPY package.json yarn.lock ./

# Create package directories
RUN mkdir -p packages/server packages/contract

# Copy package.json files
COPY packages/server/package.json ./packages/server/
COPY packages/contract/package.json ./packages/contract/

# Install production dependencies only
RUN yarn install --frozen-lockfile --production

# Copy built files from build stage
COPY --from=build /app/packages/server/dist ./packages/server/dist
COPY --from=build /app/packages/contract/dist ./packages/contract/dist

# Expose port
EXPOSE 5000

# Start the server
CMD ["node", "packages/server/dist/index.js"]

# Web production stage
FROM node:${NODE_VERSION}-alpine AS web

WORKDIR /app

# Install serve to serve static files
RUN yarn global add serve

# Copy built files from build stage
COPY --from=build /app/packages/web/dist ./dist

# Expose port
EXPOSE 5173

# Start the app
CMD ["serve", "-s", "dist", "-l", "5173"]
