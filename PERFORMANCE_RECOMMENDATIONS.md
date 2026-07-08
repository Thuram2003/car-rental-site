# Performance Optimization Recommendations

## Current Performance Issues

Your application is experiencing slow load times (2-5 seconds per request). Here are the identified bottlenecks and solutions:

---

## 1. **Database Query Optimization** (Priority: HIGH)

### Issue
- `getVehicles()` fetches ALL vehicles with no pagination
- `vehicles_with_ratings` view might be slow with complex joins
- No caching strategy

### Solutions

#### A. Add Pagination
```typescript
// lib/actions/vehicles.ts
export async function getVehicles(
  filters: VehicleFilters & { page?: number; pageSize?: number } = {}
): Promise<{ vehicles: VehicleWithRating[]; total: number }> {
  const supabase = await createClient();
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = (supabase as any)
    .from("vehicles_with_ratings")
    .select("*", { count: "exact" })
    .eq("is_active", true)
    .range(from, to);
  
  // ... rest of filters
  
  const { data, error, count } = await query;
  
  return { 
    vehicles: (data ?? []) as VehicleWithRating[], 
    total: count ?? 0 
  };
}
```

#### B. Add Database Indexing
```sql
-- Add indexes to vehicles table for common queries
CREATE INDEX IF NOT EXISTS idx_vehicles_category ON vehicles(category) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_vehicles_fuel_type ON vehicles(fuel_type) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_vehicles_daily_rate ON vehicles(daily_rate) WHERE is_active = true;
```

#### C. Add Server-Side Caching
```typescript
// lib/cache.ts
import { unstable_cache } from 'next/cache';

export const getCachedVehicles = unstable_cache(
  async (filters: VehicleFilters) => {
    return await getVehicles(filters);
  },
  ['vehicles'],
  {
    revalidate: 60, // Cache for 60 seconds
    tags: ['vehicles']
  }
);
```

---

## 2. **Client-Side Optimization** (Priority: MEDIUM)

### Issue
- Multiple useEffect chains causing re-renders
- URL param syncing triggers extra renders

### Solutions

#### A. Optimize State Management
```typescript
// app/(public)/cars/page.tsx
function CarsPageInner() {
  const searchParams = useSearchParams();
  
  // Initialize state from URL params directly - no useEffect needed
  const [vehicles, setVehicles] = useState<VehicleWithRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [category, setCategory] = useState(
    CATEGORIES.find(c => c.toLowerCase() === searchParams.get("category")?.toLowerCase()) ?? "All"
  );
  
  // Single useEffect for data fetching
  useEffect(() => {
    let cancelled = false;
    
    async function fetchVehicles() {
      setLoading(true);
      const data = await getVehicles();
      if (!cancelled) {
        setVehicles(data);
        setLoading(false);
      }
    }
    
    fetchVehicles();
    
    return () => { cancelled = true; };
  }, []);
  
  // Remove the URL param syncing useEffect
}
```

#### B. Convert to Server Component
```typescript
// app/(public)/cars/page.tsx - Make it a server component
export default async function CarsPage({
  searchParams
}: {
  searchParams: { category?: string; search?: string }
}) {
  const vehicles = await getVehicles({
    category: searchParams.category,
    search: searchParams.search
  });
  
  return <CarsPageClient initialVehicles={vehicles} />;
}
```

---

## 3. **Image Optimization** (Priority: HIGH) ✅ FIXED

### What Was Done
- Added `priority` prop to hero images
- Added `loading="eager"` to first 4 visible cars
- Lazy load remaining images

---

## 4. **Additional Optimizations** (Priority: LOW)

### A. Enable Next.js Image Optimization
Remove `unoptimized` prop and configure proper image domains:

```typescript
// next.config.ts
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
    formats: ['image/avif', 'image/webp'],
  },
};
```

### B. Add Loading Skeletons
Instead of just a spinner, show skeleton loading states:

```typescript
<div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {Array.from({ length: 8 }).map((_, i) => (
    <div key={i} className="animate-pulse">
      <div className="bg-gray-200 h-52 rounded-t-3xl" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  ))}
</div>
```

### C. Add React Query for Better Caching
```bash
npm install @tanstack/react-query
```

```typescript
// hooks/use-vehicles.ts
import { useQuery } from '@tanstack/react-query';

export function useVehicles(filters: VehicleFilters) {
  return useQuery({
    queryKey: ['vehicles', filters],
    queryFn: () => getVehicles(filters),
    staleTime: 60 * 1000, // Consider data fresh for 1 minute
  });
}
```

---

## Priority Implementation Order

1. ✅ **Image optimization** (Already done)
2. 🔥 **Add database indexes** (Quick win - run SQL script)
3. 🔥 **Add pagination to getVehicles** (High impact)
4. ⚡ **Convert /cars to server component** (Reduces client-side work)
5. ⚡ **Add server-side caching** (Reduces database load)
6. 💡 **Add React Query** (Better client experience)
7. 💡 **Remove `unoptimized` from images** (Better performance)

---

## Expected Results

After implementing these optimizations:
- **Page load times**: 2-5s → 300-800ms
- **Database queries**: Reduced by 80% with caching
- **LCP score**: Improved from 2.5s → <1.2s
- **React warnings**: Eliminated

---

## Monitoring

Add performance monitoring to track improvements:

```typescript
// lib/monitoring.ts
export function logPerformance(metric: string, duration: number) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${metric}: ${duration}ms`);
  }
}

// Usage
const start = Date.now();
const vehicles = await getVehicles();
logPerformance('getVehicles', Date.now() - start);
```
