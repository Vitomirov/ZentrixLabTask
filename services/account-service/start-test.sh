#!/bin/bash
set -e

echo "Reset environment"
docker compose down -v --remove-orphans
docker system prune -f

echo "Build account service & DB"
docker compose build account-db account-service

echo "Start database"
docker compose up -d account-db
sleep 10

echo "Run migrations"
docker compose run --rm account-service npm run migration:run

echo "Start account service"
docker compose up -d account-service

echo "Waiting for /health..."
until curl -sf http://localhost:3001/health > /dev/null; do
  sleep 2
done

echo "Health OK"

echo "Register"
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"123456","role":"User"}'

echo
echo "Login"
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"123456"}'

echo
echo "DONE"
