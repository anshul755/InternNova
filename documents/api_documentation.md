# InternNova Full API Documentation

This document serves as a complete reference for all API routes available in the InternNova project, including Authentication, Profiles (Talent/Company), Jobs, Applications, and AI Pipeline endpoints. It defines the HTTP methods, routes, descriptions, expected inputs, and expected outputs.

## Base URL

* **API Gateway (Unified Entrance)**: `http://localhost:4000`
* *All client-facing requests must go through the API Gateway.*

---

## Route Summary Tables

### 1. Authentication Routes (`/auth/v1`)

| Method | Route                  | Description                        | Middleware | Auth Req |
| :----- | :--------------------- | :--------------------------------- | :--------- | :------: |
| `POST` | `/register`            | Register a new user                | generalLimiter, validateRegister |    ❌    |
| `POST` | `/verify-email`        | Verify email with OTP code         | otpLimiter, validateVerifyEmail |    ❌    |
| `POST` | `/resend-otp`          | Resend registration/reset OTP      | otpLimiter, validateResendOTP |    ❌    |
| `POST` | `/login`               | Login user and receive cookies     | loginLimiter, validateLogin |    ❌    |
| `POST` | `/refresh`             | Refresh access and refresh tokens  | generalLimiter |    ❌    |
| `POST` | `/logout`              | Logout user and clear cookies      | authenticate |    ✅    |
| `GET`  | `/me`                  | Get current logged-in user details | authenticate |    ✅    |
| `POST` | `/forgot-password`     | Request password reset OTP         | otpLimiter, validateForgotPassword |    ❌    |
| `POST` | `/verify-reset-otp`    | Verify reset OTP and get sessionID | otpLimiter, validateVerifyResetOTP |    ❌    |
| `POST` | `/reset-password`      | Reset password using session ID    | generalLimiter, validateResetPassword |    ❌    |
| `POST` | `/request-delete`      | Request profile deletion OTP       | authenticate |    ✅    |
| `DELETE` | `/delete`            | Confirm account & profile delete   | authenticate |    ✅    |

### 2. Talent Profile Routes (`/talent/v1`)

| Method   | Route                              | Description                        | Auth Req |
| :------- | :--------------------------------- | :--------------------------------- | :------: |
| `POST`   | `/`                                | Create talent profile (Multipart)  |    ✅    |
| `GET`    | `/:id`                             | Get talent profile metadata        |    ❌    |
| `PUT`    | `/:id`                             | Update profile details (Multipart) |    ✅ (owner)    |
| `DELETE` | `/:id`                             | Soft-delete talent profile         |    ✅ (owner)    |
| `GET`    | `/:id/saved-jobs`                  | List saved jobs for talent         |    ❌    |
| `POST`   | `/:id/saved-jobs/:jobId`           | Bookmark/Save a job                |    ✅ (owner)    |
| `DELETE` | `/:id/saved-jobs/:jobId`           | Remove job from saved list         |    ✅ (owner)    |
| `POST`   | `/experience`                      | Add work experience embed          |    ✅    |
| `PUT`    | `/experience/:index`               | Update work experience by index    |    ✅    |
| `DELETE` | `/experience/:index`               | Delete work experience by index    |    ✅    |
| `POST`   | `/projects`                        | Add project embed                  |    ✅    |
| `POST`   | `/certifications`                  | Add certification embed            |    ✅    |
| `POST`   | `/achievements`                    | Add achievement embed              |    ✅    |
| `GET`    | `/profile/:id/full`                | Get full profile (internal)        |    ✅ (internal/owner)    |
| `POST`   | `/resume`                          | Generate tailored AI PDF resume    |    ✅    |

### 3. Company Profile Routes (`/company/v1`)

| Method   | Route      | Description                        | Auth Req |
| :------- | :--------- | :--------------------------------- | :------: |
| `POST`   | `/`        | Create company profile (Multipart) |    ✅    |
| `GET`    | `/`        | List all active companies          |    ❌    |
| `GET`    | `/:id`     | Get company profile details        |    ❌    |
| `PUT`    | `/:id`     | Update company details (Multipart) |    ✅ (owner)    |
| `DELETE` | `/:id`     | Soft-delete company profile        |    ✅ (owner)    |

### 4. Jobs Routes (`/jobs/v1`)

| Method   | Route                       | Description                        | Auth Req |
| :------- | :-------------------------- | :--------------------------------- | :------: |
| `POST`   | `/`                         | Create a new job posting           |    ✅    |
| `GET`    | `/`                         | List and search active jobs        |    ❌    |
| `GET`    | `/:id`                      | Get job details (increments views) |    ❌    |
| `PUT`    | `/:id`                      | Update job posting                 |    ✅ (owner)    |
| `DELETE` | `/:id`                      | Soft-delete job posting            |    ✅ (owner)    |
| `GET`    | `/company/:companyId`       | Get jobs posted by a company       |    ❌    |
| `POST`   | `/:id/publish-results`      | Close job & publish outcomes       |    ✅ (owner)    |

### 5. Application Routes (`/applications/v1`)

| Method   | Route                       | Description                        | Auth Req |
| :------- | :-------------------------- | :--------------------------------- | :------: |
| `POST`   | `/`                         | Submit application & evaluate (AI) |    ✅    |
| `GET`    | `/job/:jobId`               | List applications for a job        |    ✅    |
| `GET`    | `/student/:studentId`       | List applications sent by student  |    ✅ (owner)    |
| `GET`    | `/:id`                      | Get application details            |    ✅    |
| `PUT`    | `/:id/shortlist`            | Mark application as Shortlisted    |    ✅ (recruiter)    |
| `PUT`    | `/:id/reject`               | Mark application as Rejected       |    ✅ (recruiter)    |
| `PUT`    | `/:id/status`               | Arbitrarily update status          |    ✅    |
| `PUT`    | `/:id/withdraw`             | Candidate withdraws application    |    ✅ (student owner)    |
| `DELETE` | `/:id`                      | Soft-delete application            |    ✅    |
| `GET`    | `/stats/job/:jobId`         | Get applicant statistics for a job |    ✅ (recruiter)    |
| `GET`    | `/stats/student/:studentId` | Get stats for a student's apps     |    ✅ (student owner)    |

### 6. Health & Infrastructure (`/pipeline/v1` & `/`)

| Method | Route          | Description                        | Auth Req |
| :----- | :------------- | :--------------------------------- | :------: |
| `GET`  | `/health`      | Gateway health status              |    ❌    |
| `POST` | `/evaluate`    | AI evaluation (internal FastAPI)   | ❌ (internal) |
| `POST` | `/generate-resume` | AI LaTeX resume (internal FastAPI) | ❌ (internal) |

---

## Detailed Route Information

### 1. Authentication Routes

#### POST `/auth/v1/register`

**Description:** Register a new user
**Auth Required:** No
**Request Body (JSON):**

```json
{
  "email": "candidate@university.edu",
  "password": "SecureP@ss123",
  "role": "Talent"
}
```

**Response (201 Created):**

```json
{
  "userId": "60d5ecb8b48f2c001f8d4231",
  "email": "candidate@university.edu",
  "role": "Talent"
}
```

#### POST `/auth/v1/verify-email`

**Description:** Verify email with the 6-digit OTP code sent during registration
**Auth Required:** No
**Request Body (JSON):**

```json
{
  "email": "candidate@university.edu",
  "otp": "123456"
}
```

**Response (200 OK):**

```json
{
  "userId": "60d5ecb8b48f2c001f8d4231",
  "role": "Talent"
}
```

#### POST `/auth/v1/resend-otp`

**Description:** Resend verification or password-reset OTP
**Auth Required:** No
**Request Body (JSON):**

```json
{
  "email": "candidate@university.edu",
  "type": "EMAIL_VERIFICATION"
}
```

**Response (200 OK):**

```json
{
  "message": "OTP sent successfully"
}
```

#### POST `/auth/v1/login`

**Description:** Authenticate user and receive access and refresh cookies
**Auth Required:** No
**Request Body (JSON):**

```json
{
  "email": "candidate@university.edu",
  "password": "SecureP@ss123"
}
```

**Response (200 OK):**

*Note: Returns accessToken and refreshToken via `Set-Cookie` headers.*

```json
{
  "userId": "60d5ecb8b48f2c001f8d4231",
  "email": "candidate@university.edu",
  "role": "Talent"
}
```

#### POST `/auth/v1/refresh`

**Description:** Exchange a valid refresh token cookie for new access and refresh cookies
**Auth Required:** No (Implicit via Cookie)
**Response (200 OK):**

*Note: Access and refresh tokens are reset in the cookies.*

```json
{
  "status": "success"
}
```

#### POST `/auth/v1/logout`

**Description:** Invalidate refresh tokens and clear authentication cookies
**Auth Required:** Yes
**Response (200 OK):**

```json
{
  "message": "Logged out successfully"
}
```

#### GET `/auth/v1/me`

**Description:** Fetch active authenticated user details
**Auth Required:** Yes
**Response (200 OK):**

```json
{
  "_id": "60d5ecb8b48f2c001f8d4231",
  "email": "candidate@university.edu",
  "role": "Talent",
  "isEmailVerified": true,
  "isActive": true
}
```

#### POST `/auth/v1/forgot-password`

**Description:** Request a password recovery OTP to email
**Auth Required:** No
**Request Body (JSON):**

```json
{
  "email": "candidate@university.edu"
}
```

**Response (200 OK):**

```json
{
  "message": "If an account exists, OTP sent."
}
```

#### POST `/auth/v1/verify-reset-otp`

**Description:** Validate reset OTP and retrieve recovery session ID
**Auth Required:** No
**Request Body (JSON):**

```json
{
  "email": "candidate@university.edu",
  "otp": "654321"
}
```

**Response (200 OK):**

```json
{
  "resetSessionId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"
}
```

#### POST `/auth/v1/reset-password`

**Description:** Save new password using the validated recovery session ID
**Auth Required:** No
**Request Body (JSON):**

```json
{
  "email": "candidate@university.edu",
  "resetSessionId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "newPassword": "NewSecurePassword123!"
}
```

**Response (200 OK):**

```json
{
  "message": "Password reset. Please log in."
}
```

#### POST `/auth/v1/request-delete`

**Description:** Request profile deletion OTP sent to the user's email
**Auth Required:** Yes
**Response (200 OK):**

```json
{
  "message": "Deletion OTP sent successfully"
}
```

#### DELETE `/auth/v1/delete`

**Description:** Confirm account and profile deletion using the deletion OTP
**Auth Required:** Yes
**Request Body (JSON):**

```json
{
  "otp": "123456"
}
```

**Response (200 OK):**

```json
{
  "message": "Account and profiles deleted successfully"
}
```

---

### 2. Talent Profile Routes

#### POST `/talent/v1`

**Description:** Create talent profile with resume and avatar files
**Auth Required:** Yes
**Headers:** `Content-Type: multipart/form-data`
**Body Form-Data:**

- `name` (Text, required): Full Name
- `university` (Text, required): University name
- `major` (Text, required): Fields of study
- `graduationYear` (Text, required): Year of graduation
- `cgpa` (Number, required): Grade Point Average
- `skills` (Array or comma-separated string): Skills list
- `bio` (Text): Short description
- `location` (Text): City name
- `resume` (File): PDF CV file
- `avatar` (File): Image file
  **Response (201 Created):**

```json
{
  "id": "60d5ecb8b48f2c001f8d4231",
  "name": "Jane Doe",
  "university": "State University",
  "major": "Computer Science",
  "cgpa": 3.8,
  "skills": ["Java", "React"],
  "resumeUrl": "https://res.cloudinary.com/...",
  "avatarUrl": "https://res.cloudinary.com/..."
}
```

#### GET `/talent/v1/:id`

**Description:** Read candidate profile details (excludes raw application metrics)
**Auth Required:** No
**Response (200 OK):**

```json
{
  "id": "60d5ecb8b48f2c001f8d4231",
  "name": "Jane Doe",
  "university": "State University",
  "major": "Computer Science",
  "cgpa": 3.8,
  "skills": ["Java", "React"]
}
```

#### PUT `/talent/v1/:id`

**Description:** Update candidate profile fields and upload new assets
**Auth Required:** Yes
**Headers:** `Content-Type: multipart/form-data`
**Body Form-Data:** *(All fields optional)*

- `name`, `university`, `major`, `cgpa`, `skills`, `bio`, `location`
- `resume` (File)
- `avatar` (File)
  **Response (200 OK):**

```json
{
  "id": "60d5ecb8b48f2c001f8d4231",
  "name": "Jane Doe (Updated)",
  "skills": ["Java", "React", "Spring Boot"]
}
```

#### DELETE `/talent/v1/:id`

**Description:** Soft-delete talent profile
**Auth Required:** Yes
**Response (200 OK):**

```json
{
  "message": "Talent profile soft-deleted successfully"
}
```

#### GET `/talent/v1/:id/saved-jobs`

**Description:** Retrieve active bookmarked jobs for the user
**Auth Required:** No
**Response (200 OK):**

```json
[
  {
    "id": "70d5ecb8b48f2c001f8d4999",
    "title": "Software Engineer Intern",
    "location": "San Francisco, CA",
    "status": "ACTIVE"
  }
]
```

#### POST `/talent/v1/:id/saved-jobs/:jobId`

**Description:** Bookmark a job posting
**Auth Required:** Yes
**Response (200 OK):**

```json
{
  "message": "Job bookmarked successfully"
}
```

#### DELETE `/talent/v1/:id/saved-jobs/:jobId`

**Description:** Remove job from bookmarks
**Auth Required:** Yes
**Response (200 OK):**

```json
{
  "message": "Job removed from bookmarks"
}
```

#### POST `/talent/v1/experience`

**Description:** Append a new work experience item to the profile array
**Auth Required:** Yes
**Request Body (JSON):**

```json
{
  "company": "Google",
  "role": "Software Engineer Intern",
  "location": "Mountain View, CA",
  "startDate": "2025-05",
  "endDate": "2025-08",
  "isCurrent": false,
  "bulletPoints": [
    "Optimized query pipelines.",
    "Wrote automation scripts."
  ]
}
```

**Response (200 OK):**

```json
{
  "message": "Work experience added successfully"
}
```

#### PUT `/talent/v1/experience/:index`

**Description:** Update work experience item at index position
**Auth Required:** Yes
**Request Body (JSON):**

```json
{
  "role": "Senior Software Intern",
  "isCurrent": true
}
```

**Response (200 OK):**

```json
{
  "message": "Work experience updated successfully"
}
```

#### DELETE `/talent/v1/experience/:index`

**Description:** Remove work experience item at index position
**Auth Required:** Yes
**Response (200 OK):**

```json
{
  "message": "Work experience deleted successfully"
}
```

#### POST `/talent/v1/projects`

**Description:** Append a project detail block
**Auth Required:** Yes
**Request Body (JSON):**

```json
{
  "name": "InternNova Portal",
  "description": "AI Recruitment platform",
  "techStack": ["React", "FastAPI", "Spring Boot"],
  "liveUrl": "https://internnova.dev",
  "repoUrl": "https://github.com/internnova",
  "highlights": ["Designed Gateway server", "Structured databases"]
}
```

**Response (200 OK):**

```json
{
  "message": "Project added successfully"
}
```

#### GET `/talent/v1/profile/:id/full`

**Description:** Fetch full talent profile details including experience and projects
**Auth Required:** Yes (Or internal service token validation)
**Response (200 OK):**

```json
{
  "id": "60d5ecb8b48f2c001f8d4231",
  "name": "Jane Doe",
  "experiences": [ ... ],
  "projects": [ ... ],
  "certifications": [ ... ],
  "achievements": [ ... ]
}
```

#### POST `/talent/v1/resume`

**Description:** Generate customized AI resume tailoring
**Auth Required:** Yes
**Request Body (JSON):**

```json
{
  "template": "classic",
  "email": "tailored@domain.com",
  "phone": "+15550199",
  "jobTitle": "React Developer",
  "jobDescription": "Build state management components in React."
}
```

**Response (200 OK):**

```json
{
  "tex": "\\documentclass{article} ... \\end{document}",
  "pdfBase64": "JVBERi0xLjQKJ..."
}
```

---

### 3. Company Profile Routes

#### POST `/company/v1`

**Description:** Setup recruiter business details
**Auth Required:** Yes
**Headers:** `Content-Type: multipart/form-data`
**Body Form-Data:**

- `companyName` (Text, required)
- `companySize` (Text, required)
- `companyDescription` (Text, required)
- `foundedYear` (Number)
- `companyType` (Text)
- `websiteUrl` (Text)
- `logo` (File): Image file
  **Response (201 Created):**

```json
{
  "id": "60d5ecb8b48f2c001f8d4231",
  "companyName": "Tech Giants Corp",
  "logoUrl": "https://res.cloudinary.com/..."
}
```

#### GET `/company/v1`

**Description:** Retrieve all active company pages
**Auth Required:** No
**Response (200 OK):**

```json
[
  {
    "id": "60d5ecb8b48f2c001f8d4231",
    "companyName": "Tech Giants Corp"
  }
]
```

---

### 4. Jobs Routes

#### POST `/jobs/v1`

**Description:** Post a new job opportunity
**Auth Required:** Yes (Owner matching Company profile)
**Request Body (JSON):**

```json
{
  "title": "Backend developer",
  "description": "Maintain Spring Boot applications.",
  "requirements": "Java 17, MongoDB, Microservices",
  "responsibilities": "Optimize DB queries, write APIs",
  "skillsRequired": ["Java", "MongoDB"],
  "location": "Remote",
  "remoteOption": true,
  "salaryMin": 50000.0,
  "salaryMax": 75000.0,
  "jobType": "FULL_TIME",
  "duration": "Indefinite",
  "applicationDeadline": "2026-08-30",
  "selectionCriteria": "Needs experience with Spring Boot query optimization"
}
```

**Response (201 Created):**

```json
{
  "id": "70d5ecb8b48f2c001f8d4999",
  "title": "Backend developer",
  "status": "ACTIVE",
  "applicationsCount": 0
}
```

#### GET `/jobs/v1`

**Description:** Query and search active job listings
**Auth Required:** No
**Query Parameters:**

- `page` (Optional, default 0)
- `size` (Optional, default 10)
- `keyword` (Optional)
- `location` (Optional)
- `jobType` (Optional)
  **Response (200 OK):**

```json
{
  "content": [
    {
      "id": "70d5ecb8b48f2c001f8d4999",
      "title": "Backend developer",
      "location": "Remote",
      "status": "ACTIVE"
    }
  ],
  "totalPages": 1,
  "totalElements": 1
}
```

#### POST `/jobs/v1/:id/publish-results`

**Description:** Close job board applications and email final status updates to applicants
**Auth Required:** Yes
**Response (200 OK):**

```json
{
  "id": "70d5ecb8b48f2c001f8d4999",
  "resultsPublished": true,
  "status": "CLOSED"
}
```

---

### 5. Application Routes

#### POST `/applications/v1`

**Description:** Apply for a job. Triggers synchronous AI evaluations.
**Auth Required:** Yes
**Headers:** `Content-Type: multipart/form-data` or `application/json`
**Body Form-Data / JSON:**

- `jobId` (Text, required): Job ID
- `studentId` (Text, required): Candidate user ID
- `motivationStatement` (Text): Motive description
- `resumeFile` (File, optional): Specific PDF resume upload
- `resumeUrl` (Text, optional): Fallback Cloudinary link URL
  **Response (200 OK):**

```json
{
  "id": "80d5ecb8b48f2c001f8d4888",
  "jobId": "70d5ecb8b48f2c001f8d4999",
  "studentId": "60d5ecb8b48f2c001f8d4231",
  "status": "SHORTLISTED",
  "aiMatchScore": 88.5,
  "recruiterNotes": "Candidate exhibits strong Java skills matching Spring Boot criteria. Verified genuine timeline.",
  "appliedAt": "2026-06-19T13:03:00Z"
}
```

#### GET `/applications/v1/job/:jobId`

**Description:** Retrieve all applications submitted for a specific job
**Auth Required:** Yes
**Response (200 OK):**

```json
[
  {
    "id": "80d5ecb8b48f2c001f8d4888",
    "studentId": "60d5ecb8b48f2c001f8d4231",
    "aiMatchScore": 88.5,
    "status": "SHORTLISTED"
  }
]
```

#### PUT `/applications/v1/:id/shortlist`

**Description:** Mark candidate application status as Shortlisted
**Auth Required:** Yes
**Response (200 OK):**

```json
{
  "id": "80d5ecb8b48f2c001f8d4888",
  "status": "SHORTLISTED"
}
```

#### PUT `/applications/v1/:id/reject`

**Description:** Mark candidate application status as Rejected
**Auth Required:** Yes
**Request Body (JSON):**

```json
{
  "notes": "Lacks required MongoDB experience."
}
```

**Response (200 OK):**

```json
{
  "id": "80d5ecb8b48f2c001f8d4888",
  "status": "REJECTED",
  "recruiterNotes": "Lacks required MongoDB experience."
}
```

#### PUT `/applications/v1/:id/withdraw`

**Description:** Cancel submitted application (candidate action)
**Auth Required:** Yes
**Response (200 OK):**

```json
{
  "message": "Application withdrawn successfully"
}
```

---

### 6. Health & Operations

#### GET `/health`

**Description:** API Gateway health status
**Auth Required:** No
**Response (200 OK):**

```json
{
  "status": "UP",
  "services": {
    "auth-service": "UP",
    "core-service": "UP",
    "ai-service": "UP"
  }
}
```

---

## Error Responses

When verification checks fail, validation schemas miss parameters, or backend failures trigger exceptions, the endpoints respond with standard format blocks:

### 400 - Bad Request

```json
{
  "error": "Bad Request",
  "message": "Required request parameter [name] is not present"
}
```

### 401 - Unauthorized

```json
{
  "error": "Unauthorized",
  "message": "Full authentication is required to access this resource"
}
```

### 403 - Forbidden

```json
{
  "error": "Forbidden",
  "message": "Access is denied"
}
```

### 404 - Not Found

```json
{
  "error": "Not Found",
  "message": "Resource not found for the given ID"
}
```

### 409 - Conflict

```json
{
  "error": "Conflict",
  "message": "Application already exists for this job"
}
```

### 500 - Server Error

```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred during processing"
}
```
