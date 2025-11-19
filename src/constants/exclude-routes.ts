// Routes that don't require authentication
// Can be a string (any method) or an object with method and path
export default [
  '/health',
  '/api/v1/auth/signin',
  '/api/v1/user/register',
  { method: 'GET', path: '/api/v1/profiles/' } // Allow public profile viewing (/profiles/:username)
]
