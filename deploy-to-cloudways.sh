#!/bin/bash

set -e

echo "🔄 Adding all changes..."
git add .

echo "📝 Committing changes..."
git commit -m "Automated deploy: $(date '+%Y-%m-%d %H:%M:%S')" || echo "Nothing to commit."

echo "🚀 Pushing to GitHub (origin main)..."
git push origin main

echo "✅ Code pushed to GitHub."

echo "⏳ Waiting for Cloudways to deploy (10s)..."
sleep 10

echo "🔎 Checking deployment health at https://fakelit.com/health ..."
curl -f https://fakelit.com/health && echo "✅ Deployment health check passed." || echo "❌ Health check failed."

echo "🎉 Fakelit.com deployment complete!" 