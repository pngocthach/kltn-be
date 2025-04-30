# Build stage
FROM node:23-alpine AS build

WORKDIR /app

# Copy package.json files
COPY package.json yarn.lock ./
COPY packages/server/package.json ./packages/server/
COPY packages/contract/package.json ./packages/contract/

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the server
RUN yarn workspace @kltn/server build

# Production stage
FROM node:23-alpine

WORKDIR /app

# Copy package.json files
COPY package.json yarn.lock ./
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