# InternNova — Sequence Diagrams

This document contains all sequence diagrams mapping temporal message exchanges between system services, client apps, databases, and background schedulers.

---

## 1. User Registration & Email Verification

```mermaid
sequenceDiagram
    actor User
    participant FE as Frontend
    participant GW as API Gateway
    participant Auth as Auth Service
    participant DB as MongoDB
    participant SMTP as SMTP Server

    Note over User, SMTP: Registration Flow

    User->>FE: Fill registration form (email, password, role)
    FE->>GW: POST /auth/v1/register
    GW->>Auth: proxy → POST /auth/v1/register

    Auth->>Auth: validateRegister middleware
    Auth->>Auth: generalLimiter rate check

    Auth->>DB: findOne({ email })
    alt Email already verified
        DB-->>Auth: existing user (verified)
        Auth-->>GW: 409 "Account already exists"
        GW-->>FE: 409
        FE-->>User: Show error
    else Email unverified (re-register)
        DB-->>Auth: existing user (unverified)
        Auth->>Auth: setPassword(newPassword)
        Auth->>DB: save updated user
        Auth->>DB: deleteMany OTPs for this email
        Auth->>Auth: generateOTP() → 6-digit code
        Auth->>DB: create OTP record (hashed)
        Auth->>SMTP: send verification email with OTP
        Auth-->>GW: 201 { userId, email, role }
    else Brand new user
        DB-->>Auth: null
        Auth->>DB: deleteMany stale OTPs
        Auth->>Auth: new User({ email, role })
        Auth->>Auth: setPassword(password) [bcrypt 12 rounds]
        Auth->>DB: save new user
        Auth->>Auth: generateOTP()
        Auth->>DB: create OTP record (hashed, TTL 10min)
        Auth->>SMTP: send verification email
        Auth-->>GW: 201 { userId, email, role }
    end

    GW-->>FE: 201 Success
    FE-->>User: Navigate to verify-email page

    Note over User, SMTP: Email Verification

    User->>FE: Enter 6-digit OTP
    FE->>GW: POST /auth/v1/verify-email { email, otp }
    GW->>Auth: proxy

    Auth->>Auth: otpLimiter + validateVerifyEmail
    Auth->>DB: findOne OTP({ email, type: EMAIL_VERIFICATION })

    alt OTP expired
        Auth->>DB: delete OTP record
        Auth-->>GW: 400 "OTP expired"
    else OTP attempts exhausted (≥3)
        Auth->>DB: delete OTP record
        Auth-->>GW: 429 "Too many attempts"
    else OTP mismatch
        Auth->>DB: increment attempts
        Auth-->>GW: 400 "Invalid OTP, N remaining"
    else OTP valid ✓
        Auth->>DB: delete OTP record
        Auth->>DB: updateOne({ email }, { isEmailVerified: true })
        Auth-->>GW: 200 { userId, role }
    end

    GW-->>FE: Response
    FE-->>User: Redirect to login
```

---

## 2. User Login & Token Refresh

```mermaid
sequenceDiagram
    actor User
    participant FE as Frontend
    participant GW as API Gateway
    participant Auth as Auth Service
    participant DB as MongoDB

    Note over User, DB: Login Flow

    User->>FE: Enter email + password
    FE->>GW: POST /auth/v1/login
    GW->>Auth: proxy

    Auth->>Auth: loginLimiter + validateLogin
    Auth->>DB: findOne({ email }) with hidden fields

    alt User not found or inactive
        Auth-->>GW: 401 "Invalid credentials"
    else Account locked (>5 failed attempts)
        Auth-->>GW: 423 "Account locked. Try in N minutes"
    else Email not verified
        Auth-->>GW: 403 "Verify your email first"
    else Password mismatch
        Auth->>DB: incLoginAttempts()
        Auth-->>GW: 401 "Invalid credentials"
    else Password match ✓
        Auth->>DB: resetLoginAttempts()
        Auth->>Auth: signAccessToken (15min TTL)
        Auth->>Auth: signRefreshToken (7day TTL)
        Auth->>Auth: bcrypt.hash(refreshToken)
        Auth->>DB: push hashed refresh token (keep last 10)

        Auth-->>GW: 200 + Set-Cookie: accessToken (httpOnly)<br/>+ Set-Cookie: refreshToken (httpOnly)
    end

    GW-->>FE: Response with cookies
    FE-->>User: Redirect to dashboard

    Note over User, DB: Subsequent Authenticated Request

    FE->>GW: GET /talent/v1/{id}<br/>Cookie: accessToken=...
    GW->>GW: Cookie middleware extracts accessToken<br/>→ sets Authorization: Bearer <token>
    GW->>Auth: proxy (for /auth routes)
    Note right of GW: For /talent, /jobs, etc.<br/>proxied to Core Service
    GW->>GW: Proxy to Core Service

    Note over User, DB: Token Refresh Flow

    FE->>GW: POST /auth/v1/refresh<br/>Cookie: refreshToken=...
    GW->>Auth: proxy

    Auth->>Auth: verifyRefreshToken(JWT)
    Auth->>DB: findById(userId) + select refreshTokens
    Auth->>Auth: bcrypt.compare against stored hashes

    alt Token not found in stored list
        Auth->>DB: Clear ALL refresh tokens (reuse detection!)
        Auth-->>GW: 401 "Reuse detected. Log in again"
    else Token found ✓
        Auth->>Auth: sign new access + refresh tokens
        Auth->>Auth: hash new refresh token
        Auth->>DB: replace old hash with new at same index
        Auth-->>GW: 200 + new cookies
    end

    GW-->>FE: New tokens
```

---

## 3. Job Application Submission with AI Evaluation

```mermaid
sequenceDiagram
    actor Talent
    participant FE as Frontend
    participant GW as API Gateway
    participant Core as Core Service
    participant AI as AI Service
    participant LLM as LLM (Groq)
    participant DB as MongoDB
    participant CDN as Cloudinary

    Talent->>FE: Apply to job (motivation + resume file)
    FE->>GW: POST /applications/v1 (multipart)
    GW->>Core: proxy

    Note over Core: ApplicationController.createApplicationMultipart

    Core->>DB: existsByJobIdAndStudentId? (duplicate check)
    alt Already applied
        Core-->>GW: 400 "Application already exists"
        GW-->>FE: Error
    end

    Core->>DB: findJob(jobId)
    alt Job not ACTIVE
        Core-->>GW: 400 "Job not accepting applications"
    end

    Core->>DB: findTalent(studentId)
    alt Talent not found
        Core-->>GW: 400 "Talent not found"
    end

    opt Resume file uploaded
        Core->>CDN: uploadFile(resumeFile)
        CDN-->>Core: resumeUrl
    end

    Core->>Core: Build Application entity
    Core->>DB: applicationRepository.save()
    Core->>DB: incrementApplicationCount(jobId)

    Note over Core, LLM: Synchronous AI Evaluation

    Core->>Core: ApplicationEvaluationService.evaluateSync()
    Core->>Core: Build EvaluateRequestDTO (job context + resume URL)

    Core->>AI: POST /pipeline/v1/evaluate
    Note over AI: EvaluateService.evaluate_application()

    AI->>AI: Step 1: parse_resume(resumeUrl)
    AI->>AI: Download PDF from resumeUrl
    AI->>AI: Extract text from PDF
    AI->>LLM: Parse resume + detect fake (structured output)
    LLM-->>AI: ParsedResume { is_fake, resume: ResumeData }

    alt Resume is fake
        AI-->>Core: EvaluateResult { decision: REJECTED, matchScore: 0 }
    else Resume is genuine
        AI->>AI: Step 2: decide_shortlist(resume, jobContext)
        AI->>LLM: Match resume to job description (structured output)
        LLM-->>AI: ShortlistDecision { decision, match_score, reasons }
        AI-->>Core: EvaluateResult { decision, matchScore, reasons, resume }
    end

    Core->>DB: Re-read application (fresh)
    Core->>DB: Update application:<br/>status, aiMatchScore, recruiterNotes,<br/>parsedResume, evaluationAttemptedAt
    Core-->>GW: 200 Application (with AI decision)
    GW-->>FE: Application response
    FE-->>Talent: Show result (SHORTLISTED/UNDER_REVIEW/REJECTED)
```

---

## 4. AI Resume Generation & Tailoring

```mermaid
sequenceDiagram
    actor Talent
    participant FE as Frontend
    participant GW as API Gateway
    participant Core as Core Service
    participant AI as AI Service
    participant LLM as LLM (Groq)
    participant LaTeX as LaTeX Compiler

    Talent->>FE: Click "Generate Resume" (select template, optional job)
    FE->>GW: POST /talent/v1/resume<br/>{ talentId, template, email, phone, jobTitle, jobDescription }
    GW->>Core: proxy

    Note over Core: TalentController.generateResume()

    Core->>Core: Override talentId with authenticated userId
    Core->>AI: POST /pipeline/v1/generate-resume<br/>(GenerateResumeRequestDTO)

    Note over AI: ResumeGeneratorService.generate_resume()

    AI->>AI: Step 1: fetch_profile
    AI->>Core: GET /talent/v1/profile/{talentId}/full<br/>Header: X-Service-Token
    Core->>DB: findTalent(talentId)
    Core-->>AI: TalentProfile JSON

    AI->>AI: Step 2: LLM content generation
    AI->>AI: Build prompt with profile + optional job context
    AI->>LLM: Generate ResumeContent (structured output)
    LLM-->>AI: ResumeContent {summary, skillGroups, experience, projects, ...}

    AI->>AI: Step 3: Assemble LaTeX
    AI->>AI: Build ContactInfo from profile + request (email, phone)
    AI->>AI: Render .tex using template (classic/modern)

    AI->>AI: Step 4: Compile PDF
    AI->>LaTeX: xelatex compile .tex → .pdf
    LaTeX-->>AI: PDF bytes

    AI->>AI: Base64 encode PDF
    AI-->>Core: GenerateResumeResult { tex, pdfBase64, tailored }
    Core-->>GW: 200 { tex, pdfBase64 }
    GW-->>FE: Resume data
    FE-->>Talent: Display/download PDF resume
```

---

## 5. Job Lifecycle

```mermaid
sequenceDiagram
    actor Company
    participant FE as Frontend
    participant GW as API Gateway
    participant Core as Core Service
    participant DB as MongoDB
    participant SMTP as SMTP Server
    participant Scheduler as JobScheduler

    Note over Company, Scheduler: Job Creation

    Company->>FE: Fill job posting form
    FE->>GW: POST /jobs/v1 (JobCreateDTO)
    GW->>Core: proxy
    Core->>Core: Map DTO to Job entity
    Core->>Core: Set createdAt, default deadline (+30 days)
    Core->>DB: jobRepository.save()
    Core-->>GW: 200 Job
    GW-->>FE: Job created
    FE-->>Company: Show job listing

    Note over Company, Scheduler: Daily Job Expiration (Midnight CRON)

    Scheduler->>Core: @Scheduled("0 0 0 * * ?") expireJobsDaily()
    Core->>DB: findByStatus("ACTIVE") AND deadline < today
    Core->>Core: Set status = "CLOSED" for each
    Core->>DB: saveAll(expiredJobs)

    Note over Company, Scheduler: Publish Results

    Company->>FE: Click "Publish Results"
    FE->>GW: POST /jobs/v1/{id}/publish-results
    GW->>Core: proxy

    Core->>DB: findJob(id)
    alt Deadline not passed
        Core-->>GW: 400 "Cannot publish before deadline"
    else Already published
        Core-->>GW: 400 "Already published"
    else OK ✓
        Core->>DB: Set resultsPublished = true
        Core->>DB: Find all applications for this job

        loop For each SHORTLISTED or REJECTED application
            Core->>DB: Find Talent by studentId
            Core->>DB: Find AuthUser by talentId (for email)
            alt Shortlisted
                Core->>SMTP: sendShortlistEmail(email, name, jobTitle, company)
            else Rejected
                Core->>SMTP: sendRejectionEmail(email, name, jobTitle, company)
            end
        end

        Core-->>GW: 200 Job (resultsPublished: true)
    end

    GW-->>FE: Response
    FE-->>Company: Results published confirmation

    Note over Company, Scheduler: After Publishing — Student View

    Note right of FE: Before publish: all statuses appear as APPLIED to students
    Note right of FE: After publish: students see real status (SHORTLISTED/REJECTED)
```

---

## 6. Password Reset Flow

```mermaid
sequenceDiagram
    actor User
    participant FE as Frontend
    participant GW as API Gateway
    participant Auth as Auth Service
    participant DB as MongoDB
    participant SMTP as SMTP Server

    Note over User, SMTP: Step 1 — Request OTP

    User->>FE: Click "Forgot Password", enter email
    FE->>GW: POST /auth/v1/forgot-password { email }
    GW->>Auth: proxy

    Auth->>Auth: otpLimiter + validateForgotPassword
    Auth->>DB: findOne({ email })

    alt User exists, active, and verified
        Auth->>Auth: generateOTP()
        Auth->>DB: deleteMany OTPs({ email, PASSWORD_RESET })
        Auth->>DB: create OTP record (hashed, 10min TTL)
        Auth->>SMTP: send password reset email with OTP
    else User not found / inactive
        Note right of Auth: Silently do nothing (security)
    end

    Auth-->>GW: 200 "If account exists, OTP sent"
    GW-->>FE: 200
    FE-->>User: Navigate to OTP verification page

    Note over User, SMTP: Step 2 — Verify OTP

    User->>FE: Enter 6-digit OTP
    FE->>GW: POST /auth/v1/verify-reset-otp { email, otp }
    GW->>Auth: proxy

    Auth->>Auth: otpLimiter + validateVerifyResetOTP
    Auth->>DB: findOne OTP({ email, PASSWORD_RESET })

    alt OTP valid ✓
        Auth->>DB: delete OTP record
        Auth->>Auth: generate UUID resetSessionId
        Auth->>DB: updateOne({ email }, { passwordResetSessionId })
        Auth-->>GW: 200 { resetSessionId }
    else Invalid/expired
        Auth-->>GW: 400 error message
    end

    GW-->>FE: Response
    FE-->>User: Navigate to new password form

    Note over User, SMTP: Step 3 — Set New Password

    User->>FE: Enter new password
    FE->>GW: POST /auth/v1/reset-password<br/>{ email, resetSessionId, newPassword }
    GW->>Auth: proxy

    Auth->>Auth: generalLimiter + validateResetPassword
    Auth->>DB: findOne({ email }) + select passwordResetSessionId
    
    alt Session ID matches ✓
        Auth->>Auth: user.setPassword(newPassword) [bcrypt]
        Auth->>Auth: Clear passwordResetSessionId
        Auth->>Auth: Clear ALL refresh tokens
        Auth->>DB: user.save()
        Auth-->>GW: 200 "Password reset. Please log in."
        Note right of Auth: Clears accessToken + refreshToken cookies
    else Invalid session
        Auth-->>GW: 400 "Invalid or expired reset session"
    end

    GW-->>FE: Response (clear cookies)
    FE-->>User: Redirect to login
```

---

## 7. Secure Account Deletion Flow

```mermaid
sequenceDiagram
    actor User
    participant FE as Frontend
    participant GW as API Gateway
    participant Auth as Auth Service
    participant Core as Core Service
    participant DB as MongoDB
    participant CDN as Cloudinary
    participant SMTP as SMTP Server

    Note over User, SMTP: Step 1 — Request Deletion OTP

    User->>FE: Click "Delete Account" in Settings
    FE->>GW: POST /auth/v1/request-delete
    GW->>Auth: proxy

    Auth->>Auth: generateOTP()
    Auth->>DB: create OTP record (type: DELETION, 10min TTL)
    Auth->>SMTP: send profile deletion email with OTP
    Auth-->>GW: 200 "Deletion OTP sent to email"
    GW-->>FE: 200
    FE-->>User: Navigate to deletion confirmation dialog

    Note over User, SMTP: Step 2 — Confirm & Execute Deletion

    User->>FE: Enter deletion OTP
    FE->>GW: DELETE /auth/v1/delete { otp }
    GW->>Auth: proxy

    Auth->>DB: findOne OTP({ email, type: DELETION })
    alt OTP is valid ✓
        Auth->>DB: delete OTP record
        Auth->>DB: delete AuthUser record
        
        Auth->>Core: Notify profile deletion (X-Service-Token)
        Core->>DB: findTalent/findCompany
        Core->>CDN: delete associated resume/avatar/logo files
        Core->>DB: delete talent/company profile
        Core->>DB: delete applications / jobs
        Core-->>Auth: Success (200)

        Auth-->>GW: 200 "Account and profiles deleted successfully"
        Note right of Auth: Clears auth cookies
    else Invalid/Expired OTP
        Auth-->>GW: 400 "Invalid or expired OTP"
    end
    GW-->>FE: Response
    FE-->>User: Redirect to signup/login screen
```
