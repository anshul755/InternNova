# 🚀 InternNova

InternNova is a production-grade, microservice-based portal connecting candidates (Talent) and recruiters (Companies) through secure, trusted AI screening and tailored resume generation. 💼✨

**Tagline:** _AI-Powered Microservice Recruitment Portal connecting candidates and recruiters through secure, trusted AI screening and tailored resume generation._

---

## 🗺️ Documentation Directory

We maintain complete production-grade documentation for requirements, specs, databases, and onboarding guides:

* **[SRS (Software Requirements Specification)](./documents/srs.md)** — High-level functional requirements, security specifications, and microservice parameters.
* **[User Stories](./documents/user_stories.md)** — Agile stories with explicit Acceptance Criteria for Talent, Company, and System actors.
* **[Use Cases & UML Diagram](./documents/use_cases.md)** — Comprehensive Actor-System use cases and Mermaid diagrams.
* **[System Architecture Overview](./documents/system_architecture_overview.md)** — Microservice layout, technologies, and system ports.
* **[Database ER Diagram (ERD)](./documents/er_diagram.md)** — MongoDB collections, relationships, embedded structures, and enums.
* **[Class Diagrams Specification](./documents/class_diagrams.md)** — Microservice class files, routes, and dependency models.
* **[Sequence Diagrams Flow](./documents/sequence_diagrams.md)** — Sequence diagrams for authentication, application evaluation, resume tailoring, and deletion.
* **[API Documentation Reference](./documents/api_documentation.md)** — Consolidated complete reference of all API routes, parameters, responses, and schemas.
* **[User Onboarding Guide](./user_guide.md)** — Interactive onboarding guides for Talent and Recruiter accounts.

---

## 🌟 What the app does

InternNova operates as a secure bridge between candidates and hiring companies:

* **👨💻 Talent (Job Seekers)**: Create comprehensive profiles with embedded experiences/projects, upload master resumes, save listings, apply to active jobs, and generate tailored PDF resumes optimized for job descriptions.
* **🧑💼 Company (Recruiters)**: Setup verified corporate profiles, publish job postings with specific criteria, evaluate candidate fit with automated AI match ratings (0-100), view AI-parsed CV summaries, check fake timeline anomaly checks, and trigger email outcomes on deadline completion.

The platform is designed around strict session security, microservice autonomy, and interactive automated recruitment pipelines. 🔐

---

## 🧩 Core capabilities

* **🔐 Secure Auth**: Registration, 6-digit OTP verification, lockouts after 5 failed attempts, HTTP-Only cookies, and token reuse/theft detection.
* **🧾 Rich Candidate Profiles**: Education, CGPA, links, and nested Experience, Projects, Certifications, and Achievements arrays.
* **👁️ Recruiter Portal**: Custom company settings, logo uploads, and job management workflows.
* **🔍 Search & Job Board**: Paginated search filterable by keyword, location, and job type.
* **🔁 AI Application Pipeline**: Synchronous parsing of PDF resumes, fake/timeline anomaly checking, score fit rating (0-100), and automated status selection (`SHORTLISTED`, `REJECTED`, `UNDER_REVIEW`).
* **📄 AI LaTeX Resume Generator**: Tailored resume content generation compiled directly into PDF using LaTeX engines (`classic` or `modern` style templates).
* **🗑️ Secure Account Deletion**: OTP-validated complete account and asset purge.
* **📧 Automation & Email**: Daily CRON jobs to auto-close expired postings, and automated result dispatch loops emailing candidates on publication.

---

## 🚀 Future Features Roadmap

**🤖 Personalized AI Assistants (Chatbots)**
* **Student Career Coach Copilot:** Acts as a personal mentor to iteratively refine student resumes, prepare for interviews, and find tailored internships via chat.
* **Recruiter Hiring Copilot:** Helps employers instantly draft compelling job descriptions, summarize candidate profiles, and generate custom interview questions.

**🧠 Advanced AI Features**
* **AI Mock Interviews:** Provides an interactive text or voice environment for students to practice interviews and receive instant, constructive feedback.
* **Skill Gap Analysis & Upskilling:** Automatically compares a student's resume against their desired internship to highlight missing skills and recommend specific courses.
* **Automated Cover Letter Generation:** A one-click feature that generates highly tailored cover letters matching the exact tone and requirements of the target internship.
* **Smart Job Matching:** Proactively suggests the most relevant internships to students and highlights the best-fit candidates to recruiters based on deep profile analysis.

**💼 Core Platform Features**
* **Real-time Messaging System:** An in-app chat system allowing recruiters and candidates to communicate directly, speeding up the hiring process.
* **Video Pitches / Resumes:** Enables students to upload a short, 1-minute video pitch to showcase their personality and stand out to employers.
* **Automated Interview Scheduling:** A built-in calendar tool allowing candidates to select available time slots directly from a recruiter's schedule to eliminate back-and-forth.
* **Recruiter Analytics Dashboard:** Provides companies with comprehensive insights into job posting views, application drop-off rates, and applicant pool quality.
* **Company Reviews & Ratings:** A transparent system where past interns can leave authentic reviews and rate their workplace experiences to help future candidates.

**📱 User Experience Enhancements**
* **Progressive Web App (Mobile Installable):** Allows users to save the web app directly to their mobile home screens for native access and push notifications.
* **Dark Mode Theme:** A sleek, user-selectable dark mode toggle designed to reduce eye strain during late-night internship hunting sessions.
* **Enhanced Accessibility:** Ensures the platform is fully inclusive and navigable for all candidates, featuring screen reader support and high-contrast viewing options.

---

## ⚠️ Important business rules

* Users must register and verify their email via OTP before profile operations are allowed.
* Candidates can only apply to jobs marked as `ACTIVE`.
* Recruiters cannot publish final selection results until the job posting's application deadline has passed.
* Session refresh tokens are strictly single-use. If a token is reused, the system automatically revokes all active refresh tokens for that user ID.
* Profile deletion requires OTP verification sent to the registered email and permanently deletes all Auth credentials, Talent/Company collections, saved histories, and associated Cloudinary file assets.

---

## 🛠️ Tech stack

### 🎨 Frontend & Gateway
* **Frontend**: React, React Router, Context API, CSS
* **API Gateway**: Node.js, Express, http-proxy-middleware, rate-limiter, cookie-to-header translation

### 🧠 Backend Microservices
* **Auth Service**: Node.js, Express, Mongoose, JWT auth, bcrypt
* **Core Service**: Java 17, Spring Boot, Spring Data MongoDB, Cloudinary SDK, JavaMailSender
* **AI Service**: Python 3.10, FastAPI, LangGraph/LangChain, Pydantic, XeLaTeX compiler

### 🗂️ Database & Services
* **MongoDB v7.0**: Central document store
* **Cloudinary**: File storage for resumes, logos, and avatars
* **SMTP (Brevo/Gmail)**: OTP and notification relays
* **Groq API**: LLM engine (Llama-3 models)

---

## 🗂️ Directory Structure & Repository Info

Below is an overview of the core directories in this repository:

* **[api-gateway/](./api-gateway)**: Handles unified entry routing, CORS configurations, rate-limiting, and parses access cookies to headers.
* **[auth-service/](./auth-service)**: Manages registrations, OTP verifications, login parameters (auto-locks after 5 failures), JWT refresh loops, and secure account deletions.
* **[core-service/](./core-service)**: Spring Boot project managing talent profiles, company hubs, jobs boards, applications states, mail notification dispatches, and daily status expiration CRON jobs.
* **[ai-service/](./ai-service)**: Python FastAPI service managing resume parsing, fake resume checks using Groq LLM pipelines, and LaTeX PDF compiling.
* **[frontend/](./frontend)**: React client application containing visitor landing pages, recruiter settings panels, and candidate CV workspaces.
* **[documents/](./documents)**: Unified documentation repository containing requirements specifications, API schemas, and sequence flow diagrams.

---

## 🧪 Local setup

### ✅ Prerequisites
* Node.js v18+
* JDK 17 (Java)
* Python v3.10+
* MongoDB v7.0
* XeLaTeX CLI binary (installed on system path for PDF resumes)

### 1) Setup Environment Config
Create `.env` file in the root directory:
```bash
cp .env.production.example .env
```
Fill in the MongoDB connections, JWT access/refresh secret strings, Cloudinary credentials, Groq API key, and SMTP host configurations.

### 2) Run Services Individually

* **Gateway (`:4000`)**:
  ```bash
  cd api-gateway && npm install && npm run dev
  ```
* **Auth Service (`:5001`)**:
  ```bash
  cd auth-service && npm install && npm run dev
  ```
* **Core Service (`:8080`)**:
  ```bash
  cd core-service
  ./mvnw spring-boot:run
  ```
* **AI Service (`:8000`)**:
  ```bash
  cd ai-service
  python -m venv venv
  source venv/bin/activate  # or venv\Scripts\activate on Windows
  pip install -r requirements.txt
  fastapi dev main.py --port 8000
  ```
* **Frontend UI (`:5173`)**:
  ```bash
  cd frontend && npm install && npm run dev
  ```

---

## 🐳 Docker Deployment

To build images and launch all services along with MongoDB using docker-compose:

```bash
docker-compose up --build
```
The client dashboard can be accessed on `http://localhost:5173`.

---

## 🧭 User flow summary

1. Candidates and recruiters sign up and verify accounts via email OTP.
2. Users complete talent/company profile parameters and upload assets (avatar/resume/logo).
3. Recruiter posts job requirements and custom selection criteria.
4. Candidates search jobs and apply with master resume or a custom PDF.
5. AI evaluates application synchronously, parsing data, scoring candidate (0-100), and auditing timeline details.
6. Once the deadline passes, recruiter publishes selection details, dispatching automated results notifications.

---

## 🆘 Troubleshooting quick notes

* **LaTeX Timeout**: Verify `xelatex` is installed locally and registered on system Environment variables, or check the fallback external LaTeX URL settings. 📄
* **Upload Failures**: Ensure Cloudinary API keys and secret parameters are accurately configured. 📤
* **Auth Expired**: Clear local cookies or verify `JWT_ACCESS_TTL` and `JWT_REFRESH_TTL` values match in Auth and Core services. 🔑
* **LLM Connection Errors**: Verify Groq API Key is active and models selection fields match availability. 🧠

---

## 🤝 Contributing

1. Create a feature branch.
2. Wrote clean commits.
3. Open a PR referencing documentation modifications.

---

## 📄 License

This project is licensed under the **MIT License**.

See the full license text in the [`LICENSE`](LICENSE) file.

---

Built with ❤️ for candidate success and recruiting optimization in InternNova.
