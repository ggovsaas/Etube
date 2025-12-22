# Replit Setup Guide for Dating Directory

## 🚀 Quick Setup for Replit

### Step 1: Fork/Import to Replit
1. Go to [replit.com](https://replit.com)
2. Click "Create Repl"
3. Choose "Import from GitHub"
4. Enter: `https://github.com/jorca1989/datingdirectory.git`
5. Click "Import from GitHub"

### Step 2: Set Up Database
1. In your Repl, click on "Tools" in the left sidebar
2. Click "Database"
3. Choose "PostgreSQL"
4. Click "Create Database"
5. Copy the connection string (it looks like: `postgresql://username:password@host:port/database`)

### Step 3: Configure Environment Variables
1. In your Repl, click on "Tools" → "Secrets"
2. Add these environment variables:

```
DATABASE_URL = "your-postgresql-connection-string-here"
NEXTAUTH_SECRET = "your-secret-key-here"
NEXTAUTH_URL = "https://your-repl-url.repl.co"
```

**Example:**
```
DATABASE_URL = "postgresql://username:password@host:port/database"
NEXTAUTH_SECRET = "my-super-secret-key-123"
NEXTAUTH_URL = "https://datingdirectory.jorca1989.repl.co"
```

### Step 4: Install Dependencies
1. Open the Shell in your Repl
2. Run: `npm install`

### Step 5: Set Up Database Schema
1. In the Shell, run: `npx prisma generate`
2. Then run: `npx prisma db push`

### Step 6: Create Admin User
1. In the Shell, run: `npm run setup`
2. This will create an admin user with:
   - Email: `admin@datingdirectory.com`
   - Password: `admin123`

### Step 7: Start the Application
1. Click the "Run" button in your Repl
2. The app will start and show you the URL

## 🔧 Troubleshooting

### Registration Form Not Working
**Problem:** Form loads forever and shows "Failed to create account"

**Solutions:**
1. Check if database is connected:
   ```bash
   npx prisma studio
   ```

2. Verify environment variables:
   - Go to Tools → Secrets
   - Make sure DATABASE_URL is correct
   - Make sure NEXTAUTH_SECRET is set

3. Check database schema:
   ```bash
   npx prisma db push --force-reset
   npm run setup
   ```

### Admin Dashboard Issues
**Problem:** Can't see all accounts or statistics

**Solutions:**
1. Make sure admin user exists:
   ```bash
   npm run setup
   ```

2. Check admin API endpoints:
   - Visit: `https://your-repl-url.repl.co/api/admin/stats`
   - Should return JSON with statistics

3. Verify database models:
   ```bash
   npx prisma studio
   ```

### Database Connection Issues
**Problem:** "Database connection failed"

**Solutions:**
1. Check DATABASE_URL in Secrets
2. Make sure PostgreSQL database is running
3. Try reconnecting to database in Tools → Database

## 📋 Verification Checklist

After setup, verify these work:

- ✅ [ ] Registration form creates accounts
- ✅ [ ] Admin can log in (admin@datingdirectory.com / admin123)
- ✅ [ ] Admin dashboard shows statistics
- ✅ [ ] Admin can view all users/profiles
- ✅ [ ] Escort profiles can be created
- ✅ [ ] Listings can be created

## 🛠️ Common Commands

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Reset database (WARNING: deletes all data)
npx prisma db push --force-reset

# Create admin user
npm run setup

# Start development server
npm run dev

# Open database viewer
npx prisma studio
```

## 🔐 Security Notes

1. **Change Admin Password**: After first login, change the admin password
2. **Environment Variables**: Never commit .env files to git
3. **Database Access**: Keep database credentials secure
4. **HTTPS**: Replit provides HTTPS automatically

## 📞 Support

If you encounter issues:

1. Check the browser console for errors
2. Check the Replit console for server errors
3. Verify all environment variables are set
4. Make sure database is connected and schema is up to date

## 🎯 Next Steps

After successful setup:

1. Customize the application design
2. Add more features
3. Set up file upload for profile photos
4. Configure email notifications
5. Add payment integration
6. Deploy to production

## 📝 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:port/db` |
| `NEXTAUTH_SECRET` | Secret key for authentication | `my-secret-key-123` |
| `NEXTAUTH_URL` | Your Replit URL | `https://app.repl.co` |

## 🔄 Database Schema

The application uses these main models:

- **User**: Basic user accounts (USER, ESCORT, ADMIN roles)
- **Profile**: Escort profile information
- **Listing**: Service listings
- **Review**: User reviews
- **Media**: Profile photos/videos
- **Question**: FAQ system

## 🚨 Important Notes

1. **Free Tier Limits**: Replit free tier has limitations on database size and requests
2. **Data Persistence**: Data persists between sessions but may be lost if Repl is deleted
3. **Performance**: Free tier may have slower performance
4. **Backup**: Consider backing up your database regularly 