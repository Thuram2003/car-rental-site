# Authentication Components

This directory contains reusable authentication components for the car rental application.

## Component Structure

### Main Components

#### `RegisterForm`
The main orchestrator component that manages the multi-step registration flow.
- Handles step navigation (Personal Info → Document Verification)
- Manages form state across steps
- Coordinates submission to the backend

#### `PersonalInfoStep`
Reusable component for collecting basic user information.

**Props:**
- `form`: React Hook Form instance for personal info
- `onSubmit`: Callback when form is submitted
- `showLoginLink`: Optional boolean to show/hide login link (default: true)

**Fields:**
- First Name
- Last Name
- Email
- Phone Number

**Features:**
- ✅ Toast notifications for validation errors
- ✅ Inline field-level error messages
- ✅ User-friendly error feedback

**Usage:**
```tsx
import { PersonalInfoStep, type PersonalInfoFormValues } from "@/components/auth";

const form = useForm<PersonalInfoFormValues>({
  resolver: zodResolver(personalInfoSchema),
  defaultValues: { firstName: "", lastName: "", email: "", phone: "" },
});

<PersonalInfoStep 
  form={form} 
  onSubmit={handleSubmit}
  showLoginLink={true}
/>
```

#### `DocumentVerificationStep`
Reusable component for document verification and account security.

**Props:**
- `form`: React Hook Form instance for document verification
- `onSubmit`: Callback when form is submitted
- `onBack`: Callback for back button
- `isPending`: Optional boolean for loading state (default: false)

**Fields:**
- ID Type (CNI/Passport)
- ID Number
- ID Front/Back Images
- Driver's License Number
- License Front/Back Images
- Password
- Confirm Password
- Terms Agreement

**Features:**
- ✅ Toast notifications for validation errors
- ✅ Inline field-level error messages
- ✅ Image preview with upload/remove functionality
- ✅ Password visibility toggle
- ✅ Terms and conditions checkbox

**Usage:**
```tsx
import { DocumentVerificationStep, type DocumentVerificationFormValues } from "@/components/auth";

const form = useForm<DocumentVerificationFormValues>({
  resolver: zodResolver(documentVerificationSchema),
  defaultValues: { 
    idType: "cni", 
    idNumber: "", 
    // ... other fields
  },
});

<DocumentVerificationStep 
  form={form} 
  onSubmit={handleSubmit}
  onBack={handleBack}
  isPending={isLoading}
/>
```

#### `DocumentUploadCard`
Reusable component for uploading and previewing document images.

**Props:**
- `preview`: Current image preview URL (string | null)
- `onUpload`: Callback when file is uploaded
- `onRemove`: Callback when image is removed
- `label`: Display label for the upload area
- `altText`: Alt text for the image

**Features:**
- Drag-and-drop support
- Image preview with hover overlay
- Remove button with confirmation
- Success indicator when uploaded

**Usage:**
```tsx
import { DocumentUploadCard } from "@/components/auth";

const [preview, setPreview] = useState<string | null>(null);

<DocumentUploadCard
  preview={preview}
  onUpload={(file) => handleUpload(file, setPreview)}
  onRemove={() => handleRemove(setPreview)}
  label="Front Side"
  altText="ID Front"
/>
```

## Benefits of This Structure

### ✅ Reusability
- Each step can be used independently in other flows
- `DocumentUploadCard` can be used anywhere file uploads are needed
- Easy to create variations (e.g., single-step registration)

### ✅ Maintainability
- Clear separation of concerns
- Each component has a single responsibility
- Easier to test individual components

### ✅ Flexibility
- Props allow customization without modifying component code
- Optional props provide sensible defaults
- Type-safe interfaces with TypeScript

### ✅ Scalability
- Easy to add new steps or modify existing ones
- Can compose components in different ways
- Shared components reduce code duplication

## File Structure

```
components/auth/
├── README.md                          # This file
├── index.ts                           # Barrel exports
├── login-form.tsx                     # Login form component
├── register-form.tsx                  # Main registration orchestrator
├── PersonalInfoStep.tsx               # Step 1: Personal information
├── DocumentVerificationStep.tsx       # Step 2: Document verification
└── DocumentUploadCard.tsx             # Reusable upload component
```

## Future Enhancements

Consider these improvements:
- Add form field validation feedback in real-time
- Implement auto-save for form progress
- Add image compression before upload
- Support multiple file formats (PDF for documents)
- Add OCR for automatic ID number extraction
- Implement progress persistence in localStorage
