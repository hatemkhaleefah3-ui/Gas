// Authentication routing is composed in worker/router.js so all API routes share one request lifecycle.
export const AUTH_ENDPOINTS = ['/api/auth/signup','/api/auth/signin','/api/auth/signout','/api/auth/me','/api/account/password'];
