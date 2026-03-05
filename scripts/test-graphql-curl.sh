#!/usr/bin/env bash
# Full GraphQL POC test via curl
# Usage: ./scripts/test-graphql-curl.sh [BASE_URL]
# Default BASE_URL=http://localhost:3000

BASE_URL="${1:-http://localhost:3000}"
GQL="${BASE_URL}/graphql"

echo "=== 1. Login (get JWT) ==="
# Ensure a user exists first: e.g. create via Playground or run: createUser with a temporary token bypass.
# For this script we assume: test@example.com / password123
LOGIN_RESP=$(curl -s -X POST "$GQL" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation Login($input: LoginInput!) { login(input: $input) { accessToken user { id name email } } }",
    "variables": { "input": { "email": "test@example.com", "password": "password123" } }
  }')
echo "$LOGIN_RESP" | head -c 500
echo ""

TOKEN=$(echo "$LOGIN_RESP" | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')
if [ -z "$TOKEN" ]; then
  echo "Login failed or user missing. Create user test@example.com with password password123 first (e.g. DB seed or Playground)."
  exit 1
fi

# Logged-in user id (for authorId in posts/comments)
USER_ID=$(echo "$LOGIN_RESP" | sed -n 's/.*"user":{[^}]*"id":"\([^"]*\)".*/\1/p')
if [ -z "$USER_ID" ]; then
  USER_ID=$(echo "$LOGIN_RESP" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
fi

AUTH_HEADER="Authorization: Bearer $TOKEN"
echo "Token obtained. User ID: $USER_ID"

echo ""
echo "=== 2. Create user (with password for later logins) ==="
CREATE_USER_RESP=$(curl -s -X POST "$GQL" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d '{
    "query": "mutation CreateUser($data: CreateUserInput!) { createUser(data: $data) { id name email } }",
    "variables": { "data": { "name": "Alice", "email": "alice@example.com", "password": "secret123" } }
  }')
echo "$CREATE_USER_RESP" | head -c 400
echo ""

echo ""
echo "=== 3. Create user with nested posts (transaction) ==="
CREATE_USER_POSTS_RESP=$(curl -s -X POST "$GQL" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d '{
    "query": "mutation CreateUserWithPosts($input: CreateUserWithPostsInput!) { createUserWithPosts(input: $input) { id name email posts { id title } } }",
    "variables": {
      "input": {
        "user": { "name": "Bob", "email": "bob@example.com", "password": "bob123" },
        "posts": [{ "title": "Bobs first post", "content": "Hello world" }, { "title": "Bobs second post" }]
      }
    }
  }')
echo "$CREATE_USER_POSTS_RESP" | head -c 600
echo ""

echo ""
echo "=== 4. Create post (author = logged-in user) ==="
CREATE_POST_RESP=$(curl -s -X POST "$GQL" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d "{
    \"query\": \"mutation CreatePost(\$data: CreatePostInput!) { createPost(data: \$data) { id title content authorId } }\",
    \"variables\": { \"data\": { \"title\": \"Standalone post\", \"content\": \"Some content\", \"authorId\": \"$USER_ID\" } }
  }")
echo "$CREATE_POST_RESP" | head -c 400
echo ""

POST_ID=$(echo "$CREATE_POST_RESP" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p' | head -1)

echo ""
echo "=== 5. Create comment ==="
if [ -n "$POST_ID" ]; then
  curl -s -X POST "$GQL" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HEADER" \
    -d "{
      \"query\": \"mutation CreateComment(\$data: CreateCommentInput!) { createComment(data: \$data) { id content postId authorId } }\",
      \"variables\": { \"data\": { \"content\": \"A comment\", \"postId\": \"$POST_ID\", \"authorId\": \"$USER_ID\" } }
    }" | head -c 400
  echo ""
fi

echo ""
echo "=== 6. Create post with comments (transaction) ==="
curl -s -X POST "$GQL" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d "{
    \"query\": \"mutation CreatePostWithComments(\$input: CreatePostWithCommentsInput!) { createPostWithComments(input: \$input) { id title comments { id content } } }\",
    \"variables\": {
      \"input\": {
        \"post\": { \"title\": \"Post with comments\", \"content\": \"Body\", \"authorId\": \"$USER_ID\" },
        \"comments\": [
          { \"content\": \"First comment\", \"authorId\": \"$USER_ID\" },
          { \"content\": \"Second comment\", \"authorId\": \"$USER_ID\" }
        ]
      }
    }
  }" | head -c 500
echo ""

echo ""
echo "=== 7. Users (paginated, filter, sort) ==="
curl -s -X POST "$GQL" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d '{
    "query": "query UsersPaginated { usersPaginated(pagination: { take: 5, skip: 0 }, where: {}, orderBy: { field: createdAt, direction: desc }) { items { id name email createdAt } pageInfo { totalCount hasNextPage pageSize skip } } }"
  }' | head -c 600
echo ""

echo ""
echo "=== 8. Posts (paginated) ==="
curl -s -X POST "$GQL" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d '{
    "query": "query PostsPaginated { postsPaginated(pagination: { take: 5, skip: 0 }) { items { id title authorId createdAt } pageInfo { totalCount hasNextPage } } }"
  }' | head -c 500
echo ""

echo ""
echo "=== 9. Aggregation counts ==="
curl -s -X POST "$GQL" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d '{
    "query": "query Counts { aggregationCounts { userCount postCount commentCount } }"
  }'
echo ""

echo ""
echo "=== 10. User with nested posts ==="
if [ -n "$USER_ID" ]; then
  curl -s -X POST "$GQL" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HEADER" \
    -d "{
      \"query\": \"query GetUserWithPosts { getUser(id: \\\"$USER_ID\\\") { id name email posts { id title content createdAt } } }\"
    }" | head -c 600
  echo ""
fi

echo ""
echo "=== 11. Post with author and comments ==="
if [ -n "$POST_ID" ]; then
  curl -s -X POST "$GQL" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HEADER" \
    -d "{
      \"query\": \"query GetPostWithRelations { post(id: \\\"$POST_ID\\\") { id title content author { id name email } comments { id content authorId createdAt } } }\"
    }" | head -c 600
  echo ""
fi

echo ""
echo "=== 12. Filter users (name contains) ==="
curl -s -X POST "$GQL" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d '{
    "query": "query FilterUsers { usersPaginated(pagination: { take: 10 }, where: { name_contains: \"ob\" }) { items { id name email } pageInfo { totalCount } } }"
  }' | head -c 400
echo ""

echo ""
echo "Done."
