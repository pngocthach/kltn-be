# Deployment Instructions

## Environment Setup

1. Copy the example environment files to create your actual .env files:

```bash
cp packages/server/.env.example packages/server/.env
cp packages/web/.env.example packages/web/.env
```

2. Edit the .env files with your actual configuration values:

- `packages/server/.env`: Configure MongoDB, RabbitMQ, and authentication settings
- `packages/web/.env`: Configure API URL and other frontend settings

## Docker Deployment

Run the following command to start all services:

```bash
docker-compose up -d
```

This will start:

- Nginx load balancer
- Web frontend
- Two server instances with load balancing

Access your application at http://localhost
