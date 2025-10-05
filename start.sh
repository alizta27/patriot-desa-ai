#!/bin/bash

echo "🚀 Starting Patriot Desa application..."

# Start Vite dev server in background
echo "📦 Starting Vite dev server..."
npm run dev &
VITE_PID=$!

# Wait for Vite to be ready
echo "⏳ Waiting for Vite to start..."
sleep 5

# Start proxy server
echo "🔄 Starting proxy server on port 5000..."
node server.js &
PROXY_PID=$!

echo "✅ Application started!"
echo "   - Vite dev server: http://localhost:8080 (or 8081)"
echo "   - Proxy server: http://localhost:5000"

# Handle cleanup on exit
trap "kill $VITE_PID $PROXY_PID 2>/dev/null" EXIT

# Wait for both processes
wait $VITE_PID $PROXY_PID
