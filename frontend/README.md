# InternNova Frontend

React + Vite app styled with Tailwind CSS v4 for InternNova.

## Features

- Company: Registration, Job Posting, Dashboard, Shortlisting
- User: Internship Finder, Resume Builder, Mock Interview, Dashboard, Registration
- Shared UI: Navbar, Button, Input, Card, Table

## Quick Start

Install dependencies and run the dev server:

```bash
cd frontend
npm install
npm run dev
```

Then open the URL printed in the terminal (usually http://localhost:5173).

## Routes

- `/` Landing
- `/login` Login (toggle User/Company)
- `/signup` Signup (toggle User/Company)
- `/company/register` Company Registration
- `/company/post-job` Post Job
- `/company/dashboard` Company Dashboard
- `/company/shortlisting` Shortlisting
- `/user/register` User Registration
- `/user/internships` Internship Finder
- `/user/resume-builder` Resume Builder
- `/user/mock-interview` Mock Interview
- `/user/dashboard` User Dashboard

## Notes

- Tailwind v4 is enabled via `@tailwindcss/vite` and `@import "tailwindcss"` in `src/index.css`.
- Pages use local state and mock data only; wire to your backend when ready.
