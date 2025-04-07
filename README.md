# Book Review API Documentation

This is a REST API for managing book reviews with user authentication built with Next.js. It allows users to register, login, and manage their book reviews securely.

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Technology Stack

- **Frontend**: Next.js 14 (App Router)
- **Backend**: Next.js API Routes
- **Database**: SQLite with Drizzle ORM
- **Authentication**: NextAuth.js and bcrypt

### Packages & Dependencies

- **Core**:
  - `next`: React framework with integrated API routes
  - `react` & `react-dom`: UI library
  - `next-auth`: Authentication and session management

- **Database**:
  - `drizzle-orm`: TypeScript ORM
  - `@libsql/client`: SQLite database driver
  - `better-sqlite3`: SQLite database engine

- **Authentication & Security**:
  - `bcryptjs`: Password hashing
  - `zod`: Schema validation

- **Development & Typing**:
  - `typescript`: Type safety
  - `eslint` & `prettier`: Code quality
  - `drizzle-kit`: Database migration and management

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

3. Create a `.env.local` file in the root of your project with the following variables:
```
NEXTAUTH_SECRET=your-secure-secret-key
NEXTAUTH_URL=http://localhost:3000
```

4. Create and seed the database
```bash
npm run db:create
```

5. Run development server
```bash
npm run dev
# or
yarn dev
```

6. Access your API at `http://localhost:3000`

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

#### NextAuth Endpoints
```
GET/POST /api/auth/[...nextauth]
```
- NextAuth.js authentication endpoints
- Manages sessions, callbacks, and JWT processing
- Handles login, logout and session validation

### User Routes

#### Get all users (Admin only)
```
GET /api/users
```
- **Authentication**: Required (JWT token with admin privileges)
- **Success Response**: `200 OK`
  ```json
  [
    {
      "id": "number",
      "username": "string",
      "admin": "boolean",
      "createdAt": "string"
    }
  ]
  ```
- **Error Responses**:
  - `401 Unauthorized`: Missing token
  - `403 Forbidden`: User is not an admin
  - `500 Internal Server Error`: Server error

#### Update a user
```
PATCH /api/users/[id]
```
- **Authentication**: Required (JWT token)
- **Path Parameters**: `id` - The user ID
- **Request Body**:
  ```json
  {
    "password": "string" // Optional
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "id": "number",
    "username": "string"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Invalid request body
  - `401 Unauthorized`: Missing token
  - `403 Forbidden`: Insufficient permissions
  - `404 Not Found`: User not found
  - `500 Internal Server Error`: Server error

#### Delete a user (Admin only)
```
DELETE /api/users/[id]
```
- **Authentication**: Required (JWT token with admin privileges)
- **Path Parameters**: `id` - The user ID
- **Query Parameters**: 
  - `deleteReviews` - Set to "true" to delete user's reviews (optional)
- **Success Response**: `200 OK`
  ```json
  {
    "success": true,
    "message": "User deleted successfully"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Cannot delete your own account
  - `401 Unauthorized`: Missing token
  - `403 Forbidden`: User is not an admin
  - `404 Not Found`: User not found
  - `409 Conflict`: User has reviews and deleteReviews=false
  - `500 Internal Server Error`: Server error

### Review Routes

#### Get reviews with filters
```
GET /api/reviews
```
- **Query Parameters**:
  - `userId`: Get reviews by specific user
  - `all`: Set to "true" to get all reviews
  - `q`: Search query for title or review content
  - `page` & `perPage`: Pagination parameters
  - `recent`: Set to "true" to get most recent reviews
  - `limit`: Number of reviews to return (default: 10)

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
  
- **For Search Queries**:
  ```json
  {
    "items": [/* reviews */],
    "totalItems": "number"
  }
  ```

- **Error Responses**:
  - `401 Unauthorized`: For user-specific queries without authentication
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
  - `400 Bad Request`: Missing bookId or invalid data
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

The API uses NextAuth.js for authentication which provides:

- **JWT-based sessions** - Secure HTTP-only cookies
- **Role-based access control** - Admin vs regular users
- **Session management** - Automatic token refresh and validation

Protected routes require a valid session which is handled automatically by NextAuth when you:
1. Login via the `/api/auth/signin` endpoint
2. Include the session cookie in subsequent requests

## Project Structure

```
bookapi-project/
├── app/                  # Next.js App Router
│   ├── api/              # API Routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── reviews/      # Review CRUD endpoints
│   │   └── users/        # User management endpoints
├── db/                   # Database configuration
│   ├── index.ts          # Database connection
│   └── schema.ts         # Drizzle schema definition
├── lib/                  # Utility functions
│   └── auth.ts           # NextAuth configuration
```