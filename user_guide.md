# InternNova User Guide

This guide walks you through the features and core workflows of **InternNova**, tailored for both **Job Seekers (Talent)** and **Recruiters (Company)**.

---

## 1. Getting Started: Account Setup & Verification

Whether you are a candidate or a recruiter, you must register and activate your account:

1. **Registration**: Go to the signup page. Input your email address, create a strong password, and select your role:
   * **Talent**: Choose this if you are a student or job seeker.
   * **Company**: Choose this if you are a recruiter or hiring manager.
2. **Email Verification**:
   * After submitting, check your email inbox for a 6-digit verification code.
   * Enter this One-Time Password (OTP) in the verification box within **10 minutes** to activate your account.
3. **Log In**:
   * Once activated, log in with your email and password.
   * *Note: 5 consecutive failed login attempts will lock your account for 15 minutes to protect your security.*

---

## 2. Job Seeker (Talent) Workflow

### 2.1 Building Your Profile & CV
Recruiters and the AI matching pipeline rely on your profile structure to evaluate your fit.

1. **Basic Info**: Fill in your university name, major, graduation year, and current CGPA. Upload a profile photo (avatar) and write a short bio.
2. **Add Work Experience**: Detail past internships/jobs with role titles, company name, start/end dates, and bullet points of your responsibilities.
3. **Add Projects**: Highlight your technical projects. Enter the project name, description, the tech stack used, and paste links to live sites or GitHub repositories.
4. **Skills**: Input relevant skills (e.g., *Java, Spring Boot, React, Python, FastAPI*).

### 2.2 Uploading Your Master Resume
* Save your professional CV as a PDF file.
* Go to your dashboard and upload the PDF file. This master copy is hosted securely and serves as your default resume for applications.

### 2.3 AI Resume Tailoring (Dynamic Generation)
If you want to optimize your resume for a specific job:
1. Navigate to **AI Resume Generator** on your profile.
2. Choose a template style:
   * **Classic**: Traditional, text-focused professional resume layout.
   * **Modern**: Sleek layout with modern headers.
3. Optional: Paste the **Job Title** and **Job Description** of the opportunity you are targeting.
4. Click **Generate Tailored Resume**.
5. The AI Service will structure your experiences to match the job, compile the LaTeX source, and provide a downloadable **tailored PDF resume**.

### 2.4 Searching and Applying for Jobs
1. Open the **Job Board** tab.
2. Search by keywords, location (e.g., *Remote*, *San Francisco*), or job types (*Internship*, *Full-Time*).
3. Click the **Bookmark** icon to save listings you want to revisit.
4. Click **Apply Now** on a job listing:
   * Write a brief motivation statement.
   * Submit either your master resume or upload a custom PDF for this application.
   * Once submitted, the system runs an **instant AI evaluation** and displays your application status.

---

## 3. Recruiter (Company) Workflow

### 3.1 Establishing Your Company Page
Before listing jobs, create your public presence:
1. Navigate to **Company Settings**.
2. Add your company name, website link, size (e.g., *11-50 employees*), and type (*Startup*, *Enterprise*).
3. Upload your official company logo.

### 3.2 Posting a Job Opening
1. Click **Post a Job**.
2. Input the title, description, and list of required skills.
3. Specify responsibilities, salary ranges, location, and the application deadline.
4. **Selection Criteria**: Provide specific instructions (e.g., *Minimum 3.5 CGPA, React proficiency*). The AI pipeline reads this criteria to match candidates.

### 3.3 Evaluating Applicants
When a candidate applies, the AI pipeline executes an immediate check:
1. **AI Match Score**: Candidates receive a score from `0` to `100` representing how well their skills and experiences align with your job specs.
2. **Fake Resume Check**: The AI scans for chronological discrepancies, overlapping work durations, or contradictory claims. If an anomaly is found, it raises a flag (`is_fake`) along with reasons and a confidence rating.
3. **Structured Summary**: Review an organized JSON format of the candidate's parsed PDF CV without opening files.

### 3.4 Deciding Candidates & Releasing Results
1. Navigate to your job applicants list.
2. Filter or sort candidates by their **AI Match Score**.
3. Toggle applicants as `SHORTLISTED` or `REJECTED` based on reviews.
4. **Publishing Results**:
   * Once the application deadline has passed, click the **Publish Results** button.
   * The system transitions the job posting to `CLOSED`.
   * Customized email notices are automatically dispatched: shortlisted candidates receive congratulations and next steps; rejected candidates receive a feedback email.

---

## 4. Secure Profile & Account Deletion

If you need to permanently remove your profile and account information from InternNova:

1. Go to **Profile**.
2. Click **Delete Profile & Account**.
3. Check your email for a 6-digit confirmation OTP.
4. Input the code in the confirmation dialog and click **Confirm Delete**.
5. Once confirmed:
   * Your user credentials and login profile are removed.
   * All uploaded resumes and avatars are deleted from Cloudinary.
   * All saved history, job posts (if recruiter), or submitted applications (if candidate) are purged from MongoDB.
   * Your session is terminated, cookies cleared, and you are redirected to the homepage.
