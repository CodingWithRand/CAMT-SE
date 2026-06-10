# MVC Architecture Refactoring - Documentation

## Overview
This document outlines the refactored blog application using the **MVC (Model-View-Controller)** architectural pattern with Express.js, TypeScript, and proper middleware implementation.

## Project Structure

```
src/
├── app.ts                          # Main Express application entry point
├── db.ts                           # Database configuration (Supabase)
├── esbuild.js                      # Frontend bundling configuration
│
├── models/                         # Data models & database operations
│   ├── authModel.ts               # Authentication operations
│   ├── userModel.ts               # User profile operations
│   ├── blogModel.ts               # Blog post operations
│   └── commentModel.ts            # Comment operations
│
├── controllers/                    # Business logic & request handlers
│   ├── authController.ts          # Auth endpoints & page rendering
│   ├── blogController.ts          # Blog endpoints & page rendering
│   ├── commentController.ts       # Comment endpoints
│   ├── userController.ts          # User endpoints & page rendering
│   ├── uploadController.ts        # File upload endpoints
│   └── pageController.ts          # Static page rendering (About, Contact)
│
├── routes/                         # Express router configurations
│   ├── authRoutes.ts              # /auth, /login, /register, /logout paths
│   ├── blogRoutes.ts              # /, /blogs/:id, /compose, /api/blogs/* paths
│   ├── commentRoutes.ts           # /api/comments/* paths
│   ├── userRoutes.ts              # /account/*, /api/users/*, /api/auth/fetch-current-user/*
│   ├── uploadRoutes.ts            # /api/upload/* paths
│   └── pageRoutes.ts              # /about, /contact paths
│
├── middleware/                     # Express middleware
│   ├── authMiddleware.ts          # Authentication checks (required, optional, redirect)
│   ├── errorHandler.ts            # Global error handling & async wrapper
│   └── requestLogger.ts           # Request logging for debugging
│
├── utils/                          # Utility functions
│   ├── errors.ts                  # Custom error classes
│   ├── validators.ts              # Input validation functions
│   └── constants.ts               # Application constants
│
└── frontend/                       # Frontend JavaScript modules
    ├── main.js
    ├── blog.js
    ├── compose.js
    ├── home.js
    ├── landing.js
    ├── login.js
    ├── navbar.js
    ├── register.js
    └── util.js

views/                             # EJS templates
public/                            # Static files (CSS, images)
```

---

## Architecture Explanation

### 1. Models (`src/models/`)
**Purpose**: Encapsulate all database operations and business logic

- **UserModel**: User profile management
  - `getProfileByUserId()` - Retrieve profile by user ID
  - `getProfileProperty()` - Get specific profile properties
  - `createProfile()` - Create new user profile
  - `updateProfile()` - Update user profile
  
- **BlogModel**: Blog post operations
  - `createBlog()` - Create new blog post
  - `getBlogById()` - Retrieve blog by ID
  - `getAllBlogs()` - Get blogs with pagination
  - `likeBlog()` - Like a blog post
  - `getCommentCount()` - Count comments on a blog

- **CommentModel**: Comment operations
  - `createComment()` - Create new comment
  - `getComments()` - Get main comments (with pagination)
  - `getReplies()` - Get replies to a comment
  - `likeComment()` - Like a comment
  - `hasReplies()` - Check if comment has replies

- **AuthModel**: Authentication operations
  - `signUpWithEmail()` - Email/password registration
  - `signInWithEmail()` - Email/password login
  - `signInWithOAuth()` - OAuth provider login
  - `signOut()` - User logout
  - `setSession()` - OAuth session management

### 2. Controllers (`src/controllers/`)
**Purpose**: Handle HTTP requests and responses, coordinate between routes and models

- **authController**: Authentication flows
  - Renders login/register pages
  - Handles email/OAuth signup and login
  - Manages OAuth callbacks
  - Handles logout

- **blogController**: Blog-related operations
  - Renders home page (dashboard for logged-in, landing for guests)
  - Renders single blog view with comments
  - Handles blog creation and updates
  - Manages blog likes
  - Fetches blogs with pagination

- **commentController**: Comment management
  - Creates new comments and replies
  - Fetches comments/replies with pagination
  - Handles comment likes

- **userController**: User profile management
  - Renders account page
  - Renders preferences page
  - Fetches current user properties
  - Fetches other user profiles

- **uploadController**: File upload handling
  - Validates file uploads
  - Generates MD5 hashes for file names
  - Uploads to Supabase Storage
  - Returns public URLs

- **pageController**: Static pages
  - Renders About page
  - Renders Contact page

### 3. Routes (`src/routes/`)
**Purpose**: Define URL patterns and map them to controller methods

Each route file uses Express Router and imports relevant middleware:
- Authentication checks (required, optional, guest-only)
- Request validation
- Error handling

**Route Organization**:
- `authRoutes.ts` - Authentication endpoints
- `blogRoutes.ts` - Blog and compose endpoints
- `commentRoutes.ts` - Comment endpoints
- `userRoutes.ts` - User/account endpoints
- `uploadRoutes.ts` - File upload endpoints
- `pageRoutes.ts` - Static pages

### 4. Middleware (`src/middleware/`)
**Purpose**: Cross-cutting concerns and request/response processing

#### **authMiddleware.ts**
- `authMiddleware` - Requires authentication, throws error if not logged in
- `optionalAuthMiddleware` - Optional auth, continues if not authenticated
- `checkAuthRedirect` - Requires auth, redirects to login if not authenticated
- `guestMiddleware` - Requires guest status (not logged in), redirects if logged in

#### **errorHandler.ts**
- `errorHandler` - Global error handler middleware
  - Catches all errors
  - Converts to consistent JSON response format
  - Handles AppError instances
  - Detects database errors
  - Provides stack traces in development mode

- `asyncHandler` - Wrapper for async route handlers
  - Automatically catches promise rejections
  - Passes errors to error handler middleware

#### **requestLogger.ts**
- Logs all incoming requests
- Tracks request duration
- Includes method, path, status code, and user ID

### 5. Utils (`src/utils/`)

#### **errors.ts** - Custom Error Classes
```typescript
- AppError - Base error class with status code
- ValidationError - 400 Bad Request
- UnauthorizedError - 401 Unauthorized
- NotFoundError - 404 Not Found
- ConflictError - 409 Conflict
- DatabaseError - 500 Database Error
- InternalServerError - 500 Server Error
```

#### **validators.ts** - Input Validation
```typescript
- validateEmail() - Email format validation
- validatePassword() - Password strength validation
- validateUsername() - Username format validation
- validateBlogTitle() - Blog title validation
- validateBlogDescription() - Description validation
- validateComment() - Comment text validation
- validateSignupData() - Signup form validation
- validateLoginData() - Login form validation
- validateBlogData() - Blog content validation
```

#### **constants.ts** - Application Constants
```typescript
- STATIC_CONTENT - Static page content (About, Contact, Landing)
- PAGINATION - Items per page (3 blogs, 3 comments)
- UPLOAD - File upload configuration (10MB limit)
- OAUTH_CONFIG - OAuth redirect URLs
- HTTP_STATUS - HTTP status codes
```

---

## Middleware Flow

```
Request
   ↓
[Request Logger] - Logs incoming request
   ↓
[Body Parser] - Parses JSON/URL-encoded bodies
   ↓
[Static Files] - Serves public assets
   ↓
[Route Handlers] - Dispatches to appropriate route
   ↓
[Auth Middleware] - Validates authentication if required
   ↓
[Controller] - Executes business logic
   ↓
[Model] - Database operations
   ↓
Response
   ↓
[Error Handler] - Catches any errors and formats response
```

---

## Request Flow Example: Creating a Blog

```
1. User submits form to POST /api/compose
   ↓
2. Route handler calls blogController.composeBlog
   ↓
3. Auth middleware validates user is logged in
   ↓
4. Controller validates input data
   ↓
5. Controller calls BlogModel.createBlog()
   ↓
6. Model executes Supabase query
   ↓
7. Model returns blog ID
   ↓
8. Controller returns JSON with blogid
   ↓
9. If error: Error handler middleware catches and formats error response
```

---

## Error Handling

### Global Error Handler
All errors are caught by the error handler middleware and return consistent JSON:

```json
{
  "success": false,
  "error": "Error message",
  "errorCode": "ERROR_CODE",
  "stack": "..." // Only in development
}
```

### Custom Error Classes
Throw specific errors from controllers/models:

```typescript
throw new UnauthorizedError(); // 401
throw new ValidationError('Invalid email'); // 400
throw new NotFoundError('Blog'); // 404
throw new DatabaseError('Query failed'); // 500
```

---

## Key Features

### ✅ Authentication Middleware
- **Required Auth** (`authMiddleware`) - Throws 401 if not logged in
- **Optional Auth** (`optionalAuthMiddleware`) - Continues if not logged in, attaches user if logged in
- **Auth Redirect** (`checkAuthRedirect`) - Redirects to `/login` if not logged in (for pages)
- **Guest Only** (`guestMiddleware`) - Redirects to `/` if logged in (for login/register pages)

### ✅ Global Error Handler
- Catches all errors (sync and async)
- Formats error responses consistently
- Handles Supabase-specific errors
- Provides detailed errors in development mode

### ✅ Request Logging
- Logs all requests with method, path, status, and duration
- Includes user ID if authenticated
- Useful for debugging and monitoring

### ✅ Input Validation
- Validates all user inputs before database operations
- Email format, password strength, username format
- Blog title and description length
- Comment text length and content

### ✅ Custom Error Classes
- Specific error types for different scenarios
- Consistent error response format
- Proper HTTP status codes

---

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "errorCode": "ERROR_CODE"
}
```

---

## Environment Variables
Ensure these are set in `.env`:
```
SUPABASE_URL=your_supabase_url
SUPABASE_PUBLISHABLE_KEY=your_key
PORT=3000
GOOGLE_REDIRECT_URL=http://localhost:3000
```

---

## Build & Run

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Bundle Frontend
```bash
npm run bundle          # Production build
npm run bundle:watch    # Watch mode
```

---

## Dependencies
- **express** ^5.2.1 - Web framework
- **typescript** ^5.9.3 - Type safety
- **@supabase/supabase-js** ^2.103.3 - Database & Auth
- **multer** ^2.1.1 - File uploads
- **ejs** ^4.0.1 - View templating
- **dotenv** ^17.2.3 - Environment variables

---

## Next Steps for Enhancement

1. **Add rate limiting middleware** - Prevent abuse
2. **Add request validation middleware** - Schema validation (Zod/Joi)
3. **Add CORS configuration** - If consuming from other domains
4. **Add response compression** - gzip middleware
5. **Add CSRF protection** - For form submissions
6. **Add request timeout** - Prevent hanging requests
7. **Add caching layer** - Redis for frequently accessed data
8. **Add pagination constants** - Make configurable
9. **Add file upload restrictions** - File type validation
10. **Add audit logging** - Track user actions

---

## Testing
Structure allows for easy testing:
- Models can be tested independently (database mocking)
- Controllers can be tested with mocked models
- Routes can be tested with supertest
- Middleware can be tested in isolation

Example test structure:
```
tests/
├── unit/
│   ├── models/
│   ├── controllers/
│   └── middleware/
├── integration/
│   └── routes/
└── e2e/
```
