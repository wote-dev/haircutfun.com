# HaircutFun Authentication Setup Guide

This guide will help you set up Supabase authentication with Google OAuth for your HaircutFun application.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- A Google Cloud Console account for OAuth setup
- Node.js and npm installed

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `haircutfun` (or your preferred name)
   - Database Password: Generate a secure password
   - Region: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be created (2-3 minutes)

## Step 2: Get Supabase Credentials

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **Project API Keys** > **anon public** key
   - **Project API Keys** > **service_role** key (keep this secret!)

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

## Step 4: Run Database Migrations

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref your-project-id
   ```
   (Find your project ID in the Supabase dashboard URL)

4. Push the database schema:
   ```bash
   supabase db push
   ```

## Step 5: Set up Google OAuth

### 5.1 Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to **APIs & Services** > **Library**
   - Search for "Google+ API" and enable it
4. Create OAuth credentials:
   - Go to **APIs & Services** > **Credentials**
   - Click **Create Credentials** > **OAuth client ID**
   - Choose **Web application**
   - Add authorized redirect URIs:
     ```
     https://your-project-id.supabase.co/auth/v1/callback
     http://localhost:3000/auth/callback (for development)
     ```
   - Save and copy the **Client ID** and **Client Secret**

### 5.2 Configure Google OAuth in Supabase

1. In your Supabase dashboard, go to **Authentication** > **Providers**
2. Find **Google** and click the toggle to enable it
3. Enter your Google OAuth credentials:
   - **Client ID**: Your Google OAuth Client ID
   - **Client Secret**: Your Google OAuth Client Secret
4. Click **Save**

## Step 6: Configure Authentication Settings

1. In Supabase dashboard, go to **Authentication** > **Settings**
2. Under **Site URL**, add your domain:
   - For development: `http://localhost:3000`
   - For production: `https://yourdomain.com`
3. Under **Redirect URLs**, add:
   - `http://localhost:3000/auth/callback`
   - `https://yourdomain.com/auth/callback` (for production)
4. Click **Save**

## Step 7: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000)
3. Click the "Sign in with Google" button in the navigation
4. Complete the Google OAuth flow
5. You should be redirected back and see your profile in the navigation

## Step 8: Verify Database Setup

1. In Supabase dashboard, go to **Table Editor**
2. You should see these tables:
   - `user_profiles`
   - `subscriptions`
   - `usage_tracking`
3. After signing in, check that a user profile was created automatically

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**
   - Make sure your redirect URIs in Google Cloud Console match exactly
   - Check for trailing slashes or typos

2. **"Site URL not allowed"**
   - Verify your Site URL in Supabase Authentication settings
   - Make sure it matches your development/production domain

3. **Database connection errors**
   - Double-check your environment variables
   - Ensure the Supabase project is active and not paused

4. **Migration errors**
   - Make sure you're linked to the correct Supabase project
   - Check that you have the necessary permissions

### Getting Help

- [Supabase Documentation](https://supabase.com/docs)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Next.js Authentication Guide](https://nextjs.org/docs/authentication)

## Next Steps

Once authentication is working:

1. Set up Stripe for payments (see Stripe setup guide)
2. Configure webhook endpoints for subscription management
3. Test the complete user flow from sign-up to premium features

---

**Security Note**: Never commit your `.env.local` file to version control. The `.env.example` file is provided as a template only.