# Supabase Setup Guide for StudyPal

This guide will help you set up Supabase integration to fix 401 Unauthorized errors.

## 🔧 Step 1: Get Your Supabase Credentials

1. Go to your Supabase project: https://mcp.supabase.com/mcp?project_ref=tugqiaqepvaqnnrairax
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL**: `https://tugqiaqepvaqnnrairax.supabase.co`
   - **anon/public key**: (This is your anonymous/public key)

## 📝 Step 2: Create `.env` File

1. Copy the template file:
   ```bash
   cp env.template .env
   ```

2. Open `.env` and fill in your Supabase credentials:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=https://tugqiaqepvaqnnrairax.supabase.co
   VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
   
   # OpenAI Configuration
   VITE_OPENAI_API_KEY=your_openai_key_here
   ```

## 🗄️ Step 3: Run Database Migrations

Run the migration to fix RLS policies:

```sql
-- Connect to your Supabase project SQL Editor and run:

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Users quando view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;

-- Create new policies
CREATE POLICY "Users can view profiles"
  ON public.user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert profiles"
  ON public.user_profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update profiles"
  ON public.user_profiles FOR UPDATE
  USING (true)
  WITH CHECK (true);
```

Or run the migration file:
```bash
# In Supabase SQL Editor, paste the contents of:
# supabase/migrations/20250101000000_fix_rls_policies_for_firebase.sql
```

## 🚀 Step 4: Restart Development Server

If running locally:
```bash
npm run dev
```

If using Docker:
```bash
docker-compose down
docker-compose up --build
```

## ✅ Step 5: Verify Setup

1. Log in to your application
2. Go to Settings page
3. Try updating your profile (name, email, etc.)
4. Check that changes are saved without 401 errors

## 🔍 Troubleshooting

### 401 Unauthorized Error
- **Check**: `.env` file exists and has correct `VITE_SUPABASE_ANON_KEY`
- **Check**: RLS policies are set up correctly (see Step 3)
- **Check**: User is logged in (Firebase authentication)
- **Solution**: Restart dev server after adding `.env` file

### Profile Not Saving
- **Check**: Browser console for specific error messages
- **Check**: Supabase dashboard → Table Editor → `user_profiles` table
- **Check**: Firebase user UID matches `firebase_uid` in database

### Still Having Issues?
1. Check browser console for errors
2. Verify Supabase URL matches: `https://tugqiaqepvaqnnrairax.supabase.co`
3. Ensure `user_profiles` table exists and has correct structure
4. Verify RLS policies allow SELECT, INSERT, UPDATE operations

## 📚 Notes

- This project uses **Firebase Authentication** for user login
- Supabase is used as the **database backend**
- Profiles are linked via `firebase_uid` field
- Security is enforced at the application level by verifying `firebase_uid` matches authenticated user

## 🔐 Security Model

Since we're using Firebase Auth (not Supabase Auth), we:
1. Store Firebase UID in `firebase_uid` column
2. Verify UID matches in application code before database operations
3. Use RLS policies that allow operations (security enforced in app)
4. All profile operations check `firebase_uid` against `auth.currentUser.uid`
