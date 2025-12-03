# Dating Directory - Escort Website

A Next.js application for managing escort profiles and listings.

## Issues Fixed

### 1. Database Schema Issues
- ✅ Added missing ESCORT role to the Role enum
- ✅ Added missing fields to Profile model (name, age, city, description, isVerified, isOnline, rating, profilePhoto)
- ✅ Added missing models: Review, Media, Question
- ✅ Fixed relationships between models

### 2. Registration Form Issues
- ✅ Fixed database schema to match registration API expectations
- ✅ Added proper error handling
- ✅ Fixed role assignment for escort accounts

### 3. Admin Dashboard Issues
- ✅ Added missing models referenced in admin stats API
- ✅ Fixed admin statistics calculation

## Setup Instructions for Replit

### Step 1: Environment Variables
Create a `.env` file in the root directory with the following variables:

```env
# Database (Use Replit's built-in PostgreSQL)
DATABASE_URL="postgresql://username:password@localhost:5432/datingdirectory"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="https://your-replit-url.repl.co"

# For Replit, you can use a simple secret:
NEXTAUTH_SECRET="my-secret-key-123"

# Email Verification (Mailgun)
MAILGUN_API_KEY="your-mailgun-api-key-here"
MAILGUN_DOMAIN="your-domain.com"  # Your verified Mailgun domain
MAILGUN_FROM_EMAIL="noreply@your-domain.com"  # Optional, defaults to noreply@MAILGUN_DOMAIN

# Admin Emails (comma-separated)
ADMIN_EMAILS="admin@example.com,another-admin@example.com"
```

### Step 2: Database Setup
1. In Replit, go to the "Tools" section
2. Click on "Database" 
3. Create a new PostgreSQL database
4. Copy the connection string and update your `.env` file

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Database Migration
```bash
npx prisma generate
npx prisma db push
```

**Note:** After updating the Prisma schema (e.g., adding email verification fields), you need to run these commands to sync the database.

### Step 5: Create Admin User
Run this command to create an admin user:
```bash
npx prisma studio
```

Or manually insert an admin user in the database:
```sql
INSERT INTO "User" (id, email, password, role, "createdAt", "updatedAt") 
VALUES ('admin-1', 'admin@example.com', '$2a$12$hashedpassword', 'ADMIN', NOW(), NOW());
```

### Step 6: Start Development Server
```bash
npm run dev
```

## Features

### User Registration
- ✅ Escort profile creation
- ✅ User account creation
- ✅ Form validation
- ✅ Error handling
- ✅ Email verification with SendGrid

### Admin Dashboard
- ✅ View all profiles
- ✅ View statistics
- ✅ Manage listings
- ✅ User management

### Profile Management
- ✅ Create escort profiles
- ✅ Upload profile photos
- ✅ Manage listings
- ✅ Reviews system

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration (sends verification email)
- `GET /api/auth/verify` - Email verification endpoint
- `POST /api/auth/[...nextauth]` - NextAuth.js authentication

### Admin
- `GET /api/admin/stats` - Admin statistics
- `GET /api/admin/profiles` - List all profiles
- `GET /api/admin/listings` - List all listings

### Profiles
- `GET /api/profiles` - List profiles
- `POST /api/profiles` - Create profile
- `GET /api/profiles/[id]` - Get profile by ID

### Listings
- `GET /api/listings` - List all listings
- `POST /api/listings` - Create listing

## Database Models

### User
- Basic user information
- Role-based access (USER, ESCORT, ADMIN)

### Profile
- Escort profile information
- Verification status
- Rating system

### Listing
- Escort service listings
- Pricing information
- Location data

### Review
- User reviews for profiles
- Rating system

### Media
- Profile photos and videos
- File management

### Question
- FAQ system
- User questions and answers

## Troubleshooting

### Registration Form Not Working
1. Check database connection
2. Verify environment variables
3. Run database migrations
4. Check browser console for errors

### Admin Dashboard Issues
1. Ensure admin user exists
2. Check database permissions
3. Verify API endpoints

### Database Connection Issues
1. Check DATABASE_URL in .env
2. Ensure database is running
3. Run `npx prisma db push` to sync schema

## Development

### Adding New Features
1. Update Prisma schema if needed
2. Run `npx prisma generate`
3. Create API routes
4. Update frontend components

### Database Changes
1. Modify `prisma/schema.prisma`
2. Run `npx prisma generate`
3. Run `npx prisma db push` (for development)
4. Or create migration: `npx prisma migrate dev`

## Security Notes

- Always use environment variables for sensitive data
- Implement proper authentication and authorization
- Validate all user inputs
- Use HTTPS in production
- Regularly update dependencies
