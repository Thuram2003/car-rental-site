# Authentication Flow Diagram

## Complete Registration & Verification Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         REGISTRATION FLOW                                    │
└─────────────────────────────────────────────────────────────────────────────┘

    User                    Browser                  Server Action           Supabase
     │                         │                          │                      │
     │  1. Visit /register     │                          │                      │
     ├────────────────────────>│                          │                      │
     │                         │                          │                      │
     │  2. Fill Step 1         │                          │                      │
     │  (Personal Info)        │                          │                      │
     ├────────────────────────>│                          │                      │
     │                         │                          │                      │
     │  3. Fill Step 2         │                          │                      │
     │  (Documents + Password) │                          │                      │
     ├────────────────────────>│                          │                      │
     │                         │                          │                      │
     │  4. Submit Form         │                          │                      │
     ├────────────────────────>│  5. Call signUp()        │                      │
     │                         ├─────────────────────────>│                      │
     │                         │                          │  6. Create User      │
     │                         │                          ├─────────────────────>│
     │                         │                          │                      │
     │                         │                          │  7. Send Email       │
     │                         │                          │<─────────────────────┤
     │                         │                          │                      │
     │                         │  8. Return success       │                      │
     │                         │<─────────────────────────┤                      │
     │                         │                          │                      │
     │  9. Redirect to         │                          │                      │
     │  /verify-email          │                          │                      │
     │<────────────────────────┤                          │                      │
     │                         │                          │                      │
     │ 10. See "Check Email"   │                          │                      │
     │     message             │                          │                      │
     │<────────────────────────┤                          │                      │
     │                         │                          │                      │

┌─────────────────────────────────────────────────────────────────────────────┐
│                      EMAIL VERIFICATION FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

    User                    Email Client            Browser                Supabase
     │                         │                       │                      │
     │ 11. Open Email          │                       │                      │
     ├────────────────────────>│                       │                      │
     │                         │                       │                      │
     │ 12. Click Link          │                       │                      │
     │  (with token_hash)      │                       │                      │
     ├────────────────────────>│                       │                      │
     │                         │                       │                      │
     │                         │ 13. Open URL          │                      │
     │                         │  /auth/callback       │                      │
     │                         │  ?token_hash=xxx      │                      │
     │                         ├──────────────────────>│                      │
     │                         │                       │                      │
     │                         │                       │ 14. Verify Token     │
     │                         │                       ├─────────────────────>│
     │                         │                       │                      │
     │                         │                       │ 15. Mark Verified    │
     │                         │                       │<─────────────────────┤
     │                         │                       │                      │
     │                         │ 16. Redirect to       │                      │
     │                         │     /login            │                      │
     │<────────────────────────┴───────────────────────┤                      │
     │                                                 │                      │
     │ 17. Login with          │                       │                      │
     │     credentials         │                       │                      │
     ├─────────────────────────────────────────────────>                      │
     │                                                 │                      │
     │ 18. Access granted      │                       │                      │
     │<────────────────────────────────────────────────┤                      │
     │                                                                         │

┌─────────────────────────────────────────────────────────────────────────────┐
│                   UNVERIFIED LOGIN ATTEMPT FLOW                              │
└─────────────────────────────────────────────────────────────────────────────┘

    User                    Browser                  Server Action           Supabase
     │                         │                          │                      │
     │  1. Visit /login        │                          │                      │
     ├────────────────────────>│                          │                      │
     │                         │                          │                      │
     │  2. Enter credentials   │                          │                      │
     ├────────────────────────>│                          │                      │
     │                         │                          │                      │
     │  3. Submit Form         │                          │                      │
     ├────────────────────────>│  4. Call signIn()        │                      │
     │                         ├─────────────────────────>│                      │
     │                         │                          │  5. Check Auth       │
     │                         │                          ├─────────────────────>│
     │                         │                          │                      │
     │                         │                          │  6. Email Not        │
     │                         │                          │     Verified!        │
     │                         │                          │<─────────────────────┤
     │                         │                          │                      │
     │                         │  7. Return               │                      │
     │                         │  needsVerification=true  │                      │
     │                         │<─────────────────────────┤                      │
     │                         │                          │                      │
     │  8. Show info toast     │                          │                      │
     │  "Please verify email"  │                          │                      │
     │<────────────────────────┤                          │                      │
     │                         │                          │                      │
     │  9. Redirect to         │                          │                      │
     │  /verify-email          │                          │                      │
     │<────────────────────────┤                          │                      │
     │                         │                          │                      │
     │ 10. Can resend          │                          │                      │
     │     verification        │                          │                      │
     │<────────────────────────┤                          │                      │
     │                         │                          │                      │

┌─────────────────────────────────────────────────────────────────────────────┐
│                      RESEND VERIFICATION FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

    User                    Browser                  Supabase Client        Supabase
     │                         │                          │                      │
     │  1. On /verify-email    │                          │                      │
     │  page                   │                          │                      │
     │<────────────────────────┤                          │                      │
     │                         │                          │                      │
     │  2. Click "Resend"      │                          │                      │
     ├────────────────────────>│                          │                      │
     │                         │                          │                      │
     │                         │  3. Call resend()        │                      │
     │                         ├─────────────────────────>│                      │
     │                         │                          │  4. Send New Email   │
     │                         │                          ├─────────────────────>│
     │                         │                          │                      │
     │                         │                          │  5. Email Sent       │
     │                         │                          │<─────────────────────┤
     │                         │                          │                      │
     │                         │  6. Return success       │                      │
     │                         │<─────────────────────────┤                      │
     │                         │                          │                      │
     │  7. Show success toast  │                          │                      │
     │  "Email sent!"          │                          │                      │
     │<────────────────────────┤                          │                      │
     │                         │                          │                      │
     │  8. Check email again   │                          │                      │
     │  and click new link     │                          │                      │
     │                         │                          │                      │

┌─────────────────────────────────────────────────────────────────────────────┐
│                    VERIFICATION PAGE STATES                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│   IDLE STATE         │  No token in URL
│                      │  
│  📧 Check your email │  Shows:
│                      │  - Email address
│  We sent a link to:  │  - Resend button
│  user@example.com    │  - Back to login button
│                      │
│  [Resend Email]      │
│  [Back to Login]     │
└──────────────────────┘

┌──────────────────────┐
│  VERIFYING STATE     │  Token in URL, verifying
│                      │
│      ⏳ Loading      │  Shows:
│                      │  - Loading spinner
│  Verifying your      │  - "Please wait" message
│  email...            │
│                      │
└──────────────────────┘

┌──────────────────────┐
│   SUCCESS STATE      │  Verification successful
│                      │
│      ✅ Success      │  Shows:
│                      │  - Green checkmark
│  Email verified!     │  - Success message
│                      │  - Auto-redirect countdown
│  Redirecting to      │  - Manual continue button
│  login...            │
│                      │
│  [Continue to Login] │
└──────────────────────┘

┌──────────────────────┐
│    ERROR STATE       │  Verification failed
│                      │
│      ❌ Error        │  Shows:
│                      │  - Red X icon
│  Verification failed │  - Error message
│                      │  - Resend button
│  Link may have       │  - Back to login button
│  expired             │
│                      │
│  [Request New Link]  │
│  [Back to Login]     │
└──────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         FILE INTERACTIONS                                    │
└─────────────────────────────────────────────────────────────────────────────┘

Registration Form                    Auth Actions                    Supabase
─────────────────                    ────────────                    ────────
register-form.tsx                    auth.ts                         Database
     │                                  │                                │
     │ handleSubmit()                   │                                │
     ├─────────────────────────────────>│ signUp()                       │
     │                                  ├───────────────────────────────>│
     │                                  │                                │
     │                                  │ auth.signUp()                  │
     │                                  │ - Create user                  │
     │                                  │ - Send email                   │
     │                                  │ - Create profile (trigger)     │
     │                                  │                                │
     │                                  │<───────────────────────────────┤
     │ { needsVerification: true }      │                                │
     │<─────────────────────────────────┤                                │
     │                                  │                                │
     │ router.push('/verify-email')     │                                │
     │                                  │                                │

Login Form                           Auth Actions                    Supabase
──────────                           ────────────                    ────────
login-form.tsx                       auth.ts                         Database
     │                                  │                                │
     │ handleSubmit()                   │                                │
     ├─────────────────────────────────>│ signIn()                       │
     │                                  ├───────────────────────────────>│
     │                                  │                                │
     │                                  │ auth.signInWithPassword()      │
     │                                  │ - Check credentials            │
     │                                  │ - Check email_confirmed_at     │
     │                                  │                                │
     │                                  │<───────────────────────────────┤
     │ { needsVerification: true }      │                                │
     │<─────────────────────────────────┤                                │
     │                                  │                                │
     │ router.push('/verify-email')     │                                │
     │                                  │                                │

Verify Email Form                    Supabase Client                 Supabase
─────────────────                    ───────────────                 ────────
verify-email-form.tsx                client.ts                       Auth API
     │                                  │                                │
     │ useEffect() - token in URL       │                                │
     ├─────────────────────────────────>│ auth.verifyOtp()               │
     │                                  ├───────────────────────────────>│
     │                                  │                                │
     │                                  │ Verify token_hash              │
     │                                  │ Mark email as confirmed        │
     │                                  │                                │
     │                                  │<───────────────────────────────┤
     │ Success!                         │                                │
     │<─────────────────────────────────┤                                │
     │                                  │                                │
     │ router.push('/login')            │                                │
     │                                  │                                │
     │                                  │                                │
     │ handleResend()                   │                                │
     ├─────────────────────────────────>│ auth.resend()                  │
     │                                  ├───────────────────────────────>│
     │                                  │                                │
     │                                  │ Send new verification email    │
     │                                  │                                │
     │                                  │<───────────────────────────────┤
     │ "Email sent!"                    │                                │
     │<─────────────────────────────────┤                                │
     │                                  │                                │

Auth Callback Route                  Supabase Server                 Supabase
───────────────────                  ───────────────                 ────────
/auth/callback/route.ts              server.ts                       Auth API
     │                                  │                                │
     │ GET request with token_hash      │                                │
     ├─────────────────────────────────>│ auth.verifyOtp()               │
     │                                  ├───────────────────────────────>│
     │                                  │                                │
     │                                  │ Verify token                   │
     │                                  │ Update user record             │
     │                                  │                                │
     │                                  │<───────────────────────────────┤
     │ Redirect to /login               │                                │
     │<─────────────────────────────────┤                                │
     │                                  │                                │
```

## Key Points

### 1. Email Verification is Required
- Users cannot login until email is verified
- Supabase automatically sends verification email on signup
- Verification link contains secure `token_hash`

### 2. Multiple Entry Points
- **After Registration**: Automatic redirect to `/verify-email`
- **Failed Login**: Redirect to `/verify-email` if email not verified
- **Direct Access**: User can visit `/verify-email` anytime

### 3. Verification Methods
- **Automatic**: Click link in email → Callback verifies → Redirect to login
- **Manual**: Visit verification page → Request new link → Repeat

### 4. State Management
- Registration data stored in component state (2-step form)
- Auth state managed by Supabase (cookies/JWT)
- No additional state management library needed

### 5. Security
- Token-based verification (secure, time-limited)
- Server-side validation via Supabase
- Row Level Security (RLS) in database
- Password hashing by Supabase

## URL Patterns

```
Registration:
/register → /verify-email?email=user@example.com

Email Link:
/auth/callback?token_hash=xxx&type=email → /login

Unverified Login:
/login → /verify-email?email=user@example.com

Resend:
/verify-email → (stays on same page, sends new email)
```
