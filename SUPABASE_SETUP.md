# Supabase Setup Instructions

## Quick Setup (5 minutes)

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Choose organization, enter project name: "moneytracker"
5. Generate a strong password
6. Select region closest to you
7. Click "Create new project"

### 2. Get Your Keys
1. In your Supabase dashboard, go to Settings → API
2. Copy your Project URL and anon public key
3. Update your `.env` file:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Create Database Tables
1. In Supabase dashboard, go to SQL Editor
2. Copy and paste the entire content of `supabase-schema.sql`
3. Click "Run" to create all tables and security policies

### 4. Enable Authentication
1. Go to Authentication → Settings
2. Enable "Email" provider
3. Disable "Confirm email" for testing (optional)

### 5. Test Connection
1. Restart your development server: `npm run dev`
2. Your data will now be permanently stored in Supabase!

## Benefits
- ✅ **Permanent storage** - Never lose data again
- ✅ **Cross-device sync** - Access from any device
- ✅ **Real-time updates** - Changes sync instantly
- ✅ **Automatic backups** - Supabase handles backups
- ✅ **Free tier** - 500MB storage, 50,000 monthly active users

## Troubleshooting
- If tables don't create, check the SQL Editor for error messages
- Make sure RLS (Row Level Security) is enabled
- Verify your environment variables are correct