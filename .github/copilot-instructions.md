# Copilot Instructions for lsvrg-service-core

## Architecture Overview

This is a TypeScript Express.js API server with MongoDB/Mongoose for lasverg.io.
The codebase follows a modular architecture with:

- **Domain-driven API structure**:
  `src/api/{domain}/{domain}.{controller|service|model|router|middleware}.ts`
- **Separate User/Profile collections**: Users handle auth, Profiles handle
  public data (1:1 relationship using same `_id`)
- **Dual route pattern**: Public routes (`/profiles/:username`) vs authenticated
  routes (`/profile`)
- **Global auth middleware** with configurable exclusions in
  `src/constants/exclude-routes.ts`

## Key Patterns & Conventions

### Path Aliases (tsconfig.json)

Always use path aliases for imports:

```typescript
import { AuthError } from '@/errors/api.error.js' // NOT '../../../errors/api.error.js'
import log from '@logger' // NOT './src/logger/index.js'
```

### Request Types

- Use `IProtectedRequest` for authenticated endpoints (has `req.user`)
- Use standard `Request` for public endpoints
- Check `req.user?.id` for user identification in protected routes

### Authentication Architecture

- Global `authMiddleware` applies to all routes except those in
  `exclude-routes.ts`
- Supports both Bearer tokens and HTTP-only cookies
- Exclude routes use objects for method-specific exclusions:
  `{ method: 'GET', path: '/api/v1/profiles/' }`

### Profile Design Pattern

```typescript
// Public profile viewing (no auth)
router.get('/profiles/:username', getUserProfileController)

// Self-management (auth required)
router.get('/profile', getMyProfileController)
router.post('/profile', profileCreateValidator, addUserProfileController)
router.put('/profile', profileUpdateValidator, updateUserProfileController)
```

### Error Handling

- Use domain-specific errors: `AuthError('message', statusCode)`,
  `DbError(mongoError)`
- Always call `next(error)` in controllers, never throw directly
- Default `AuthError()` returns 401 with "Unauthorized access"

## Development Workflows

### Essential Commands

```bash
pnpm dev                    # Development with tsx (hot reload)
pnpm test                   # Jest tests
pnpm test:coverage         # Coverage report
pnpm build                 # TypeScript compilation
pnpm db:backfill:profiles  # Run profile backfill job
```

### Testing Patterns

- Tests in `src/**/*.test.ts` (Jest configuration)
- Use response utilities from `src/utils/response.utils.ts` for consistent API
  responses

### Database Patterns

- **User Model**: Handles password hashing in pre-save middleware, includes
  `comparePassword()` method
- **Profile Model**: Uses `_id: false` and shares User's `_id`, has embedded
  `linkSchema` for social links
- **Service Layer**: Always use service functions, not direct model calls in
  controllers

## Critical Integration Points

### Session Management

- JWT tokens in `src/utils/jwt.utils.ts` and JOSE utilities
- Session persistence in `src/api/authenticate/session.model.ts`
- Cookie-based refresh tokens with automatic access token renewal

### Profile Backfill System

- `src/jobs/ensure-profiles.job.ts` creates default profiles for users without
  them
- Run via `pnpm db:backfill:profiles` script
- Essential for maintaining User/Profile consistency

### Client Information Tracking

- `src/utils/clientInfo.utils.ts` extracts browser/device/IP data
- Used in authentication flows for session tracking

When working with authentication, always consider both token-based and
cookie-based flows. When adding new routes, update `exclude-routes.ts` if they
should be public. For profile features, decide between public viewing
(`/profiles/:username`) vs self-management (`/profile`) patterns.
