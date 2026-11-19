#!/bin/bash
# Test the bookmarks API endpoint

echo "Testing Bookmarks API..."
echo ""

# First, login to get a token
echo "1. Logging in as John Doe..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}')

echo "Login response:"
echo $LOGIN_RESPONSE | jq '.' 2>/dev/null || echo $LOGIN_RESPONSE
echo ""

# Extract token
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token' 2>/dev/null)

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Failed to get token!"
  exit 1
fi

echo "✅ Got token: ${TOKEN:0:50}..."
echo ""

# Test bookmarks endpoint
echo "2. Fetching bookmarks..."
BOOKMARKS_RESPONSE=$(curl -s -X GET http://localhost:5000/api/posts/bookmarks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Bookmarks response:"
echo $BOOKMARKS_RESPONSE | jq '.' 2>/dev/null || echo $BOOKMARKS_RESPONSE
echo ""

# Count bookmarks
COUNT=$(echo $BOOKMARKS_RESPONSE | jq -r '.count' 2>/dev/null)
echo "Number of bookmarks: $COUNT"

