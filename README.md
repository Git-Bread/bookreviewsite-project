# Book Review API Documentation

This is a REST API for managing book reviews with user authentication built with Next.js. It allows users to register, login, and manage their book reviews securely.

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/bookapi-project.git
cd bookapi-project
```
2. Install dependencies
```bash
npm install
# or
yarn install
```
3. Create the database
```bash
npm run db:create
```
4. Setup enviroment variable IMPORTANT!
- NEXTAUTH_SECRET=your-secure-secret-key

5. Run development server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

## API Reference

### Authentication Routes

#### Register a new user
```
POST /api/auth/register
```
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
    "id": "number",
    "username": "string"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Missing required fields or password too short
  - `409 Conflict`: Username already exists
  - `500 Internal Server Error`: Server error

#### Login
```
POST /api/auth/login
```
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "user": {
      "id": "number",
      "username": "string"
    },
    "success": true
  }
  ```
  Also sets a secure HTTP-only cookie with the JWT token.
- **Error Responses**:
  - `400 Bad Request`: Missing credentials
  - `401 Unauthorized`: Invalid credentials
  - `500 Internal Server Error`: Server error

#### Logout
```
POST /api/auth/logout
```
- **Success Response**: `200 OK`
  ```json
  {
    "success": true
  }
  ```
  Also clears the authentication cookie.
- **Error Response**: `500 Internal Server Error`: Server error

#### NextAuth
```
GET/POST /api/auth/[...nextauth]
```
- NextAuth.js authentication endpoints
- Manages sessions, callbacks, and JWT processing

### Review Routes

#### Get all reviews by authenticated user
```
GET /api/reviews
```
- **Authentication**: Required (JWT token)
- **Success Response**: `200 OK`
  ```json
  [
    {
      "id": "number",
      "userId": "number",
      "bookId": "string",
      "rating": "number",
      "review": "string",
      "title": "string",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
  ```
- **Error Responses**:
  - `401 Unauthorized`: Missing or invalid token
  - `500 Internal Server Error`: Server error

#### Create a new review
```
POST /api/reviews
```
- **Authentication**: Required (JWT token)
- **Request Body**:
  ```json
  {
    "bookId": "string",
    "rating": "number",
    "review": "string",
    "title": "string"
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
    "id": "number",
    "userId": "number",
    "bookId": "string",
    "rating": "number",
    "review": "string",
    "title": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Missing bookId
  - `401 Unauthorized`: Missing or invalid token
  - `500 Internal Server Error`: Server error

#### Get a specific review
```
GET /api/reviews/[id]
```
- **Authentication**: Not required
- **Path Parameters**: `id` - The review ID
- **Success Response**: `200 OK`
  ```json
  {
    "id": "number",
    "userId": "number",
    "bookId": "string",
    "rating": "number",
    "review": "string",
    "title": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Invalid review ID
  - `404 Not Found`: Review not found
  - `500 Internal Server Error`: Server error

#### Update a review
```
PUT /api/reviews/[id]
```
- **Authentication**: Required (JWT token)
- **Path Parameters**: `id` - The review ID
- **Request Body**:
  ```json
  {
    "rating": "number",
    "review": "string",
    "title": "string"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "id": "number",
    "userId": "number",
    "bookId": "string",
    "rating": "number",
    "review": "string",
    "title": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Invalid review ID
  - `401 Unauthorized`: Missing or invalid token
  - `404 Not Found`: Review not found or user doesn't have permission
  - `500 Internal Server Error`: Server error

#### Delete a review
```
DELETE /api/reviews/[id]
```
- **Authentication**: Required (JWT token)
- **Path Parameters**: `id` - The review ID
- **Success Response**: `200 OK`
  ```json
  {
    "success": true,
    "message": "Review deleted successfully"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Invalid review ID
  - `401 Unauthorized`: Missing or invalid token
  - `404 Not Found`: Review not found or user doesn't have permission
  - `500 Internal Server Error`: Server error

## Authentication

The API uses two authentication mechanisms:
1. **JWT tokens** via HTTP-only cookies
2. **NextAuth.js** for more complex authentication flows

Protected routes require a valid JWT token which can be provided either:
- As an HTTP-only cookie named `token` (set automatically on login)
- In the `Authorization` header using the Bearer scheme
