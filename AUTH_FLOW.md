# Car Rental App - Authentication Flow

## Overview

This application uses **Supabase Auth** for authentication with email verification. The flow is similar to instanvi-auth-frontend and gracely-frontend implementations.

## Authentication Flow

### 1. Registration Flow

#### Step 1: Personal Information (`/register`)
- User enters: First Name, Last Name, Email, Phone
- Data is stored in local state
- User proceeds to Step 2

#### Step 2: Document Verification (`/register`)
- User uploads ID documents and driver's license
- User sets password
- On submit:
  1. `signUp()` action is called with all data
  2. Supabase creates user account
  3. Supabase sends verification email automatically
  4. User is redirected to `/verify-email?email=user@example.com`

#### Step 3: Email Verification (`/verify-email`)
- User receives email with verification link
- Link format: `http://localhost:3000/auth/callback?token_hash=xxx&type=email`
- When user clicks link:
  1. Request goes to `/auth/callback` route handler
  2. Route handler verifies the token with Supabase
  3. On success, redirects to login page
  4. On failure, redirects back to verify-email with error

**Alternative: Manual Verification Page**
- User can also visit `/verify-email?email=user@example.com` directly
- Page shows "Check your email" message
- User can request a new verification link
- When verification link is clicked, it follows the same callback flow

### 2. Login Flow

#### Standard Login (`/login`)
- User enters email and password
- On submit:
  1. `signIn()` action is called
  2. If email not verified:
     - Returns `needsVerification: true`
     - Redirects to `/verify-email?email=user@example.com`
  3. If credentials invalid:
     - Shows error message
  4. If successful:
     - Checks user role (admin/staff vs customer)
     - Redirects to appropriate dashboard

### 3. Email Verification States

The `/verify-email` page handles multiple states:

1. **Idle State** (no token in URL)
   - Shows "Check your email" message
   - Displays user's email
   - Provides "Resend verification email" button
   - Provides "Back to Login" button

2. **Verifying State** (token in URL, verification in progress)
   - Shows loading spinner
   - Message: "Verifying your email..."

3. **Success State** (verification successful)
   - Shows green checkmark icon
   - Message: "Email verified!"
   - Auto-redirects to login after 3 seconds
   - Provides manual "Continue to Login" button

4. **Error State** (verification failed)
   - Shows red X icon
   - Displays error message
   - Provides "Request new verification link" button
   - Provides "Back to Login" button

## Technical Implementation

### Files Structure

```
car-rental-app/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx                 # Login page
│   │   ├── register/
│   │   │   └── page.tsx                 # Registration page
│   │   ├── verify-email/
│   │   │   └── page.tsx                 # Email verification page
│   │   └── layout.tsx                   # Auth pages layout
│   └── auth/
│       └── callback/
│           └── route.ts                 # Supabase callback handler
├── components/
│   └── auth/
│       ├── login-form.tsx               # Login form component
│       ├── register-form.tsx            # Registration form component
│       ├── verify-email-form.tsx        # Email verification component
│       ├── PersonalInfoStep.tsx         # Step 1 of registration
│       └── DocumentVerificationStep.tsx # Step 2 of registration
├── lib/
│   ├── actions/
│   │   └── auth.ts                      # Server actions for auth
│   └── supabase/
│       ├── client.ts                    # Browser Supabase client
│       ├── server.ts                    # Server Supabase client
│       └── types.ts                     # Database types
└── middleware.ts                        # Route protection
```

### Key Components

#### 1. `signUp()` Server Action
```typescript
export async function signUp(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  licenseNumber: string;
}): Promise<{ error: AuthError | null; needsVerification?: boolean }>
```

**Features:**
- Creates user account in Supabase
- Sets `emailRedirectTo` for verification callback
- Auto-creates profile via database trigger
- Updates profile with phone and license number
- Returns `needsVerification: true` if email confirmation required

#### 2. `signIn()` Server Action
```typescript
export async function signIn(
  email: string,
  password: string
): Promise<{ 
  error: AuthError | null; 
  redirectTo?: string; 
  needsVerification?: boolean 
}>
```

**Features:**
- Authenticates user with Supabase
- Checks if email is verified
- Returns `needsVerification: true` if not verified
- Checks user role for appropriate redirect
- Returns redirect path based on role

#### 3. `VerifyEmailForm` Component

**Features:**
- Handles token-based verification from email links
- Shows different UI states (idle, verifying, success, error)
- Allows resending verification email
- Auto-redirects on success
- Provides manual navigation options

#### 4. Auth Callback Route Handler

**Purpose:** Handle Supabase email verification callbacks

**Flow:**
1. Receives `token_hash` and `type` from Supabase email link
2. Calls `supabase.auth.verifyOtp()` to verify token
3. On success: redirects to login
4. On failure: redirects to verify-email with error

### Environment Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# App URL for email verification redirects
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Supabase Email Templates

Supabase automatically sends verification emails. To customize:

1. Go to Supabase Dashboard → Authentication → Email Templates
2. Edit "Confirm signup" template
3. Ensure the link uses: `{{ .ConfirmationURL }}`
4. The URL will be: `{NEXT_PUBLIC_APP_URL}/auth/callback?token_hash=xxx&type=email`

### Database Triggers

The `handle_new_user()` trigger automatically creates a profile when a user signs up:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    'customer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## User Experience

### Happy Path
1. User fills registration form (2 steps)
2. User submits and sees success message
3. User is redirected to `/verify-email?email=user@example.com`
4. User sees "Check your email" page
5. User opens email and clicks verification link
6. Browser opens `/auth/callback?token_hash=xxx&type=email`
7. Callback verifies token and redirects to login
8. User logs in successfully
9. User is redirected to cars page (or admin dashboard)

### Error Handling

**Email Not Verified on Login:**
- User tries to login before verifying email
- System detects unverified email
- User is redirected to `/verify-email?email=user@example.com`
- User can request new verification link

**Expired Verification Link:**
- User clicks old verification link
- Callback fails to verify token
- User is redirected to `/verify-email?error=verification_failed`
- Error state is shown with option to request new link

**Resend Verification:**
- User clicks "Resend verification email" button
- System calls `supabase.auth.resend({ type: 'signup', email })`
- New verification email is sent
- User receives fresh link

## Security Features

1. **Email Verification Required**
   - Users cannot login until email is verified
   - Prevents fake account creation

2. **Token-Based Verification**
   - Secure token_hash in verification links
   - Tokens expire after set time (configurable in Supabase)

3. **Row Level Security (RLS)**
   - Database policies enforce access control
   - Users can only access their own data

4. **Password Requirements**
   - Minimum 8 characters (enforced in form)
   - Supabase handles password hashing

5. **Session Management**
   - Supabase handles JWT tokens
   - Automatic session refresh
   - Secure cookie storage

## Testing the Flow

### Local Development

1. **Start the app:**
   ```bash
   npm run dev
   ```

2. **Register a new account:**
   - Go to http://localhost:3000/register
   - Fill in personal info
   - Upload documents
   - Set password
   - Submit

3. **Check email:**
   - Open your email inbox
   - Find verification email from Supabase
   - Click verification link

4. **Verify and login:**
   - Browser opens callback URL
   - Redirects to login
   - Enter credentials
   - Access the app

### Testing Email Verification

**Option 1: Use real email**
- Configure SMTP in Supabase dashboard
- Use your real email address
- Receive actual verification emails

**Option 2: Use Supabase Inbucket (Development)**
- Supabase provides test email inbox
- Go to: https://inbucket.supabase.co
- Use format: `test+{project_ref}@inbucket.supabase.co`
- Check inbox at Inbucket URL

**Option 3: Disable email verification (Testing only)**
- Go to Supabase Dashboard → Authentication → Settings
- Disable "Enable email confirmations"
- Users can login immediately after signup
- **NOT recommended for production**

## Comparison with Other Implementations

### Similar to instanvi-auth-frontend:
- Token-based email verification
- Multi-state verification page
- Resend verification functionality
- Auto-redirect on success

### Similar to gracely-frontend:
- Supabase Auth integration
- Server actions for auth operations
- Client-side Supabase client for verification
- Toast notifications for feedback

### Differences:
- Uses 2-step registration (personal info + documents)
- Includes document upload for driver verification
- Simpler role system (customer/admin/staff)
- No organization/workspace selection

## Troubleshooting

### Issue: "Email not confirmed" error on login
**Solution:** User needs to verify email first. Redirect to `/verify-email`.

### Issue: Verification link doesn't work
**Possible causes:**
1. Token expired - Request new verification link
2. Wrong callback URL - Check `NEXT_PUBLIC_APP_URL` in .env
3. Supabase email template misconfigured - Check template in dashboard

### Issue: Not receiving verification emails
**Possible causes:**
1. SMTP not configured in Supabase
2. Email in spam folder
3. Email confirmations disabled in Supabase settings

### Issue: Redirect loop after verification
**Solution:** Check middleware configuration and ensure `/auth/callback` is not protected.

## Production Checklist

- [ ] Configure custom SMTP in Supabase (not default Supabase emails)
- [ ] Customize email templates with branding
- [ ] Set production `NEXT_PUBLIC_APP_URL` in environment variables
- [ ] Enable email confirmations in Supabase settings
- [ ] Test complete registration flow
- [ ] Test email verification with real email addresses
- [ ] Test resend verification functionality
- [ ] Configure email rate limiting
- [ ] Set up monitoring for failed verifications
- [ ] Add analytics tracking for auth events

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
