# Quick Start: Authentication Setup

## 🚀 Getting Started in 5 Minutes

### 1. Environment Setup

Ensure your `.env.local` has these variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Supabase Configuration

#### Enable Email Confirmations
1. Go to Supabase Dashboard
2. Navigate to **Authentication → Settings**
3. Ensure **"Enable email confirmations"** is **ON**

#### Check Email Template
1. Go to **Authentication → Email Templates**
2. Select **"Confirm signup"** template
3. Verify it contains: `{{ .ConfirmationURL }}`

### 3. Start Development Server

```bash
npm run dev
```

### 4. Test the Flow

#### Test Registration
1. Visit: http://localhost:3000/register
2. Fill personal info (Step 1)
3. Upload documents (Step 2)
4. Submit form
5. You'll be redirected to `/verify-email`

#### Check Email
- **Development**: Use Supabase Inbucket
  - Go to your Supabase project email settings
  - Find the Inbucket URL
  - Check for verification email

- **Production**: Check your real email inbox

#### Verify Email
1. Click the verification link in email
2. You'll be redirected to `/login`
3. Login with your credentials
4. Access granted! 🎉

## 📁 Key Files

### Pages
- `/app/(auth)/register/page.tsx` - Registration page
- `/app/(auth)/login/page.tsx` - Login page
- `/app/(auth)/verify-email/page.tsx` - Email verification page
- `/app/auth/callback/route.ts` - Verification callback handler

### Components
- `/components/auth/register-form.tsx` - Registration form
- `/components/auth/login-form.tsx` - Login form
- `/components/auth/verify-email-form.tsx` - Verification UI

### Server Actions
- `/lib/actions/auth.ts` - Auth server actions
  - `signUp()` - Create account
  - `signIn()` - Login
  - `signOut()` - Logout

### Supabase Clients
- `/lib/supabase/client.ts` - Browser client
- `/lib/supabase/server.ts` - Server client

## 🔧 Common Tasks

### Add New Auth Field

1. **Update Database Schema**
```sql
ALTER TABLE profiles ADD COLUMN new_field TEXT;
```

2. **Update signUp() Action**
```typescript
// lib/actions/auth.ts
export async function signUp(data: {
  // ... existing fields
  newField: string;
}) {
  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        // ... existing metadata
        new_field: data.newField,
      },
    },
  });
}
```

3. **Update Registration Form**
```typescript
// components/auth/register-form.tsx
const schema = z.object({
  // ... existing fields
  newField: z.string().min(1, "Required"),
});
```

### Customize Email Template

1. Go to Supabase Dashboard
2. **Authentication → Email Templates**
3. Select **"Confirm signup"**
4. Edit HTML/text
5. Keep `{{ .ConfirmationURL }}` intact
6. Save changes

### Change Redirect After Login

```typescript
// lib/actions/auth.ts
export async function signIn(email: string, password: string) {
  // ... auth logic
  
  // Change this:
  return { error: null, redirectTo: "/dashboard" }; // Your custom path
}
```

### Disable Email Verification (Testing Only)

1. Go to Supabase Dashboard
2. **Authentication → Settings**
3. Turn OFF **"Enable email confirmations"**
4. Users can login immediately after signup
5. ⚠️ **Don't use in production!**

## 🐛 Troubleshooting

### Issue: Not receiving emails

**Solution 1: Use Supabase Inbucket**
- Check Supabase project settings for Inbucket URL
- Use test email format: `test+{project_ref}@inbucket.supabase.co`

**Solution 2: Configure SMTP**
- Go to **Project Settings → Auth → SMTP Settings**
- Add your SMTP credentials
- Test email delivery

### Issue: "Email not confirmed" on login

**This is expected!** The flow is:
1. User tries to login
2. System detects unverified email
3. User is redirected to `/verify-email`
4. User can request new verification link

### Issue: Verification link doesn't work

**Check these:**
1. Is `NEXT_PUBLIC_APP_URL` correct in `.env.local`?
2. Is `/auth/callback` route file present?
3. Does Supabase email template use `{{ .ConfirmationURL }}`?
4. Has the token expired? (Request new link)

### Issue: Redirect loop

**Check:**
1. Middleware configuration
2. Ensure `/auth/callback` is not protected
3. Check for conflicting redirects

## 📚 Documentation

- **Complete Flow**: See `AUTH_FLOW.md`
- **Visual Diagram**: See `AUTH_FLOW_DIAGRAM.md`
- **Setup Complete**: See `AUTH_SETUP_COMPLETE.md`

## 🔐 Security Checklist

- [x] Email verification required
- [x] Passwords hashed by Supabase
- [x] Secure token-based verification
- [x] Row Level Security (RLS) enabled
- [x] HTTPS in production
- [ ] Rate limiting configured
- [ ] SMTP configured for production
- [ ] Custom email templates with branding

## 🚢 Production Deployment

### Before Going Live

1. **Update Environment Variables**
```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

2. **Configure SMTP**
- Add production SMTP credentials in Supabase
- Test email delivery

3. **Customize Email Templates**
- Add your branding
- Update copy
- Test all templates

4. **Enable Rate Limiting**
- Configure in Supabase settings
- Prevent abuse

5. **Test Complete Flow**
- Register new account
- Verify email
- Login
- Test all edge cases

### Deployment Checklist

- [ ] Environment variables updated
- [ ] SMTP configured and tested
- [ ] Email templates customized
- [ ] Rate limiting enabled
- [ ] SSL/HTTPS configured
- [ ] Error monitoring setup
- [ ] Analytics tracking added
- [ ] Complete flow tested in production

## 💡 Tips

### Development
- Use Supabase Inbucket for testing
- Keep email verification enabled
- Test all error states
- Check browser console for errors

### Production
- Use real SMTP service (SendGrid, AWS SES, etc.)
- Monitor email delivery rates
- Set up alerts for failed verifications
- Keep verification tokens short-lived
- Log auth events for security

## 🆘 Need Help?

1. Check the documentation files
2. Review Supabase Auth docs
3. Check browser console for errors
4. Verify Supabase dashboard settings
5. Test with Supabase Inbucket first

## 📞 Support Resources

- **Supabase Docs**: https://supabase.com/docs/guides/auth
- **Next.js Docs**: https://nextjs.org/docs
- **Project Docs**: See `AUTH_FLOW.md`

---

**Last Updated**: 2026-05-21
**Status**: ✅ Ready for Development
