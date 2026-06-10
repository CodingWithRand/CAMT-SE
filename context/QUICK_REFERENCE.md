# Quick Reference Guide - MVC Architecture

## 📂 File Organization

### Models - Database Layer (`src/models/`)
Encapsulate all database operations. Use these for database queries.

```typescript
// Example: userModel.ts
static async getProfileByUserId(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('uid', userId)
    .single();
  
  if (error) throw new DatabaseError(error.message);
  return data;
}
```

### Controllers - Business Logic (`src/controllers/`)
Handle requests and coordinate models. Connect HTTP to business logic.

```typescript
// Example: blogController.ts
viewBlog: asyncHandler(async (req: Request, res: Response) => {
  const blog = await BlogModel.getBlogById(blogid);
  // ... more logic
  res.render('blog', { blog });
});
```

### Routes - URL Patterns (`src/routes/`)
Define endpoints and apply middleware. Use Express Router.

```typescript
// Example: blogRoutes.ts
router.get('/blogs/:blogid/*', optionalAuthMiddleware, blogController.viewBlog);
router.post('/api/blogs/:id/like', authMiddleware, blogController.likeBlog);
```

### Middleware - Cross-Cutting Concerns (`src/middleware/`)
Apply to routes or globally. Handle auth, errors, logging.

```typescript
// Authentication middleware
app.use(authMiddleware);  // All subsequent routes require auth
router.post('/api/compose', authMiddleware, controller.compose);  // Single route
```

### Utils - Helpers (`src/utils/`)
Reusable functions, validators, constants, error classes.

```typescript
// validators.ts
validateEmail(email);

// errors.ts
throw new UnauthorizedError();

// constants.ts
PAGINATION.BLOGS_PER_PAGE
```

---

## 🔌 Adding New Features

### Adding a New Endpoint

#### 1. Create Model (if needed)
```typescript
// src/models/newModel.ts
export class NewModel {
  static async getItem(id: string) {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', id);
    
    if (error) throw new DatabaseError(error.message);
    return data;
  }
}
```

#### 2. Create Controller
```typescript
// src/controllers/newController.ts
export const newController = {
  getItem: asyncHandler(async (req: Request, res: Response) => {
    const item = await NewModel.getItem(req.params.id);
    res.status(200).json({ item });
  }),
};
```

#### 3. Create Route
```typescript
// src/routes/newRoutes.ts
import { Router } from 'express';
import { newController } from '../controllers/newController';

const router = Router();
router.get('/api/items/:id', newController.getItem);
export default router;
```

#### 4. Mount in app.ts
```typescript
// src/app.ts
import newRoutes from './routes/newRoutes';
app.use('/', newRoutes);
```

---

## 🛡️ Authentication Middleware

### Use Cases

```typescript
// Requires authentication (throws 401)
router.post('/api/protected', authMiddleware, controller.action);

// Optional authentication (doesn't throw)
router.get('/public-page', optionalAuthMiddleware, controller.action);

// Requires auth or redirects to login
router.get('/account', checkAuthRedirect, controller.action);

// Only for guests (redirects if logged in)
router.get('/login', guestMiddleware, controller.action);
```

---

## ⚠️ Error Handling

### Throwing Errors
```typescript
// In models or controllers
throw new UnauthorizedError();                    // 401
throw new ValidationError('Invalid email');      // 400
throw new NotFoundError('User');                 // 404
throw new ConflictError('Email already exists'); // 409
throw new DatabaseError('Query failed');         // 500
```

### Automatic Handling
```typescript
// Error handler middleware catches everything
// Returns: { success: false, error: "...", errorCode: "..." }
```

### Async Handler
```typescript
// Automatically catches errors in async functions
export const myRoute = asyncHandler(async (req, res) => {
  // Any thrown error here is automatically caught
});
```

---

## ✅ Input Validation

### Validation Functions
```typescript
// Single field validation
validateEmail(email);
validatePassword(password);
validateUsername(username);

// Composite validation (for forms)
validateSignupData({ userName, email, password, confirmPassword });
validateLoginData({ email, password });
validateBlogData({ blogTitle, blogDescription });
```

### Usage in Controllers
```typescript
export const authController = {
  registerWithEmail: asyncHandler(async (req: Request, res: Response) => {
    const { userName, email, password, confirmPassword } = req.body;
    
    // Throws ValidationError if invalid
    validateSignupData({ userName, email, password, confirmPassword });
    
    // Continue if validation passes
    await AuthModel.signUpWithEmail(email, password);
  }),
};
```

---

## 📊 Constants

### Usage
```typescript
import { PAGINATION, UPLOAD, STATIC_CONTENT } from '../utils/constants';

// Pagination
const blogs = await BlogModel.getAllBlogs(0, PAGINATION.BLOGS_PER_PAGE);

// Upload
const MAX_SIZE = UPLOAD.MAX_FILE_SIZE;

// Static content
res.render('about', { aboutContent: STATIC_CONTENT.ABOUT });
```

---

## 🧪 Testing Pattern

### Model Testing
```typescript
// Mock supabase in tests
const mockData = { id: 1, name: 'Test' };
jest.spyOn(supabase, 'from').mockReturnValueOnce({
  select: () => ({
    eq: () => ({
      single: () => ({ data: mockData, error: null })
    })
  })
});

const result = await UserModel.getProfileByUserId('123');
expect(result).toEqual(mockData);
```

### Controller Testing
```typescript
// Mock the model
jest.spyOn(UserModel, 'getProfileByUserId').mockResolvedValue(mockUser);

// Test the controller
const req = { userId: '123' } as any;
const res = { render: jest.fn() } as any;

await userController.renderAccountPage(req, res);
expect(res.render).toHaveBeenCalledWith('account', expect.anything());
```

---

## 🔍 Debugging

### Enable Request Logging
```typescript
// Already enabled in app.ts
app.use(requestLogger);

// Logs: [TIME] METHOD PATH - Status: 200 - Duration: 45ms - User: uid123
```

### Stack Traces in Development
```bash
# In production (default)
NODE_ENV=production npm start
# Errors return: { error: "message" }

# In development
NODE_ENV=development npm run dev
# Errors return: { error: "message", stack: "..." }
```

---

## 🚀 Deployment Checklist

- [ ] All TypeScript files compile (`npx tsc --noEmit`)
- [ ] Environment variables set (.env)
- [ ] Error handler is last middleware
- [ ] Auth middleware applied to protected routes
- [ ] Input validation on all user inputs
- [ ] Database queries use models
- [ ] Controllers use models
- [ ] Routes import controllers
- [ ] app.ts mounts all routes
- [ ] Tests passing
- [ ] Linting passing

---

## 📋 Common Commands

```bash
# Check TypeScript compilation
npx tsc --noEmit

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Bundle frontend
npm run bundle

# Watch frontend changes
npm run bundle:watch
```

---

## 🎯 Key Principles

1. **Models** - Database queries only
2. **Controllers** - Business logic only
3. **Routes** - URL patterns only
4. **Middleware** - Cross-cutting concerns
5. **Errors** - Use custom error classes
6. **Validation** - Validate input before database
7. **Async** - Use asyncHandler wrapper
8. **Logging** - All requests logged

---

## 📞 Request Flow Summary

```
Request → Logger → Parser → Router → Middleware → Controller
          ↓
    Business Logic → Model → Database
          ↓
        Response ← Error Handler (catches any errors)
```

---

## 🔗 File Navigation

**Adding Blog Feature?**
- Model: `src/models/blogModel.ts`
- Controller: `src/controllers/blogController.ts`
- Routes: `src/routes/blogRoutes.ts`

**Adding Authentication?**
- Model: `src/models/authModel.ts`
- Controller: `src/controllers/authController.ts`
- Routes: `src/routes/authRoutes.ts`
- Middleware: `src/middleware/authMiddleware.ts`

**Adding Validation?**
- Validators: `src/utils/validators.ts`

**Adding Error Handling?**
- Errors: `src/utils/errors.ts`
- Handler: `src/middleware/errorHandler.ts`

---

**For detailed documentation, see: `MVC_ARCHITECTURE_GUIDE.md`**
