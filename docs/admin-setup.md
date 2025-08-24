# Admin Panel Setup

## Creating an Admin User

To create an admin user for accessing the admin panel:

1. **Run the admin creation script:**

   ```bash
   npm run create-admin
   ```

2. **Default admin credentials:**
   - Email: `admin@mycleanone.com`
   - Password: `admin123`
   - **Important:** Change this password after first login

3. **Manual admin user creation:**
   If you need to manually create an admin user or promote an existing user:

   ```javascript
   // In MongoDB shell or through your database client
   db.users.updateOne(
     { email: "user@example.com" },
     {
       $set: {
         role: "admin",
         lastSeenAt: new Date(),
       },
     }
   );
   ```

## Testing Admin Authentication

1. **Test the admin API endpoint:**

   ```bash
   # First, login to get an access token
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@mycleanone.com","password":"admin123"}'

   # Use the returned accessToken to test admin endpoint
   curl -X GET http://localhost:3000/api/admin/test \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   ```

2. **Expected response for successful admin authentication:**
   ```json
   {
     "success": true,
     "message": "Admin authentication successful",
     "data": {
       "userId": "...",
       "email": "admin@mycleanone.com",
       "role": "admin",
       "timestamp": "2024-01-01T00:00:00.000Z"
     }
   }
   ```

## Admin Authentication Flow

1. **Login Process:**
   - User logs in with admin credentials
   - System verifies credentials and admin role
   - JWT tokens include role claim
   - Access token expires in 15 minutes
   - Refresh token expires in 7 days

2. **Route Protection:**
   - `/admin/*` pages require admin role
   - `/api/admin/*` endpoints require admin role
   - Middleware automatically verifies role
   - Non-admin users are redirected to dashboard

3. **API Authentication:**
   - All admin API calls require `Authorization: Bearer <token>` header
   - Token must contain valid admin role claim
   - Invalid/expired tokens return 401 Unauthorized
   - Insufficient permissions return 403 Forbidden

## Security Features

- **Role-based access control:** Only users with `role: "admin"` can access admin features
- **Token-based authentication:** JWT tokens with role claims
- **Automatic role verification:** Middleware checks role on every request
- **Session tracking:** `lastSeenAt` field tracks admin activity
- **Secure token refresh:** Role preserved in refresh token flow

## Next Steps

After setting up admin authentication, you can proceed with:

1. Creating the admin layout and navigation
2. Building the dashboard with metrics
3. Implementing CRUD operations for licenses, devices, and users
4. Adding audit logging for admin actions
