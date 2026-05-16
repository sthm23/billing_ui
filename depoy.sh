#!/bin/bash
set -e

echo "🚀 Deploying Frontend..."

cd /var/www/billing-ui

echo "📥 Pulling latest changes..."
git pull origin main

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building Angular app..."
ng build --configuration production

echo "✅ Frontend deployment complete!"
echo "🌐 Visit: https://sthm23.uz"
