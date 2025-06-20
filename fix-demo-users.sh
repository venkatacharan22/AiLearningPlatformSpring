#!/bin/bash

echo "🔧 Fixing demo users with proper password encryption..."

# Stop the backend
echo "Stopping backend..."
pkill -f "spring-boot:run"
sleep 3

# Remove the users.json file to start fresh
echo "Removing existing users..."
rm -f data/users.json

# Start the backend
echo "Starting backend..."
./mvnw spring-boot:run &
BACKEND_PID=$!

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 30

# Check if backend is running
while ! curl -s http://localhost:8080/api/setup/status > /dev/null; do
    echo "Waiting for backend..."
    sleep 5
done

echo "Backend is running!"

# Create demo users using registration endpoint (which properly encodes passwords)
echo "Creating admin user..."
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@learningplatform.com","password":"admin123","firstName":"Admin","lastName":"User","role":"ADMIN"}' \
  -s | grep -q "token" && echo "✅ Admin user created" || echo "❌ Admin user failed"

echo "Creating instructor user..."
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"instructor","email":"instructor@learningplatform.com","password":"instructor123","firstName":"John","lastName":"Doe","role":"INSTRUCTOR","bio":"Experienced educator","expertise":"Java, React"}' \
  -s | grep -q "token" && echo "✅ Instructor user created" || echo "❌ Instructor user failed"

echo "Creating student user..."
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"student","email":"student@learningplatform.com","password":"student123","firstName":"Jane","lastName":"Smith","role":"STUDENT"}' \
  -s | grep -q "token" && echo "✅ Student user created" || echo "❌ Student user failed"

# Test login
echo "Testing student login..."
LOGIN_RESULT=$(curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"student","password":"student123"}' \
  -s)

if echo "$LOGIN_RESULT" | grep -q "token"; then
    echo "🎉 SUCCESS! Student login works!"
    echo "Demo accounts are ready:"
    echo "  Admin: admin/admin123"
    echo "  Instructor: instructor/instructor123"
    echo "  Student: student/student123"
else
    echo "❌ Student login still failed"
    echo "Response: $LOGIN_RESULT"
fi

echo "Backend PID: $BACKEND_PID"
echo "Use 'kill $BACKEND_PID' to stop the backend"
