# InternNova — Database Entity-Relationship Diagram (ERD)

> All collections live in a single **MongoDB** database (`internnova-dev`). Relationships are maintained via string ID references (not foreign keys — this is a document DB). Embedded documents are shown as compositions.

---

## Entity-Relationship Diagram

```mermaid
erDiagram
    authUsers {
        string _id PK
        string email UK "unique, lowercase"
        string passwordHash "bcrypt, select:false"
        string role "Talent | Company | Admin"
        boolean isEmailVerified "default: false"
        boolean isActive "default: true"
        string[] refreshTokens "hashed, select:false"
        int loginAttempts "default: 0"
        date lockUntil "auto-lock after 5 failures"
        date lastLoginAt
        string passwordResetSessionId "UUID, select:false"
        date createdAt
        date updatedAt
    }

    otps {
        string _id PK
        string email "indexed"
        string otpHash "bcrypt"
        string type "EMAIL_VERIFICATION | PASSWORD_RESET"
        int attempts "default: 0, max: 3"
        date expiresAt "TTL index, 10min"
        date createdAt
    }

    talent {
        string _id PK "same as authUsers._id"
        string user "enum: Talent"
        string name
        boolean isDeleted "soft delete"
        string university
        string major
        string graduationYear
        double cgpa
        string[] skills
        string avatarUrl "Cloudinary"
        string resumeUrl "Cloudinary"
        string linkedinUrl
        string githubUrl
        string portfolioUrl
        string bio
        string location
        string[] preferredLocations
        string[] preferredIndustries
        string[] savedJobs "Job IDs"
        string resumeSummary
    }

    experience {
        string company
        string role
        string location
        string startDate
        string endDate
        boolean isCurrent
        string[] bulletPoints
    }

    project {
        string name
        string description
        string[] techStack
        string liveUrl
        string repoUrl
        string[] highlights
    }

    certification {
        string name
        string issuer
        string issueDate
        string credentialUrl
    }

    achievement {
        string title
        string description
        string year
    }

    company {
        string _id PK "same as authUsers._id"
        string user "enum: Company"
        string companyName
        string companySize
        string companyDescription
        int foundedYear
        string companyType
        boolean isDeleted "soft delete"
        string websiteUrl
        string logoUrl "Cloudinary"
    }

    jobs {
        string _id PK
        string companyId FK "→ company._id"
        string title
        string description
        string requirements
        string responsibilities
        string[] skillsRequired
        string location
        boolean remoteOption "default: false"
        double salaryMin
        double salaryMax
        string jobType "enum: OpportunityType"
        string duration
        date startDate
        date applicationDeadline
        string status "ACTIVE | CLOSED"
        long viewsCount "default: 0"
        string[] viewedByUsers "unique user IDs"
        long applicationsCount "default: 0"
        datetime createdAt
        boolean isDeleted "soft delete"
        string selectionCriteria
        boolean resultsPublished "default: false"
    }

    applications {
        string _id PK
        string jobId FK "→ jobs._id"
        string studentId FK "→ talent._id"
        string status "enum: ApplicationState"
        string motivationStatement
        string resumeUrl "Cloudinary"
        double aiMatchScore "0-100, from AI"
        string recruiterNotes
        datetime appliedAt
        boolean isDeleted "soft delete"
        string jobTitle "denormalized"
        string companyName "denormalized"
        string jobLocation "denormalized"
        map parsedResume "AI-parsed JSON"
        string evaluationError "null on success"
        datetime evaluationAttemptedAt
    }

    authUsers ||--o| talent : "ID shared (Talent role)"
    authUsers ||--o| company : "ID shared (Company role)"
    talent ||--o{ experience : "embeds"
    talent ||--o{ project : "embeds"
    talent ||--o{ certification : "embeds"
    talent ||--o{ achievement : "embeds"
    talent }o--o{ jobs : "savedJobs (IDs)"
    company ||--o{ jobs : "companyId"
    jobs ||--o{ applications : "jobId"
    talent ||--o{ applications : "studentId"
    authUsers ||--o{ otps : "email"
```

### Enum Definitions

| Enum | Values |
|------|--------|
| **User** (role) | `Talent`, `Company`, `Admin` |
| **OpportunityType** | `INTERNSHIP`, `FULL_TIME`, `PART_TIME`, `CONTRACT`, `FREELANCE` |
| **ApplicationState** | `APPLIED`, `UNDER_REVIEW`, `SHORTLISTED`, `REJECTED`, `WITHDRAWN` |
| **OTP Type** | `EMAIL_VERIFICATION`, `PASSWORD_RESET` |
