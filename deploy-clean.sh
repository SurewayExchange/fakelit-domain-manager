#!/bin/bash

set -e

echo "🧹 Cleaning sensitive data..."
# Remove or replace sensitive files
rm -f config/sms-config.json
rm -f configure-twilio.js
rm -f fakelit-production/config/twilio-config.json
rm -f fakelit-auto-scaling-config.json
rm -f deploy-to-existing-cloudways.js
rm -f fakelit-deployment/deploy-to-cloudways.sh
rm -f fakelit-deployment/fakelit-cloudways-deploy/.cloudways

echo "🔄 Adding all changes..."
git add .

echo "📝 Committing changes..."
git commit -m "Clean deployment: $(date '+%Y-%m-%d %H:%M:%S')" || echo "Nothing to commit."

echo "🚀 Pushing to GitHub (origin main)..."
git push origin main

echo "✅ Code pushed to GitHub."

echo "⏳ Waiting for Cloudways to deploy (10s)..."
sleep 10

echo "🔎 Checking deployment health at https://fakelit.com/health ..."
curl -f https://fakelit.com/health && echo "✅ Deployment health check passed." || echo "❌ Health check failed."

echo "🎉 Fakelit.com deployment complete!" 