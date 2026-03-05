# GraphQL POC – cURL examples

Base URL: `http://localhost:3000` (or set `BASE=http://localhost:3000`).

**Prerequisite:** One user must exist to log in (e.g. `test@example.com` / `password123`). Create it via Playground or a DB seed, then use that user in step 1.

---

## 1. Login (no auth)

```bash
curl -s -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation Login($input: LoginInput!) { login(input: $input) { accessToken user { id name email } } }",
    "variables": { "input": { "email": "test@example.com", "password": "password123" } }
  }'
```

Copy `accessToken` and `user.id` from the response. For the next commands, set:

```bash
export TOKEN="<paste_accessToken_here>"
export USER_ID="<paste_user_id_here>"
```

---

## 2. Create user

```bash
curl -s -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "mutation CreateUser($data: CreateUserInput!) { createUser(data: $data) { id name email } }",
    "variables": { "data": { "name": "Alice", "email": "alice@example.com", "password": "secret123" } }
  }'
```

---

## 3. Create user with nested posts (transaction)

```bash
curl -s -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "mutation CreateUserWithPosts($input: CreateUserWithPostsInput!) { createUserWithPosts(input: $input) { id name email posts { id title } } }",
    "variables": {
      "input": {
        "user": { "name": "Bob", "email": "bob@example.com", "password": "bob123" },
        "posts": [
          { "title": "Bobs first post", "content": "Hello world" },
          { "title": "Bobs second post" }
        ]
      }
    }
  }'
```

---

## 4. Create post

Use `USER_ID` from login (or any valid user id).

```bash
curl -s -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"query\": \"mutation CreatePost(\$data: CreatePostInput!) { createPost(data: \$data) { id title content authorId } }\",
    \"variables\": { \"data\": { \"title\": \"Standalone post\", \"content\": \"Some content\", \"authorId\": \"$USER_ID\" } }
  }"
```

Save `id` from response as `POST_ID` for the next step: `export POST_ID="<id>"`

---

## 5. Create comment

```bash
curl -s -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"query\": \"mutation CreateComment(\$data: CreateCommentInput!) { createComment(data: \$data) { id content postId authorId } }\",
    \"variables\": { \"data\": { \"content\": \"A comment\", \"postId\": \"$POST_ID\", \"authorId\": \"$USER_ID\" } }
  }"
```

---

## 6. Create post with comments (transaction)

```bash
curl -s -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"query\": \"mutation CreatePostWithComments(\$input: CreatePostWithCommentsInput!) { createPostWithComments(input: \$input) { id title } }\",
    \"variables\": {
      \"input\": {
        \"post\": { \"title\": \"Post with comments\", \"content\": \"Body\", \"authorId\": \"$USER_ID\" },
        \"comments\": [
          { \"content\": \"First comment\", \"authorId\": \"$USER_ID\" },
          { \"content\": \"Second comment\", \"authorId\": \"$USER_ID\" }
        ]
      }
    }
  }"
```

---

## 7. Users (paginated, filter, sort)

```bash
curl -s -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "query { usersPaginated(pagination: { take: 5, skip: 0 }, orderBy: { field: createdAt, direction: desc }) { items { id name email createdAt } pageInfo { totalCount hasNextPage pageSize skip } } }"
  }'
```

With filter (name contains):

```bash
curl -s -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "query { usersPaginated(pagination: { take: 10 }, where: { name_contains: \"ob\" }) { items { id name email } pageInfo { totalCount } } }"
  }'
```

---

## 8. Posts (paginated)

```bash
curl -s -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "query { postsPaginated(pagination: { take: 5, skip: 0 }) { items { id title authorId createdAt } pageInfo { totalCount hasNextPage } } }"
  }'
```

---

## 9. Aggregation counts

```bash
curl -s -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "query { aggregationCounts { userCount postCount commentCount } }"
  }'
```

---

## 10. User with nested posts

```bash
curl -s -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"query\": \"query { getUser(id: \\\"$USER_ID\\\") { id name email posts { id title content createdAt } } }\"
  }"
```

---

## 11. Post with author and comments

```bash
curl -s -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"query\": \"query { post(id: \\\"$POST_ID\\\") { id title content author { id name email } comments { id content authorId createdAt } } }\"
  }"
```

---

## 12. Update user

```bash
curl -s -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"query\": \"mutation UpdateUser(\$id: ID!, \$data: UpdateUserInput!) { updateUser(id: \$id, data: \$data) { id name email } }\",
    \"variables\": { \"id\": \"$USER_ID\", \"data\": { \"name\": \"Updated Name\" } }
  }"
```

---

## Run full scenario (script)

```bash
chmod +x scripts/test-graphql-curl.sh
./scripts/test-graphql-curl.sh
# Or with custom base URL:
./scripts/test-graphql-curl.sh http://localhost:4000
```

The script expects a user `test@example.com` / `password123` to exist for login.
