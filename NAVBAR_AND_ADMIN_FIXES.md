# Navbar Loading & Admin Dashboard Fixes

## Issues Fixed

### 1. Navbar Loading Delay ✅
**Problem:** Navbar profile/sign-in buttons were empty initially and took time to load.

**Root Cause:** Client-side authentication fetching in `useEffect` caused delays.

**Solution:** Implemented Server-Side Rendering (SSR) for authentication:
- Layouts now fetch user profile on the server before rendering
- Profile data passed as `initialProfile` prop to Navbar
- Navbar renders instantly with correct state
- Client-side only listens for auth changes (sign in/out)

**Files Modified:**
- `app/(public)/layout.tsx` - Added server-side profile fetching
- `app/(customer)/layout.tsx` - Added server-side profile fetching
- `components/shared/navbar.tsx` - Accepts `initialProfile` prop, removed client-side fetching
- `app/layout.tsx` - Removed navbar (to avoid duplication)

### 2. Double Navbar Issue ✅
**Problem:** Two navbars were rendering on the page.

**Root Cause:** Both root layout and route group layouts were rendering `<Navbar />`. Since Next.js layouts are nested, both appeared.

**Solution:** Removed Navbar from root layout, kept it only in route group layouts.

### 3. Supabase Lock Error ✅
**Problem:** `NavigatorLockAcquireTimeoutError: Lock "lock:sb-cbjchqvbaqkkthdrwjii-auth-token" was released because another request stole it`

**Root Cause:** Server-side and client-side Supabase clients were competing for the same auth token lock.

**Solution:** 
- Removed client-side auth fetching from navbar
- Only server-side fetches auth data
- Client-side only listens to auth state changes
- Uses `router.refresh()` to get new server data when auth changes

### 4. Admin Dashboard Icon Error ✅
**Problem:** `Only plain objects can be passed to Client Components from Server Components. Classes or other objects with methods are not supported.`

**Root Cause:** Server component (admin dashboard page) was passing React component classes (Phosphor icons) as props to client component (StatCard).

**Solution:** 
- Changed StatCard to accept icon names as strings (`"money"`, `"calendar"`, etc.)
- Created an `iconMap` inside StatCard to map strings to icon components
- Updated admin dashboard to pass icon names instead of component classes

**Files Modified:**
- `components/cars/StatCard.tsx` - Changed icon prop from `React.ElementType` to string union type
- `app/admin/dashboard/page.tsx` - Pass icon names as strings

## Technical Details

### Server-Side Auth Pattern
```typescript
// In layout.tsx (server component)
export default async function Layout({ children }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let profile = null;
  if (user) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = profileData || fallbackProfile;
  }

  return <Navbar initialProfile={profile} />
}
```

### Client-Side Auth Listener Pattern
```typescript
// In navbar.tsx (client component)
useEffect(() => {
  const supabase = createClient();
  
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") {
      setProfile(null);
    } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
      router.refresh(); // Get new server data
    }
  });

  return () => subscription.unsubscribe();
}, [router]);
```

### Icon Prop Pattern for Server → Client
```typescript
// StatCard.tsx (client component)
interface StatCardProps {
  icon: "money" | "calendar" | "car" | "users";
  // ... other props
}

const iconMap = {
  money: Money,
  calendar: CalendarBlank,
  car: Car,
  users: Users,
};

export function StatCard({ icon, ...props }: StatCardProps) {
  const Icon = iconMap[icon];
  return <Icon className="..." />;
}
```

## Benefits

✅ **Instant navbar rendering** - No loading states or empty placeholders
✅ **No layout shifts** - Profile/buttons appear immediately
✅ **No race conditions** - Server and client don't compete for auth locks
✅ **Better performance** - Faster perceived load time
✅ **Cleaner code** - Separation of server and client concerns
✅ **Type safety** - Icon names are type-checked

## Testing Checklist

- [x] Navbar loads instantly on all pages
- [x] No double navbar rendering
- [x] No Supabase lock errors in console
- [x] Sign in updates navbar immediately
- [x] Sign out updates navbar immediately
- [x] Admin dashboard renders without errors
- [x] All stat cards display correctly with icons
