# InternNova — System Architecture Overview

> **Production-Grade Documentation** — All diagrams use **Mermaid** syntax for native rendering in GitHub, GitLab, Notion, and most modern Markdown viewers.

---

## System Architecture Diagram

```mermaid
graph TB
    subgraph Client
        FE["Frontend<br/>(React / Vite)"]
    end

    subgraph Infrastructure
        NGINX["Nginx<br/>(Reverse Proxy)"]
    end

    subgraph Gateway
        GW["API Gateway<br/>(Node.js :4000)"]
    end

    subgraph Services
        AUTH["Auth Service<br/>(Express :5001)"]
        CORE["Core Service<br/>(Spring Boot :8080)"]
        AI["AI Service<br/>(FastAPI :8000)"]
    end

    subgraph Data
        MONGO[("MongoDB 7<br/>internnova-dev")]
        CLOUD["Cloudinary<br/>(File Storage)"]
    end

    subgraph External
        SMTP["SMTP Server<br/>(Gmail)"]
        LLM["LLM Provider<br/>(Groq / Ollama)"]
        LATEX["LaTeX Compiler<br/>(xelatex / latexonline.cc)"]
    end

    FE -->|HTTPS| NGINX
    NGINX -->|HTTP| GW

    GW -->|"/auth/*"| AUTH
    GW -->|"/talent/*<br/>/jobs/*<br/>/company/*<br/>/applications/*"| CORE
    GW -->|"/pipeline/*"| AI

    AUTH -->|Read/Write| MONGO
    CORE -->|Read/Write| MONGO
    CORE -->|Upload/Delete| CLOUD
    CORE -->|HTTP POST| AI
    CORE -->|SMTP| SMTP
    AUTH -->|SMTP| SMTP

    AI -->|HTTP GET| CORE
    AI -->|LLM API| LLM
    AI -->|Compile| LATEX

    classDef gateway fill:#f59e0b,stroke:#d97706,color:#000
    classDef service fill:#3b82f6,stroke:#2563eb,color:#fff
    classDef data fill:#10b981,stroke:#059669,color:#fff
    classDef external fill:#8b5cf6,stroke:#7c3aed,color:#fff
    classDef client fill:#ec4899,stroke:#db2777,color:#fff
    classDef infra fill:#64748b,stroke:#475569,color:#fff

    class FE client
    class NGINX infra
    class GW gateway
    class AUTH,CORE,AI service
    class MONGO,CLOUD data
    class SMTP,LLM,LATEX external
```

### Service Summary

| Service | Tech Stack | Port | Responsibility |
|---------|-----------|------|----------------|
| **API Gateway** | Node.js, Express, http-proxy-middleware | 4000 | Single entry point, CORS, rate limiting, cookie→header translation, request proxying |
| **Auth Service** | Node.js, Express, Mongoose, bcryptjs, jsonwebtoken | 5001 | Registration, email verification (OTP), login, JWT access/refresh tokens, password reset |
| **Core Service** | Java 17, Spring Boot, Spring Data MongoDB, Cloudinary SDK | 8080 | Talent profiles, companies, job postings, applications, AI evaluation orchestration, email notifications, scheduled tasks |
| **AI Service** | Python, FastAPI, LangChain/LangGraph, Pydantic, LaTeX | 8000 | Resume parsing (PDF→structured JSON), fake detection, shortlist decisions, resume PDF generation |
