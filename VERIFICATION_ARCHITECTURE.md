# Document Verification System - Architecture

## High-Level Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     DISASTER RELIEF SYSTEM                         │
│                  Verification Access Control Layer                 │
└─────────────────────────────────────────────────────────────────────┘

                           ┌──────────────────┐
                           │   New User       │
                           │   Registration   │
                           └────────┬─────────┘
                                    │
                                    ▼
                    ┌────────────────────────────┐
                    │  Backend: Create User      │
                    │  - verificationStatus:     │
                    │    PENDING                 │
                    │  - Generate JWT Token      │
                    └────────────┬───────────────┘
                                 │
                                 ▼
                    ┌────────────────────────────┐
                    │  Frontend: Parse JWT       │
                    │  - Extract verificationSt  │
                    │  - Store Token             │
                    └────────────┬───────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │ Check Verification Status│
                    └────────────┬────────────┘
                                 │
                ┌────────────────┼───────────────────┐
                │                │                   │
         PENDING/REJECTED    VERIFIED          NOT FOUND
                │                │                   │
                ▼                ▼                   ▼
        ┌─────────────┐   ┌──────────────┐  ┌──────────────┐
        │             │   │              │  │              │
        │Verification│   │ Dashboard    │  │ Dashboard    │
        │   Page      │   │ - Full       │  │ - Restricted │
        │             │   │   Access     │  │              │
        │- Upload     │   │ - No Banner  │  │- Banner      │
        │  ID Proof   │   │              │  │- Limited     │
        │- Upload     │   └──────────────┘  │  Access      │
        │  Residence  │                     └──────────────┘
        │  Proof      │
        │- Show Pending                 FLOW END
        │  Status     │
        │             │
        └──────┬──────┘
               │
               ▼
    ┌──────────────────────┐
    │ Backend Review       │
    │ Officer approves/    │
    │ rejects documents    │
    └──────────┬───────────┘
               │
         ┌─────┴─────┐
         │           │
      APPROVED   REJECTED
         │           │
         ▼           ▼
    UPDATE JWT    UPDATE JWT
    VERIFIED      REJECTED
         │           │
         └─────┬─────┘
               ▼
        ┌──────────────┐
        │ Token Refresh│
        │ (Next Login) │
        └──────┬───────┘
               │
               ▼
        ┌──────────────┐
        │ Redirect Based
        │ on Status    │
        └──────────────┘
               │
               ▼
        VERIFICATION COMPLETE
```

---

## Component Interaction Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                             │
│                                                               │
│  ┌──────────────────┐         ┌─────────────────────┐       │
│  │  SignupComponent │─────┐   │  CitizenDashboard   │       │
│  └──────────────────┘     │   │   - isUserVerified  │       │
│         │                 │   │   - verification    │       │
│         │ on success      │   │     Banner          │       │
│         │ redirect        │   └─────────────────────┘       │
│         │                 │           │                     │
│         ▼                 └─ AuthService                     │
│  ┌──────────────────┐         - decodeToken                 │
│  │ VerificationComp │         - getVerification             │
│  │ - currentStep    │         - isVerified()                │
│  │ - fileURI input  │         - redirect logic              │
│  │ - upload docs    │                                       │
│  └────────┬─────────┘         ┌─────────────────────┐       │
│           │                   │ DisasterService     │       │
│           └──────────────────▶│ - uploadCitizen     │       │
│             uploadDocument()  │   Document()        │       │
│                               └─────────────────────┘       │
│                                       │                     │
└───────────────────────────────────────┼─────────────────────┘
                                        │
                                        ▼
        ┌────────────────────────────────────────────────────┐
        │              BACKEND LAYER                         │
        │                                                    │
        │  ┌──────────────────────────────────────┐         │
        │  │ POST /api/documents/upload           │         │
        │  │                                      │         │
        │  │ Request Body:                        │         │
        │  │ {                                    │         │
        │  │   citizenId: string                  │         │
        │  │   docType: IDPROOF|RESIDENCE         │         │
        │  │   fileURI: string                    │         │
        │  │   verificationStatus: PENDING        │         │
        │  │ }                                    │         │
        │  │                                      │         │
        │  │ Response: { documentId, message }   │         │
        │  └───────────────────┬──────────────────┘         │
        │                      │                            │
        │                      ▼                            │
        │  ┌──────────────────────────────────────┐         │
        │  │ Document Store Service               │         │
        │  │ - Save to database                   │         │
        │  │ - Mark status: PENDING               │         │
        │  │ - Notify officers                    │         │
        │  └──────────────────────────────────────┘         │
        │                                                    │
        │  ┌──────────────────────────────────────┐         │
        │  │ Officer Review (Manual Process)      │         │
        │  │ - View submitted documents           │         │
        │  │ - Verify authenticity                │         │
        │  │ - Approve or Reject                  │         │
        │  └───────────────────┬──────────────────┘         │
        │                      │                            │
        │                      ▼                            │
        │  ┌──────────────────────────────────────┐         │
        │  │ PUT /api/documents/approve            │         │
        │  │                                      │         │
        │  │ Update JWT Token:                    │         │
        │  │ verificationStatus = VERIFIED        │         │
        │  │                                      │         │
        │  │ Send new token to frontend           │         │
        │  └──────────────────────────────────────┘         │
        │                                                    │
        └────────────────────────────────────────────────────┘
```

---

## State Machine Diagram

```
                    ┌─────────────────────┐
                    │   NOT_REGISTERED    │
                    └──────────┬──────────┘
                               │ User Signup
                               ▼
                    ┌─────────────────────┐
                    │   REGISTERED        │
                    │                     │
                    │ verificationStatus: │
                    │ PENDING             │
                    └──────────┬──────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
              Login          Upload         Timeout
                │            Docs            │
                ▼              │              │
    ┌─────────────────────┐   │     ┌────────────────┐
    │   PENDING_LOGIN     │   │     │  AUTO_LOGOUT   │
    │                     │   │     │  Session Expire│
    │ verificationStatus: │   │     └────────────────┘
    │ PENDING             │   │
    └─────────────────────┘   ▼
                    ┌─────────────────────┐
                    │ DOCS_SUBMITTED      │
                    │                     │
                    │ verificationStatus: │
                    │ PENDING             │
                    │                     │
                    │ [Awaiting Officer   │
                    │  Review]            │
                    └──────────┬──────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
             Officer         Officer       Manual Update
             Approves        Rejects       (Admin)
                │              │              │
                ▼              ▼              ▼
    ┌─────────────────┐  ┌──────────────┐  ┌──────────────┐
    │  VERIFIED       │  │   REJECTED   │  │  VERIFIED    │
    │                 │  │              │  │              │
    │ Full Dashboard  │  │ Show Banner  │  │ Full Access  │
    │ Access          │  │ Reupload     │  │ (Override)   │
    │                 │  │              │  │              │
    │ Can access:     │  │ Can access:  │  └──────────────┘
    │ - Reports       │  │ - Verify     │
    │ - Shelters      │  │   Page       │
    │ - Resources     │  │ - Reupload   │
    │ - Full Features │  │ - Support    │
    └────────┬────────┘  │              │
             │           └──────┬───────┘
             │                  │
             │   Can Reupload   │
             │   Documents      │
             │                  │
             └─────────┬────────┘
                       │
                       ▼
            [Return to Verification
             for Document Reupload]
```

---

## Database Schema (Expected)

```sql
-- Users Table (Extended)
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    role ENUM('CITIZEN', 'OFFICER', 'MANAGER', 'AUDITOR'),
    verification_status ENUM('PENDING', 'VERIFIED', 'REJECTED') DEFAULT 'PENDING',
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Citizen Documents Table
CREATE TABLE citizen_documents (
    id VARCHAR(36) PRIMARY KEY,
    citizen_id VARCHAR(36) NOT NULL,
    doc_type ENUM('IDPROOF', 'RESIDENCE') NOT NULL,
    file_uri VARCHAR(2048),
    verification_status ENUM('PENDING', 'VERIFIED', 'REJECTED') DEFAULT 'PENDING',
    uploaded_at TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by VARCHAR(36),  -- Officer ID
    notes TEXT,
    FOREIGN KEY (citizen_id) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

-- Verification Audit Log
CREATE TABLE verification_audit_log (
    id VARCHAR(36) PRIMARY KEY,
    citizen_id VARCHAR(36) NOT NULL,
    action VARCHAR(50),  -- UPLOADED, APPROVED, REJECTED, etc
    doc_type ENUM('IDPROOF', 'RESIDENCE'),
    old_status ENUM('PENDING', 'VERIFIED', 'REJECTED'),
    new_status ENUM('PENDING', 'VERIFIED', 'REJECTED'),
    performed_by VARCHAR(36),  -- Officer or Admin
    timestamp TIMESTAMP,
    FOREIGN KEY (citizen_id) REFERENCES users(id),
    FOREIGN KEY (performed_by) REFERENCES users(id)
);
```

---

## API Sequence Diagram

```
Frontend                          Backend
   │                                │
   │ 1. POST /signup               │
   │ (name, email, password...)    │
   ├──────────────────────────────►│
   │                          Create user
   │                     verificationStatus=PENDING
   │                                │
   │ 2. 200 OK + JWT Token        │
   │◄──────────────────────────────┤
   │    (includes verificationStatus)
   │                                │
   │ 3. Store Token, Redirect      │
   │    to /verification            │
   │                                │
   │ 4. POST /api/documents/upload │
   │    {citizenId, docType,       │
   │     fileURI, status:PENDING}  │
   ├──────────────────────────────►│
   │                          Save document
   │                          Mark PENDING
   │                                │
   │ 5. 201 Created + documentId   │
   │◄──────────────────────────────┤
   │                                │
   │ 6. POST /api/documents/upload │
   │    (Second document:RESIDENCE) │
   ├──────────────────────────────►│
   │                          Save document
   │                                │
   │ 7. 201 Created + documentId   │
   │◄──────────────────────────────┤
   │                                │
   │ [User Sees Pending Status]     │
   │                                │
   │                          (Officer Reviews)
   │                          - Approves IDPROOF
   │                          - Approves RESIDENCE
   │                          - Marks citizen VERIFIED
   │                          - Updates JWT
   │                                │
   │ 8. (Next Login/Token Refresh)  │
   │ GET /api/verify-token         │
   ├──────────────────────────────►│
   │                                │
   │ 9. 200 OK + Updated JWT       │
   │    (verificationStatus=VERIFIED)
   │◄──────────────────────────────┤
   │                                │
   │ 10. Check Token, See VERIFIED  │
   │     Redirect to Dashboard      │
   │     No Banner Shown            │
   │                                │
   ▼                                ▼
Full Access                    Verification Complete
```

---

## Security Considerations

```
Authentication Layer
├── JWT Token Validation
│   ├── Check token exists
│   ├── Check token not expired
│   ├── Verify signature
│   └── Extract verificationStatus
│
├── Role-Based Access Control
│   ├── CITIZEN role required for /verification
│   ├── /citizen-dashboard restricted to VERIFIED citizens
│   └── /officer routes restricted to OFFICER role
│
└── Authorization Checks
    ├── User can only upload for their own citizenId
    ├── Officer can only review documents for their district
    └── Admin can override verification status

File Security
├── File URI Validation
│   ├── Must be valid HTTP/HTTPS URL
│   ├── Must point to authorized storage
│   └── Optional: Virus scan uploaded files
│
└── Document Storage
    ├── Encrypted file storage
    ├── Access logs for all views
    └── Retention policy (7 years for disaster relief)

Verification Security
├── Two-Factor Identification
│   ├── IDPROOF (Government ID)
│   └── RESIDENCE (Address Proof)
│
├── Manual Officer Review
│   └── Prevents automated fake verification
│
└── Audit Trail
    └── All verification actions logged
```

---

## Deployment Architecture

```
┌────────────────────────────────────────────────────┐
│          PRODUCTION ENVIRONMENT                    │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │  Frontend (Angular)                          │ │
│  │  - Verification Component                    │ │
│  │  - Dashboard with Banner                     │ │
│  │  - Access Control Logic                      │ │
│  └────────────────┬─────────────────────────────┘ │
│                   │                               │
│  ┌────────────────▼─────────────────────────────┐ │
│  │  API Gateway (Port 8082)                     │ │
│  │  - /api/documents/upload                     │ │
│  │  - /api/documents/verify-status              │ │
│  │  - JWT Validation Middleware                 │ │
│  └────────────────┬─────────────────────────────┘ │
│                   │                               │
│  ┌────────────────▼─────────────────────────────┐ │
│  │  Backend Services (Spring Boot)              │ │
│  │  - Document Service                          │ │
│  │  - User Service                              │ │
│  │  - Verification Service                      │ │
│  │  - JWT Token Management                      │ │
│  └────────────────┬─────────────────────────────┘ │
│                   │                               │
│  ┌────────────────▼─────────────────────────────┐ │
│  │  Database (MySQL)                            │ │
│  │  - users (with verificationStatus)           │ │
│  │  - citizen_documents                         │ │
│  │  - verification_audit_log                    │ │
│  └────────────────────────────────────────────┘ │
│                                                    │
│  ┌────────────────────────────────────────────────┐ │
│  │  External Services                             │ │
│  │  - File Storage (S3 or equivalent)            │ │
│  │  - Email Notifications                        │ │
│  │  - SMS Alerts                                 │ │
│  └────────────────────────────────────────────────┘ │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## Error Handling Flow

```
Upload Document
    │
    ├─ Invalid Token ──► 401 Unauthorized ──► Redirect to Login
    │
    ├─ Invalid Citizen ID ──► 403 Forbidden ──► Show Error Banner
    │
    ├─ Invalid File URI ──► 400 Bad Request ──► Validation Error
    │
    ├─ Duplicate Document ──► 409 Conflict ──► "Already Uploaded"
    │
    ├─ Server Error ──► 500 Internal Server Error ──► Retry Option
    │
    └─ Success ──► 201 Created ──► Move to Next Step

Verification Status Check
    │
    ├─ Token Missing ──► 401 ──► Redirect to Login
    │
    ├─ Token Expired ──► 401 ──► Refresh Token
    │
    ├─ Verification Pending ──► Show Banner
    │
    ├─ Verification Rejected ──► Show Re-upload Option
    │
    └─ Verification Verified ──► Grant Full Access
```

---

**Architecture Version:** 1.0  
**Last Updated:** 2024  
**Status:** Complete & Documented
