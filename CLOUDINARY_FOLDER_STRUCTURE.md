# Cloudinary Folder Structure

This document outlines the organized folder structure for image uploads in the car rental application.

## Folder Organization

All images are organized under the `car-rental/` root folder with the following subfolders:

### 1. Profile Images (`car-rental/profile`)
- **Purpose**: User profile pictures and avatars
- **Used in**: Customer profile page
- **File**: `app/(customer)/profile/page.tsx`
- **Upload location**: Line 111
- **Typical images**: User profile photos, ID photos

### 2. Vehicle Images (`car-rental/vehicles`)
- **Purpose**: Vehicle photos for the fleet
- **Used in**: Admin fleet management
- **File**: `components/cars/AddVehicleDrawer.tsx`
- **Upload location**: Line 598
- **Typical images**: Car exterior/interior photos, vehicle showcase images

## Implementation Details

### Upload Configuration
The `uploadToCloudinary` function in `lib/cloudinary.ts` accepts a `folder` parameter:

```typescript
uploadToCloudinary(file: File, folder: string)
```

### Current Usage

**Profile uploads:**
```typescript
const uploadResult = await uploadToCloudinary(file, "car-rental/profile");
```

**Vehicle uploads:**
```typescript
<ImageUpload
  folder="car-rental/vehicles"
  // ... other props
/>
```

## Benefits of This Structure

1. **Organization**: Clear separation between user images and vehicle images
2. **Easy Management**: Simple to locate and manage specific image types in Cloudinary dashboard
3. **Access Control**: Can set different permissions/transformations per folder if needed
4. **Scalability**: Easy to add new folders for other image types (e.g., `car-rental/documents`, `car-rental/maintenance`)

## Cloudinary Dashboard Setup

Make sure your Cloudinary upload preset is configured to allow these folders:
- Preset name: `car_rental_vehicles` (or as defined in `.env.local`)
- Signing mode: Unsigned
- Allowed folders: `car-rental/profile`, `car-rental/vehicles`
- Transformations: quality=auto, format=auto

## Future Folders (Suggested)

Consider adding these folders as the application grows:
- `car-rental/documents` - Legal documents, contracts
- `car-rental/maintenance` - Maintenance records, inspection photos
- `car-rental/damage` - Damage reports and photos
- `car-rental/insurance` - Insurance documents and photos
