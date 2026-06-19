# Software Requirements Specification (SRS) for InternNova

**Version**: 1.0.0  
**Status**: Release-Ready  
**Date**: June 19, 2026

---

## 1. Introduction

### 1.1 Purpose
This document specifies the software requirements for **InternNova**, a microservice-based portal connecting candidates (Talent) and recruiters (Companies) through AI-driven resume tailoring and automated application evaluations.

### 1.2 Scope
InternNova simplifies early-career recruitment. Candidates can build professional profiles, generate tailored resumes optimized for job descriptions, and apply to job listings. Companies can post job openings and receive candidate applications with instant, automated AI match ratings, fake-resume detection, and resume summaries.

### 1.3 Definitions, Acronyms, and Abbreviations
* **SRS**: Software Requirements Specification
* **Talent**: Candidate user applying for jobs
* **Company**: Recruiter user listing jobs and reviewing candidates
* **OTP**: One-Time Password used for registration verification and password reset
* **JWT**: JSON Web Token used for secure state-less authentication
* **LLM**: Large Language Model (e.g., Groq Llama-3/Ollama)

---

## 2. Overall Description

### 2.1 Product Perspective
InternNova is built using a decentralized microservice architecture:
1. **API Gateway**: Single portal entry (Node.js/Express, Port 4000) that handles CORS, rate-limiting, cookie translation, and path-based proxying.
2. **Auth Service**: Node.js/Express service (Port 5001) managing registration, OTP verification, and JWT session handling.
3. **Core Service**: Java/Spring Boot service (Port 8080) managing main business assets (jobs, applications, profiles) and scheduling.
4. **AI Service**: Python/FastAPI pipeline service (Port 8000) executing PDF text extraction, LLM parsing, fake detection, scoring, and LaTeX CV compilation.

```
[ Frontend (React) ] ──(HTTPS)──> [ Nginx Proxy ] ──> [ API Gateway (:4000) ]
                                                            │
                                  ┌─────────────────────────┼────────────────────────┐
                                  ▼                         ▼                        ▼
                        [ Auth Service (:5001) ]  [ Core Service (:8080) ]  [ AI Service (:8000) ]
```

### 2.2 Product Functions
* **User Accounts**: Registration, secure email verification (OTP), multi-factor locked logins, and password resets.
* **Talent Profiles**: Digital CV creation, resume parsing, Cloudinary-hosted file storage.
* **Recruitment Hub**: Job creation, custom search, application submissions.
* **AI Evaluation Pipeline**: Synchronous evaluation of PDF CVs checking for text discrepancies (fake detection), scoring matching profiles (0-100), and summarizing CVs.
* **AI Tailored CV Compilation**: Automatic compilation of dynamic, professional PDF CVs based on profile and targeted job requirements using LaTeX compilers.

### 2.3 User Classes and Characteristics
1. **Talent (Candidates)**: Seek internships/jobs. Expect fast applications, tailored resume generators, and clear status notifications.
2. **Company (Recruiters)**: Post listings and hire. Expect automated resume filtering to filter out fake applications and match candidates to criteria.
3. **Admin**: Moderate users and jobs, system operations.

### 2.4 Operating Environment
* **Databases**: MongoDB (v7.0) running inside Docker.
* **Storage**: Cloudinary API for binary documents (PDF resumes, image avatars, company logos).
* **Compilers**: xelatex / pdflatex compiler environment or external compiler service for PDF rendering.

### 2.5 Design and Implementation Constraints
* **State Management**: Gateway converts client cookies to Authorization headers to support stateless backend services.
* **Security**: Plain password storage is prohibited. Authentication cookies must be httpOnly and Secure.
* **Database Constraints**: MongoDB relationships must use soft-delete fields and avoid cascade deletions unless explicitly required.

---

## 3. Specific Requirements & System Features

### 3.1 Functional Requirements

#### Feature 3.1.1: Authentication & User Accounts
* **REQ-1 (Registration)**: Users must register with a valid email, strong password, and select a role (`Talent` or `Company`).
* **REQ-2 (Verification)**: Accounts must remain unverified and inactive until a 6-digit OTP sent to their email is successfully submitted within 10 minutes.
* **REQ-3 (Login & Lockout)**: Users log in using email and password. Five consecutive login failures must lock the account for 15 minutes.
* **REQ-4 (Token Management)**: Secure authentication must issue an access token (15-min lifespan) and a refresh token (7-day lifespan) as httpOnly cookies.
* **REQ-5 (Token Reuse Detection)**: If a refresh token is reused, the Auth Service must immediately invalidate all active refresh tokens for that user to prevent session hijacking.
* **REQ-6 (Password Recovery)**: Forgot-password requests must generate a password reset OTP. Verification must return a temporary `resetSessionId` valid only for setting a new password.
* **REQ-6a (Profile Deletion Request)**: Authenticated users must be able to request account/profile deletion, which generates and sends a deletion OTP to their registered email.
* **REQ-6b (Execute Deletion)**: Submitting the correct deletion OTP must securely and permanently delete the user's authentication credentials, profile data, resumes, and saved history from the database.

#### Feature 3.1.2: Job Seekers (Talent)
* **REQ-7 (Profile Management)**: Talent users can create and update profiles detailing education, major, CGPA, graduation year, links (LinkedIn, GitHub), avatar, skills, and custom bio.
* **REQ-8 (Sub-Entities)**: Talent profiles support embedded lists of Work Experiences, Projects, Certifications, and Achievements.
* **REQ-9 (Job Management)**: Talent users can save/unsave active job listings and view their history of submitted applications.

#### Feature 3.1.3: Recruiters (Company)
* **REQ-10 (Company Profiles)**: Company users can build profiles containing company name, size, type, website URL, description, and logo.
* **REQ-11 (Job Board)**: Companies can post, update, list, and soft-delete job listings. Job creation requires setting title, description, skills, location, type, salary range, and application deadline.

#### Feature 3.1.4: Applications & AI Evaluation
* **REQ-12 (Submission)**: Talent users apply to jobs with a motivation statement and a PDF resume (either newly uploaded or pre-saved).
* **REQ-13 (AI Evaluation Sync)**: Application submissions must trigger a synchronous AI evaluation before returning a HTTP response.
* **REQ-14 (Resume Parsing)**: The AI service must parse candidate CVs (PDF extraction) and format the data into structured JSON matching candidate profile templates.
* **REQ-15 (Fake Resume Detection)**: The AI service must cross-reference text structures and identify contradictory timelines or claims, returning `is_fake` boolean flag with reasons and confidence score.
* **REQ-16 (Score & Fit Analysis)**: The AI service must grade candidate compatibility with job requirements and selection criteria, producing a score (0 to 100) and recommendation details.
* **REQ-17 (Decision Pipeline)**: Applications must be auto-placed in status `SHORTLISTED`, `REJECTED` (for fake or low score), or `UNDER_REVIEW`.

#### Feature 3.1.5: AI Resume Tailoring (LaTeX Generation)
* **REQ-18 (LaTeX CV Compilation)**: Talent users can request a compiled PDF resume. The AI service must generate optimized content for their profile (or tailored to a specific job description) and compile it via LaTeX engine.
* **REQ-19 (Tailoring Selection)**: Supported templates must include `classic` and `modern` layout configurations.

#### Feature 3.1.6: Notifications & Background Tasks
* **REQ-20 (Scheduled Expirations)**: A CRON scheduler running daily at midnight must scan active job listings and transition expired jobs (deadline < current date) to `CLOSED`.
* **REQ-21 (Results Publication)**: Once a job is closed, recruiters can trigger "Publish Results." The system must automatically send emails to candidates detailing their final status (`SHORTLISTED` or `REJECTED`).

---

## 4. Non-Functional Requirements

### 4.1 Security Requirements
* **SEC-1**: All endpoints must require verification via Gateway-translated JWT headers except registration, verification, login, forgot-password, and public job searches.
* **SEC-2**: All passwords must be hashed using `bcrypt` (12 rounds).
* **SEC-3**: Cross-Origin Resource Sharing (CORS) must be restricted to explicitly authorized origins configured at the Gateway layer.

### 4.2 Performance and Reliability
* **PER-1 (Latency)**: Static searches and lists must resolve in <200ms. AI evaluations (including PDF parsing and LLM calls) must resolve in <8 seconds.
* **REL-1 (Database Resilience)**: The Auth and Core services must recover from transient database drops using connection retries.
* **PER-2 (Rate-Limiting)**: General requests are limited to 200/minute per IP, while OTP endpoints are restricted to 5/minute.

### 4.3 Maintainability and Scalability
* **MNT-1 (Containerization)**: Services must run in isolated Docker containers with automated networks.
* **SC-1 (Microservice Autonomy)**: Services must remain loosely coupled, connecting solely through standard HTTP APIs.
