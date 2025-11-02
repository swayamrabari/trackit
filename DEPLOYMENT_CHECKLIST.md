# 🚀 Production Deployment Checklist

## ✅ Fixed Issues

### 1. **Environment Variable Validation**
- ✅ Server now validates required environment variables on startup
- ✅ Missing variables cause server to exit with clear error messages
- ✅ Optional variables show warnings in production

### 2. **Cookie Configuration Fixed**
- ✅ Fixed `sameSite` bug: Now correctly sets `'none'` in production, `'lax'` in development
- ✅ Cookies properly configured for cross-origin requests in production

### 3. **Database Connection**
- ✅ Server waits for MongoDB connection before starting
- ✅ Added connection pooling and timeout configuration
- ✅ Added reconnection event handlers for production stability

### 4. **Error Handling**
- ✅ Added async error handler middleware
- ✅ Improved protect middleware with better error messages
- ✅ All controllers have proper try-catch blocks

### 5. **Security**
- ✅ Added Helmet middleware for security headers
- ✅ Rate limiting configured properly

### 6. **Module System**
- ✅ Converted assistantController and functionCatalog from ES6 to CommonJS
- ✅ Consistent module system across entire backend

### 7. **Route Handling**
- ✅ Added 404 handler for undefined routes
- ✅ Error handler properly positioned at the end

---

## 📋 Environment Variables

### Backend (.env in `server/` directory)

```env
# Server Configuration
NODE_ENV=production
PORT=3000

# Database (REQUIRED)
MONGOURI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
# OR for local: mongodb://localhost:27017/trackit

# JWT Secret (REQUIRED)
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long

# Client URL (REQUIRED)
CLIENT_URL=https://yourdomain.com
# For development: http://localhost:5173

# OpenAI API (OPTIONAL - required for Assistant feature)
OPENAI_API_KEY=sk-your-openai-api-key

# Email Configuration (OPTIONAL - required for OTP/Password Reset)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password

# Google OAuth (OPTIONAL - only if using Google login)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

### Frontend (.env in `client/` directory)

```env
# API Base URL
VITE_API_BASE_URL=https://api.yourdomain.com/api
# For development: http://localhost:3000/api
```

---

## 🧪 Testing Checklist

### 1. **Server Startup Tests**

#### Test Environment Variable Validation
```bash
# Remove a required env variable and start server
# Expected: Server should exit with error message listing missing variables
cd server
# Temporarily rename .env
mv .env .env.backup
node server.js
# Expected: Should show error about missing MONGOURI, JWT_SECRET, CLIENT_URL
# Restore: mv .env.backup .env
```

#### Test Database Connection
```bash
# With invalid MongoDB URI
# Expected: Server should exit with MongoDB connection error
# With valid MongoDB URI
# Expected: Should see "✅ MongoDB connected: [host]" message
```

#### Test Server Startup
```bash
cd server
npm start
# Expected outputs:
# - ✅ MongoDB connected: [host]
# - ✅ Server running on port 3000
# - 🌍 Environment: production
```

### 2. **Authentication Tests**

#### Test Cookie Configuration
1. **Login Test**
   - Log in through the frontend
   - Check browser DevTools > Application > Cookies
   - **Expected**: Cookie should have:
     - `httpOnly: true`
     - `secure: true` (in production)
     - `sameSite: 'none'` (in production) or `'lax'` (in development)

2. **Token Validation Test**
   - Try accessing protected route without token
   - **Expected**: 401 error "Not authorized, no token"
   
   - Try accessing with expired/invalid token
   - **Expected**: Appropriate error message (Token expired / Invalid token)

3. **User Not Found Test**
   - Use valid token format but for non-existent user
   - **Expected**: 401 error "User not found"

### 3. **Error Handling Tests**

#### Test 404 Handler
```bash
# Make request to non-existent route
curl http://localhost:3000/api/nonexistent
# Expected: {"message":"Route not found"} with 404 status
```

#### Test Async Error Handling
1. **Trigger database error** (disconnect MongoDB temporarily)
   - Make any API request that hits database
   - **Expected**: Error should be caught and return 500 with error message
   - Server should NOT crash

2. **Test unhandled errors**
   - Any unexpected error should be caught by errorHandler
   - **Expected**: Returns proper error response, server continues running

### 4. **Security Tests**

#### Test Helmet Headers
```bash
curl -I http://localhost:3000/api/auth/me
# Expected: Should see security headers like X-Content-Type-Options, etc.
```

#### Test Rate Limiting
```bash
# Make 101 requests quickly to any route
# Expected: 100th request succeeds, 101st should return rate limit error
```

### 5. **Database Reconnection Test**

1. **Disconnect MongoDB** while server is running
   - Make a request that hits database
   - **Expected**: Should see warning "⚠️ MongoDB disconnected"
   
2. **Reconnect MongoDB**
   - **Expected**: Should see "✅ MongoDB reconnected successfully"

### 6. **Assistant Feature Tests** (if OPENAI_API_KEY is set)

1. **Test Assistant Endpoint**
   ```bash
   curl -X POST http://localhost:3000/api/assistant \
     -H "Content-Type: application/json" \
     -d '{"prompt":"What is my total spending?"}'
   # Expected: Should work without module errors
   ```

2. **Test Function Catalog**
   ```bash
   curl http://localhost:3000/api/assistant/functions
   # Expected: Should return function catalog array
   ```

### 7. **Integration Tests**

#### Test Complete User Flow
1. **Register User**
   - **Expected**: OTP sent to email
   
2. **Verify OTP**
   - **Expected**: User created, token returned, cookie set

3. **Access Protected Routes**
   - Get entries, budgets, categories
   - **Expected**: All should work with authentication

4. **Create Entry/Budget**
   - **Expected**: Should save successfully

5. **Update/Delete**
   - **Expected**: Should work correctly

### 8. **Production-Specific Tests**

#### Test Environment Detection
```bash
NODE_ENV=production node server.js
# Expected: 
# - Cookies use secure: true, sameSite: 'none'
# - Error responses don't include stack traces
# - Warnings for missing optional env vars
```

#### Test CORS
- Make request from different origin (should match CLIENT_URL)
- **Expected**: Should be allowed if origin matches CLIENT_URL

---

## 🔍 Quick Verification Commands

```bash
# Check if all required packages are installed
cd server && npm list --depth=0

# Check server starts correctly
cd server && npm start

# Check for any obvious syntax errors
node -c server/server.js
node -c server/controllers/*.js
```

---

## 🐛 Common Issues & Solutions

### Issue: "Missing required environment variables"
**Solution**: Create `.env` file in `server/` directory with all required variables

### Issue: "MongoDB connection error"
**Solution**: 
- Verify MONGOURI is correct
- Check MongoDB is accessible from your server
- Verify network/firewall settings

### Issue: "Cannot find module" errors
**Solution**: Run `npm install` in server directory

### Issue: Cookies not working in production
**Solution**: 
- Verify `CLIENT_URL` matches your frontend URL exactly
- Ensure `secure: true` and `sameSite: 'none'` (we fixed this!)
- Frontend must use HTTPS in production

### Issue: Server crashes on errors
**Solution**: Check that errorHandler middleware is properly positioned (should be last)

---

## 📝 Pre-Deployment Checklist

- [ ] All environment variables set in production environment
- [ ] MongoDB database accessible from production server
- [ ] JWT_SECRET is strong and unique (at least 32 characters)
- [ ] CLIENT_URL matches production frontend URL exactly
- [ ] HTTPS enabled for both frontend and backend
- [ ] Rate limiting configured appropriately
- [ ] Error logging configured (consider adding Sentry or similar)
- [ ] Server starts without errors
- [ ] All tests pass
- [ ] Database connection stable
- [ ] Cookies working (test login/logout)

---

## 🚀 Deployment Notes

1. **Never commit `.env` files** to version control
2. **Set NODE_ENV=production** in production
3. **Use process manager** like PM2 for production:
   ```bash
   npm install -g pm2
   pm2 start server.js --name trackit-api
   pm2 save
   pm2 startup
   ```
4. **Monitor logs**: Set up log rotation and monitoring
5. **Database**: Use connection string with retryWrites=true for MongoDB Atlas
6. **HTTPS**: Ensure both frontend and backend use HTTPS in production

---

## ✅ Success Indicators

When everything is working correctly, you should see:

1. ✅ Server starts successfully with all environment variables
2. ✅ MongoDB connects and shows connection events
3. ✅ Authentication works (login, logout, protected routes)
4. ✅ All CRUD operations work (entries, budgets, categories)
5. ✅ Error responses are properly formatted (no stack traces in production)
6. ✅ 404 errors return proper JSON response
7. ✅ Server doesn't crash on errors
8. ✅ Cookies are set correctly (check browser DevTools)

---

## 📞 Need Help?

If you encounter issues during testing:
1. Check server logs for error messages
2. Verify all environment variables are set
3. Check MongoDB connection
4. Verify CORS settings match your frontend URL
5. Test with Postman/curl to isolate frontend vs backend issues

