#!/usr/bin/env bash
set -e

echo "🧹 Full Cleanup..."
docker compose down -v

echo "🚀 Starting Services..."
docker compose up --build -d

echo "⏳ Waiting for Migrations to finish (15s)..."
sleep 15

echo "🌱 SEEDING DATA..."
# Direktno SQL ubacivanje preko docker exec
docker exec -i character-db psql -U postgres -d character_db <<EOF
INSERT INTO character_class (id, name, description) 
VALUES (gen_random_uuid(), 'Warrior', 'Heavy damage dealer')
ON CONFLICT (name) DO NOTHING;
EOF

echo "📊 VERIFICATION:"
docker exec -it character-db psql -U postgres -d character_db -c 'SELECT * FROM character_class;'

echo "✅ All set! System is ready."