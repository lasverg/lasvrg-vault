# Authentication API Documentation

## Auth Check API

### Endpoint: `GET /api/v1/auth/check`

This endpoint validates authentication tokens received via HTTP cookies and
automatically refreshes expired but valid tokens.

#### Behavior:

1. **No Tokens Present**: Returns 401 with error message
2. **Valid Access Token**: Returns 200 with user info and confirmation
3. **Expired Access Token + Valid Refresh Token**:
   - Generates new access token
   - Sets new access token as HTTP-only cookie
   - Returns 200 with refresh confirmation and new token
4. **Invalid/Expired Refresh Token**: Returns 401 with error message

#### Cookie Names:

- `accessToken`: Short-lived token (1 hour)
- `refreshToken`: Long-lived token (1 day)

#### Response Examples:

**Valid Access Token:**

```json
{
  "valid": true,
  "user": {
    /* user data */
  },
  "message": "Access token is valid"
}
```

**Token Refreshed:**

```json
{
  "valid": true,
  "refreshed": true,
  "accessToken": "new_jwt_token_here",
  "message": "Token refreshed successfully"
}
```

**Authentication Failed:**

```json
{
  "valid": false,
  "message": "No authentication tokens found"
}
```

### Related Endpoints:

#### `POST /api/v1/auth/signin`

- Signs in user and sets both access and refresh tokens as HTTP-only cookies
- Also returns access token in response body

#### `POST /api/v1/auth/signout`

- Clears both access and refresh token cookies
- Returns success confirmation

### Usage:

The auth check endpoint is designed to be called by frontend applications to:

1. Verify if the user is still authenticated
2. Automatically refresh expired tokens without user intervention
3. Handle authentication state management seamlessly

### Cookie Configuration:

All cookies are set with:

- `httpOnly: true` (prevents XSS attacks)
- `maxAge`: Appropriate expiration times
- Should also include `secure: true` and `sameSite` in production

### Middleware Available:

#### `cookieAuth` Middleware

Can be used to protect routes that should automatically handle token refresh:

```typescript
import { cookieAuth } from '@api/authenticate/authenticate.middleware.js'

router.get('/protected-route', cookieAuth, handler)
```

This middleware will:

- Check for valid access token in cookies
- Automatically refresh if needed
- Populate `req.user` for the handler
- Return 401 if no valid authentication found
