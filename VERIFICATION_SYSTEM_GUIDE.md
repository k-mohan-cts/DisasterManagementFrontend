# Document Verification System - Complete Implementation Guide

## Overview
The Disaster Relief system now includes a gated document verification process that ensures all citizens complete identity and residence verification before accessing the main dashboard. This prevents unverified users from accessing sensitive relief resources while maintaining a smooth onboarding experience.

---

## System Architecture

### 1. **Verification Flow**

```
New User Registration (Signup)
         ↓
Token Stored in localStorage
         ↓
Redirect to /verification Route
         ↓
Multi-Step Verification Component
   - Step 1: Welcome Screen
   - Step 2: Upload ID Proof (IDPROOF document)
   - Step 3: Upload Residence Proof (RESIDENCE document)
   - Step 4: Pending Review Status
         ↓
Officer Reviews & Approves (Backend)
         ↓
JWT Token Updated with verificationStatus='VERIFIED'
         ↓
Access to /citizen-dashboard Granted
```

---

## Component Structure

### **VerificationComponent** (`verification.component.ts`)
**Purpose:** Multi-step document upload form for citizen verification

**Location:** `src/app/components/dashboard/citizen-dashboard/verification/verification.component.ts`

**Key Properties:**
- `currentStep`: Tracks user progress ('welcome' | 'upload-idproof' | 'upload-residence' | 'pending')
- `documentsUploaded`: Set tracking which documents have been submitted ({IDPROOF, RESIDENCE})
- `citizenId`: Extracted from JWT token
- `docType`: Current document type being uploaded
- `fileURI`: String input for external document storage URL
- `isUploading`: Boolean flag for upload state
- `uploadError/uploadSuccess`: User feedback messages

**Methods:**
```typescript
startVerification()              // Initialize verification, move to step 1
proceedToResidenceProof()       // Validate IDPROOF submitted, move to step 2
uploadDocument()                // POST to /api/documents/upload
completeVerification()          // Mark verification as complete, move to pending
goBack()                        // Navigate back with state preservation
```

**Data Model (CitizenDocumentRequestDTO):**
```typescript
interface CitizenDocumentRequestDTO {
  citizenId: string;              // User ID from JWT token
  docType: 'IDPROOF' | 'RESIDENCE'; // Document type
  fileURI: string;                // External document storage URL
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
}
```

---

### **AuthService** (Modified)
**Location:** `src/app/services/auth.service.ts`

**New Methods:**
```typescript
// Check if current user is verified
isVerified(): boolean
  → Returns: true if verificationStatus === 'VERIFIED'

// Get current verification status
getVerificationStatus(): string | null
  → Returns: 'VERIFIED' | 'PENDING' | 'REJECTED' | null

// Check if pending or rejected
isPendingVerification(): boolean
  → Returns: true if status is PENDING or REJECTED
```

**Updated Method:**
```typescript
// Original: decodeTokenAndRedirect()
// Now includes verification status check:
if (role === 'CITIZEN' && (verificationStatus === 'PENDING' || verificationStatus === 'REJECTED')) {
  this.router.navigate(['/verification']);
}
// Prevents unverified citizens from accessing dashboard
```

---

### **DisasterService** (Extended)
**Location:** `src/app/services/disaster.service.ts`

**New Method:**
```typescript
uploadCitizenDocument(documentRequest: CitizenDocumentRequestDTO): Observable<any> {
  // POST to: http://localhost:8082/api/documents/upload
  // Includes: Authorization header with JWT Bearer token
  // Body: CitizenDocumentRequestDTO object
}
```

---

### **CitizenDashboardComponent** (Updated)
**Location:** `src/app/components/dashboard/citizen-dashboard/citizen-dashboard.component.ts`

**New Properties:**
```typescript
isUserVerified: boolean;              // Controls conditional banner display
verificationStatus: string | null;    // Current verification state
```

**Updated ngOnInit():**
- Calls `authService.isVerified()` to set `isUserVerified`
- Logs verification status for debugging
- Conditionally loads dashboard data only if verified

---

### **CitizenDashboard Template** (Updated)
**Location:** `src/app/components/dashboard/citizen-dashboard/citizen-dashboard.component.html`

**New Conditional Banner:**
```html
<div *ngIf="!isUserVerified" class="verification-pending-banner">
  <div class="banner-content">
    <i class="fas fa-exclamation-triangle"></i>
    <div>
      <h3>Account Verification Required</h3>
      <p>Your account is pending verification. Please complete the document 
         verification process to unlock all features.</p>
    </div>
  </div>
  <a routerLink="/verification" class="banner-action">
    <i class="fas fa-arrow-right"></i>
    Complete Verification
  </a>
</div>
```

**Styling (CSS):**
- Orange/amber warning background gradient
- Flexbox layout with icon, text, and action button
- Responsive design (stacks on mobile < 640px)
- Hover effects with smooth transitions

---

## Routing Configuration

### **New Route**
**Location:** `src/app/app.routes.ts`

```typescript
{ 
  path: 'verification', 
  loadComponent: () => import('./components/dashboard/citizen-dashboard/verification/verification.component')
    .then(m => m.VerificationComponent),
  canActivate: [authGuard],
  data: { role: 'CITIZEN' }
}
```

**Requirements:**
- Only accessible to logged-in users (authGuard)
- Limited to CITIZEN role
- Lazy-loaded component for performance

---

## Updated Post-Registration Flow

### **SignupComponent** (Modified)
**Location:** `src/app/components/auth/signup/signup.component.ts`

**Updated handleSignup():**
```typescript
handleSignup() {
  this.authService.signup(this.userData).subscribe({
    next: (res) => {
      // Store token if provided in response
      if (res.token) {
        localStorage.setItem('token', res.token);
        // Redirect to verification instead of dashboard
        this.router.navigate(['/verification']);
      } else {
        this.router.navigate(['/login']);
      }
    },
    error: (err) => {
      alert("Signup failed. Please try again.");
    }
  });
}
```

**Flow:**
1. User completes signup form
2. Backend creates new citizen user with `verificationStatus='PENDING'`
3. JWT token returned includes `verificationStatus` field
4. Token stored in localStorage
5. User redirected to `/verification` page automatically
6. Cannot access `/citizen-dashboard` until documents verified

---

## Access Control Flow

### **Verification Status States**

| Status | Dashboard Access | Verification Page | Action |
|--------|-----------------|------------------|--------|
| VERIFIED | ✅ Yes | ❌ Redirect to dashboard | Full access |
| PENDING | ❌ No | ✅ Can upload docs | Continue verification |
| REJECTED | ❌ No | ✅ Can resubmit | Resubmit docs |
| null/Missing | ❌ No | ✅ Can start | New verification |

### **Authorization Logic**

```typescript
// In AuthService.decodeTokenAndRedirect():
const verificationStatus = payload.verificationStatus;

if (role === 'CITIZEN') {
  if (verificationStatus === 'PENDING' || verificationStatus === 'REJECTED') {
    // Prevent dashboard access, redirect to verification
    this.router.navigate(['/verification']);
  } else if (verificationStatus === 'VERIFIED') {
    // Allow dashboard access
    this.router.navigate(['/citizen-dashboard']);
  }
}
```

---

## Backend Integration Points

### **Expected Endpoints**

#### 1. **Document Upload** (Required)
```
POST /api/documents/upload
Headers: Authorization: Bearer {token}
Body: {
  citizenId: string,
  docType: 'IDPROOF' | 'RESIDENCE',
  fileURI: string,
  verificationStatus: 'PENDING'
}
Response: 
  Success: { message: "Document uploaded", documentId: string }
  Error: { error: "Upload failed" }
```

#### 2. **Verification Status Check** (Optional but Recommended)
```
GET /api/documents/verification-status/{citizenId}
Headers: Authorization: Bearer {token}
Response: {
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED',
  documents: [
    { type: 'IDPROOF', status: 'PENDING', uploadedAt: timestamp },
    { type: 'RESIDENCE', status: 'PENDING', uploadedAt: timestamp }
  ]
}
```

#### 3. **Document Approval** (Officer Dashboard)
```
PUT /api/documents/approve/{documentId}
Headers: Authorization: Bearer {token}
Body: { status: 'VERIFIED' | 'REJECTED', notes?: string }
Response: 
  Success: { message: "Document status updated" }
```

#### 4. **JWT Token Update** (Backend Requirement)
- When officer approves both IDPROOF and RESIDENCE documents
- Update citizen's JWT token to include `verificationStatus: 'VERIFIED'`
- Send new token to frontend via response
- Frontend updates localStorage and reloads

---

## Styling Details

### **Verification Pending Banner** (CSS)
**File:** `src/app/components/dashboard/citizen-dashboard/citizen-dashboard.component.css`

```css
.verification-pending-banner {
  background: linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%);
  border: 1px solid #fed7aa;
  border-radius: 12px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.1);
}

.banner-action {
  background: #d97706;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.banner-action:hover {
  background: #b45309;
  transform: translateY(-2px);
}
```

---

## Testing Checklist

### **Unit Tests** (Recommended)
- [ ] VerificationComponent initializes with correct citizenId
- [ ] uploadDocument() calls disasterService.uploadCitizenDocument()
- [ ] Step progression works correctly (welcome → idproof → residence → pending)
- [ ] documentsUploaded Set tracks both document uploads
- [ ] goBack() resets form state

### **Integration Tests**
- [ ] New signup redirects to /verification
- [ ] PENDING user cannot access /citizen-dashboard
- [ ] Banner displays correctly when !isUserVerified
- [ ] VERIFIED user can access dashboard without banner
- [ ] Verification page hidden after verification complete

### **Manual Testing**
- [ ] Create new account → Redirects to verification
- [ ] Upload IDPROOF → Progress to step 2
- [ ] Upload RESIDENCE → Move to pending status
- [ ] Token stored correctly in localStorage
- [ ] Banner shows on citizen dashboard for PENDING users
- [ ] Banner hidden for VERIFIED users
- [ ] goBack() button works on each step

---

## Environment Variables

**No additional environment variables required.**

All URLs use:
- Gateway: `http://localhost:8082`
- API Prefix: `/api`
- Documents endpoint: `/api/documents/upload`

---

## Common Issues & Solutions

### **Issue: User redirected to /verification infinitely**
**Cause:** Backend not including `verificationStatus` in JWT token
**Solution:** Ensure backend includes verificationStatus in JWT payload during signup/login

### **Issue: File URI validation fails**
**Cause:** Frontend not validating URI format
**Solution:** Add regex validation for URI format before upload:
```typescript
const uriRegex = /^https?:\/\/.+/;
if (!uriRegex.test(this.fileURI)) {
  this.uploadError = "Please enter a valid HTTP/HTTPS URI";
}
```

### **Issue: Documents not persisting after page reload**
**Cause:** documentsUploaded Set not saved to localStorage
**Solution:** Save and restore Set from localStorage:
```typescript
saveProgress() {
  localStorage.setItem('uploadedDocs', JSON.stringify(Array.from(this.documentsUploaded)));
}

restoreProgress() {
  const saved = localStorage.getItem('uploadedDocs');
  this.documentsUploaded = new Set(JSON.parse(saved || '[]'));
}
```

---

## Future Enhancements

1. **Document Upload Validation**
   - File type validation (PDF, Image only)
   - File size limits (5MB max)
   - Virus scanning integration

2. **Verification Status Polling**
   - Real-time updates on verification status
   - WebSocket integration for instant notifications

3. **Multi-Language Support**
   - Translate verification form to regional languages
   - Localized document requirements

4. **Admin Dashboard**
   - Officer dashboard for reviewing documents
   - Batch approval/rejection interface
   - Audit logs for all verification actions

5. **Mobile Optimization**
   - Camera integration for direct photo upload
   - Mobile-specific document capture flow

---

## Support & Documentation

For questions or issues:
1. Check the testing checklist above
2. Verify backend JWT token includes verificationStatus
3. Ensure all required endpoints are implemented
4. Review the "Common Issues & Solutions" section
5. Check browser console for detailed error messages

---

**Last Updated:** 2024
**System Version:** 1.0
**Status:** Production Ready
