#!/bin/bash

# Production deployment script

# Stop running containers
echo "Stopping running containers..."
docker-compose down

# Pull latest changes from repository
echo "Pulling latest changes..."
git pull

# Create production environment files if they don't exist
if [ ! -f "packages/server/.env.production" ]; then
  echo "Creating server production environment file..."
  cp packages/server/.env.example packages/server/.env.production
  # Prompt to edit the file
  echo "Please edit packages/server/.env.production with your production settings"
  read -p "Press enter to continue after editing..."
fi

if [ ! -f "packages/web/.env.production" ]; then
  echo "Creating web production environment file..."
  cp packages/web/.env.example packages/web/.env.production
  # Prompt to edit the file
  echo "Please edit packages/web/.env.production with your production settings"
  read -p "Press enter to continue after editing..."
fi

# Create SSL directory if it doesn't exist
if [ ! -d "nginx/ssl" ]; then
  echo "Creating SSL directory..."
  mkdir -p nginx/ssl
  echo "Please place your SSL certificates in the nginx/ssl directory:"
  echo "  - fullchain.pem (certificate chain)"
  echo "  - privkey.pem (private key)"
  read -p "Press enter to continue after adding certificates..."
fi

# Create logs directory if it doesn't exist
if [ ! -d "nginx/logs" ]; then
  echo "Creating logs directory..."
  mkdir -p nginx/logs
fi

# Build and start containers
echo "Building and starting containers..."
docker-compose build --no-cache
docker-compose up -d

# Show container status
echo "Container status:"
docker-compose ps

echo "Deployment complete!"