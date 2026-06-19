# User Stories & Acceptance Criteria

This document lists the core User Stories for **InternNova**, detailed with explicit Acceptance Criteria, grouped by User Roles (Talent, Company, System/Admin).

---

## 1. Authentication & Account Management

### US-1.1: User Registration
* **User Story**: As a new visitor, I want to create an account with my email, password, and chosen role (Talent or Company), so that I can access personalized portal features.
* **Acceptance Criteria**:
  - The email must be validated (RFC 5322 format) and unique.
  - The password must meet security requirements (e.g., minimum 8 characters, at least one number, one special character).
  - The account status must be set to `isEmailVerified: false` and `isActive: false` upon creation.
  - The system must immediately dispatch a 6-digit OTP verification code to the registered email address.

### US-1.2: Email OTP Verification
* **User Story**: As a registered user, I want to verify my email using the OTP sent to me, so that I can activate my account and log in.
* **Acceptance Criteria**:
  - Entering the correct OTP within 10 minutes must set `isEmailVerified: true` and `isActive: true`.
  - The system must delete the OTP record upon successful verification.
  - Entering an expired OTP must return a `400 Bad Request` error and delete the OTP.
  - Entering incorrect OTPs 3 times must exhaust the OTP record and lock verification for that session.

### US-1.3: User Login & Session JWTs
* **User Story**: As an active user, I want to log in using my email and password, so that I can securely interact with the platform.
* **Acceptance Criteria**:
  - Successful authentication must generate an HTTP-Only, Secure, SameSite `accessToken` (15m expiry) and `refreshToken` (7d expiry) cookie.
  - Logging in must update the user's `lastLoginAt` timestamp and reset failed attempts.
  - 5 consecutive failed login attempts must lock the user account (`lockUntil` set to current time + 15 minutes).
  - Logging in with locked account status must return a `423 Locked` error with remaining lockout time.

### US-1.4: Secure Token Refresh & Theft Detection
* **User Story**: As a logged-in user, I want my session to remain active seamlessly without logging in constantly, while keeping my credentials secure.
* **Acceptance Criteria**:
  - Requesting `/auth/v1/refresh` with a valid `refreshToken` cookie must issue a new `accessToken` and a new `refreshToken`.
  - The old `refreshToken` must be revoked and its hash replaced in the database.
  - If a revoked `refreshToken` is submitted (reuse/theft detection), the Auth Service must delete all active refresh tokens for the user and force a full re-login.

### US-1.5: Password Recovery
* **User Story**: As a registered user who forgot my password, I want to request a password reset, so that I can regain access to my account.
* **Acceptance Criteria**:
  - Requesting forgot-password must generate a password-reset OTP and send it via email (silently ignoring invalid emails for security).
  - Verifying the reset OTP must yield a secure, random `resetSessionId` UUID.
  - Submitting `/auth/v1/reset-password` along with `resetSessionId` and the new password must update the password, clear the session ID, clear all active refresh tokens, and clear auth cookies.

### US-1.6: Secure Profile Deletion
* **User Story**: As a registered user, I want to securely delete my profile and account data, so that all my personal information is permanently removed from the system.
* **Acceptance Criteria**:
  - The request to delete must be authenticated.
  - Requesting profile deletion generates a unique 6-digit OTP sent to the user's email.
  - Submitting the deletion confirmation with the correct OTP must permanently delete the `authUsers` credential, `talent`/`company` profile, resumes hosted on Cloudinary, saved job history, and related application materials.

---

## 2. Talent (Job Seeker) Workflows

### US-2.1: Digital Profile Creation
* **User Story**: As a Talent user, I want to build my professional profile, so that I can represent my qualifications to hiring companies.
* **Acceptance Criteria**:
  - I must be able to input my name, university, major, graduation year, CGPA, links, avatar, bio, locations, and skills.
  - I must be able to upload a PDF resume. The system must host this resume on Cloudinary and update `resumeUrl`.
  - I must only be allowed to modify my own profile (ownership checked by Gateway interceptor).

### US-2.2: Profile Embeds (Experience, Projects, etc.)
* **User Story**: As a Talent user, I want to add work experiences, academic projects, certifications, and achievements to my profile, so that I can provide a comprehensive view of my accomplishments.
* **Acceptance Criteria**:
  - Adding an experience requires company name, role, start date, and descriptive bullet points.
  - Projects must contain project name, description, tech stack, and repository link.
  - I must be able to edit or delete any specific sub-entry by its index array position.

### US-2.3: Searching & Saving Jobs
* **User Story**: As a Talent user, I want to search and save job listings, so that I can easily apply to opportunities I find interesting.
* **Acceptance Criteria**:
  - The job directory must be queryable by keyword, location, and job type.
  - Saving a job must append the `jobId` to the Talent's `savedJobs` array.
  - Unsaving must remove the `jobId` from the array.

### US-2.4: Submitting Job Applications
* **User Story**: As a Talent user, I want to submit a job application with a motivation statement, so that I can be evaluated for a position.
* **Acceptance Criteria**:
  - Applying requires a `jobId` and an optional uploaded resume file.
  - If no file is uploaded, the profile's pre-saved `resumeUrl` must be used.
  - The application must fail if the user has already applied to this job (`existsByJobIdAndStudentId` duplicate check).
  - The application must fail if the job status is not `ACTIVE`.
  - Submitting the application must increment the job's `applicationsCount` field.

### US-2.5: AI Resume Tailoring (Generation)
* **User Story**: As a Talent user, I want the AI to draft and compile a professional PDF resume tailored to a specific job description, so that I can stand out to recruiters.
* **Acceptance Criteria**:
  - The generation request must accept template style (`classic` or `modern`) and optional job context (title, description).
  - The AI service must tail-generate resume details matching my profile items against the target job requirements.
  - The generated LaTeX source must be compiled into a PDF.
  - The response must deliver a base64-encoded string of the PDF for preview or download.

---

## 3. Company (Recruiter) Workflows

### US-3.1: Profile Customization
* **User Story**: As a Company user, I want to set up my company profile with my logo, description, size, type, and website, so that candidates can learn about my organization.
* **Acceptance Criteria**:
  - Creating a company profile requires company name, description, founded year, and logo image upload.
  - Uploaded logos must be sent to Cloudinary and return a valid URL.

### US-3.2: Posting a Job Opening
* **User Story**: As a Company recruiter, I want to create a new job posting with specific requirements, so that candidates can apply.
* **Acceptance Criteria**:
  - A job posting requires: title, description, requirements, skills required, job location, salary range, and application deadline.
  - Newly created jobs default to status `ACTIVE` and are searchable instantly.
  - Job postings must include selection criteria to guide AI evaluations.

### US-3.3: Monitoring Candidates & AI Ratings
* **User Story**: As a Company recruiter, I want to view candidates who applied to my jobs along with their AI scores, so that I can prioritize review.
* **Acceptance Criteria**:
  - Opening the job applicant list must show candidate names, motivation statement, and AI match scores (0-100).
  - Opening candidate applications must display the AI-parsed resume structure, fake resume check results (`is_fake`, confidence, reasons), and fit evaluation.

### US-3.4: Candidate Decisioning & Publishing
* **User Story**: As a Company recruiter, I want to finalize candidate decisions and publish results, so that candidates are notified of their application status.
* **Acceptance Criteria**:
  - Recruiters can mark applications as `SHORTLISTED` or `REJECTED`.
  - Results cannot be published until the job's application deadline has passed.
  - Triggering `/jobs/v1/{id}/publish-results` must set `resultsPublished: true` and dispatch customized email notifications (shortlist or rejection) to all candidates.
