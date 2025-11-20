#!/bin/bash

echo "🚀 Starting Inventory Management System"
echo ""

# Check if backend dependencies are installed
if [ ! -d "backend/node_modules" ]; then
  echo "📦 Installing backend dependencies..."
  cd backend && npm install && cd ..
fi

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
  echo "📦 Installing frontend dependencies..."
  cd frontend && npm install && cd ..
fi

echo ""
echo "✅ Starting backend server on http://localhost:3000"
cd backend && npm run dev &
BACKEND_PID=$!

echo "✅ Starting frontend server on http://localhost:5173"
cd ../frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo "════════════════════════════════════════════════"
echo "🎉 Application is starting!"
echo "════════════════════════════════════════════════"
echo ""
echo "📍 Frontend: http://localhost:5173"
echo "📍 Backend:  http://localhost:3000"
echo ""
echo "🔍 Test barcode scanner:"
echo "   1. Enter barcode: 12345"
echo "   2. Click 'Scannen' button"
echo "   3. Click 'Add 5' or 'Remove 3' buttons"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
