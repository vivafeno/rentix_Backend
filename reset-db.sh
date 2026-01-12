#!/bin/bash

# EJECUTAR COMANDO ==> ./reset-db.sh

set -e

echo "🧨 Parando contenedores y eliminando volúmenes..."
docker compose down -v

echo "🧹 Limpiando volúmenes Docker huérfanos..."
docker volume prune -f

echo "🚀 Levantando contenedores..."
docker compose up -d

echo "🟢 Arrancando backend en modo desarrollo..."
npm run start:dev
