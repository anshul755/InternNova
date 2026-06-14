import LegalDocumentPage from "../components/LegalDocumentPage.jsx";

const sections = [
  {
    id: "acceptance-of-terms",
    title: "Acceptance of Terms",
    paragraphs: [
      "These Terms of Service govern access to and use of InternNova, including its internship discovery tools, resume matching workflows, employer dashboards, application tracking features, and related services. By creating an account, browsing the platform, or using any InternNova feature, you agree to be bound by these Terms and our Privacy Policy.",
      "If you are using InternNova on behalf of an employer, institution, recruiting team, or other organization, you represent that you have authority to bind that entity to these Terms. If you do not agree with these Terms, you must not access or use the platform.",
    ],
  },
  {
    id: "eligibility",
    title: "Eligibility",
    paragraphs: [
      "InternNova is intended for students, early-career professionals, and authorized employer representatives seeking or offering internship and entry-level employment opportunities. You may use the platform only if you can form a legally binding agreement under applicable law and are not prohibited from using the service.",
      "Employer accounts may only be created and operated by individuals authorized to represent the applicable business or hiring organization. Talent users are responsible for ensuring that the information they provide about their education, work history, and credentials is accurate and current.",
    ],
  },
  {
    id: "user-accounts",
    title: "User Accounts",
    paragraphs: [
      "You are responsible for safeguarding your credentials and for all activity that occurs under your account. You must provide complete and accurate registration information and promptly update it if it changes.",
      "You may not share your account with another person, transfer access without authorization, or attempt to gain unauthorized access to another account, employer workspace, or applicant record. InternNova may require identity, organization, or email verification before enabling certain features.",
    ],
  },
  {
    id: "platform-usage-rules",
    title: "Platform Usage Rules",
    paragraphs: [
      "InternNova provides tools to help talent users present their qualifications and help employers identify relevant candidates. You may use the platform only for legitimate internship, recruiting, resume, and application-related purposes consistent with these Terms and applicable law.",
    ],
    subheading: "You agree not to misuse platform features by:",
    items: [
      "Posting false, deceptive, discriminatory, or non-genuine internship or job opportunities.",
      "Uploading resumes, portfolios, employer materials, or application documents you do not own or have permission to use.",
      "Using automated tools to scrape candidate data, application data, or employer profile information without authorization.",
      "Attempting to reverse engineer, bypass, or disrupt matching logic, authentication systems, or other security controls.",
    ],
  },
  {
    id: "internship-application-responsibilities",
    title: "Internship Application Responsibilities",
    paragraphs: [
      "Talent users remain solely responsible for every application they submit through InternNova, including the truthfulness of resume content, cover letters, profile claims, and supporting documents. AI-assisted suggestions, formatting support, or keyword recommendations are provided as productivity tools and do not replace the need for user review.",
      "Employer users are responsible for reviewing candidates fairly, handling applicant information responsibly, and ensuring that hiring decisions, communications, and posted opportunities comply with applicable labor, privacy, and anti-discrimination requirements.",
    ],
  },
  {
    id: "prohibited-activities",
    title: "Prohibited Activities",
    paragraphs: [
      "You may not use InternNova for any unlawful, harmful, abusive, fraudulent, or misleading purpose. This includes conduct that could compromise platform trust, data security, or the experience of other users.",
    ],
    subheading: "Examples of prohibited conduct include:",
    items: [
      "Impersonating a student, candidate, recruiter, employer, school, or company representative.",
      "Sending spam, harassment, phishing messages, or bulk outreach through application or contact mechanisms.",
      "Using the platform to distribute malware, harmful files, or malicious links.",
      "Interfering with another user's access to the service or attempting to degrade platform performance.",
    ],
  },
  {
    id: "intellectual-property-rights",
    title: "Intellectual Property Rights",
    paragraphs: [
      "InternNova and its associated software, branding, visual design, interface elements, text, workflows, and service architecture are owned by InternNova or its licensors and are protected by intellectual property laws. Except as expressly permitted, you may not copy, modify, distribute, sell, or create derivative works from the platform.",
      "No right, title, or interest in InternNova intellectual property is transferred to you through use of the service, other than the limited right to access and use the platform in accordance with these Terms.",
    ],
  },
  {
    id: "content-ownership",
    title: "Content Ownership",
    paragraphs: [
      "You retain ownership of the content you submit to InternNova, including resumes, profile details, employer descriptions, branding assets, job listings, and application materials. By submitting content, you grant InternNova a limited license to host, process, display, transmit, and analyze that content as necessary to operate, improve, and secure the service.",
      "You represent that you have the rights needed to provide such content and that your submission does not violate the rights of any third party.",
    ],
  },
  {
    id: "service-availability",
    title: "Service Availability",
    paragraphs: [
      "InternNova works to maintain a stable and reliable platform, but we do not guarantee uninterrupted access, error-free operation, or the continuous availability of every feature. Maintenance, updates, security incidents, third-party outages, or high traffic may affect availability from time to time.",
      "We may change, suspend, or discontinue features, including dashboards, saved jobs, resume tooling, or matching services, when necessary for business, security, operational, or legal reasons.",
    ],
  },
  {
    id: "limitation-of-liability",
    title: "Limitation of Liability",
    paragraphs: [
      "To the maximum extent permitted by law, InternNova and its affiliates, officers, employees, and partners will not be liable for indirect, incidental, consequential, special, exemplary, or punitive damages, including lost data, lost profits, loss of hiring opportunities, or loss of business goodwill arising from or related to use of the platform.",
      "InternNova does not guarantee internship placement, interviews, offers, candidate quality, hiring outcomes, or the accuracy of employer or applicant-provided information. Your use of the service is at your own risk.",
    ],
  },
  {
    id: "indemnification",
    title: "Indemnification",
    paragraphs: [
      "You agree to defend, indemnify, and hold harmless InternNova and its affiliates from and against claims, liabilities, damages, losses, and expenses arising out of your use of the platform, your submitted content, your violation of these Terms, or your infringement of any third-party rights.",
    ],
  },
  {
    id: "account-suspension-termination",
    title: "Account Suspension & Termination",
    paragraphs: [
      "InternNova may suspend, restrict, or terminate your access if we reasonably believe you have violated these Terms, misrepresented your identity or organization, engaged in fraudulent activity, or created risk for other users or the platform. We may also remove specific content or disable specific features pending investigation.",
      "You may stop using InternNova at any time. Termination of access does not automatically relieve you of obligations that arose before termination, including obligations related to content rights, indemnification, or misuse of the service.",
    ],
  },
  {
    id: "governing-law",
    title: "Governing Law",
    paragraphs: [
      "These Terms are governed by and construed in accordance with the laws applicable to the jurisdiction in which InternNova operates, without regard to conflict of law principles. Any disputes arising from these Terms or your use of the platform will be resolved in the courts having competent jurisdiction over that location, unless otherwise required by applicable law.",
    ],
  },
  {
    id: "changes-to-terms",
    title: "Changes to Terms",
    paragraphs: [
      "We may update these Terms from time to time to reflect product changes, legal developments, operational needs, or security requirements. When material changes are made, we may update the effective date and provide notice through the platform or by other reasonable means.",
      "Your continued use of InternNova after updated Terms become effective constitutes acceptance of those revised Terms.",
    ],
  },
  {
    id: "contact-information",
    title: "Contact Information",
    paragraphs: [
      "Questions about these Terms of Service, legal notices, or account-related concerns may be directed to InternNova at support@internnova.com. If you represent an employer account and need assistance with compliance or enterprise-related matters, please include your company name and account email in your request.",
    ],
  },
];

export default function TermsOfService() {
  return (
    <LegalDocumentPage
      title="Terms of Service | InternNova"
      description="Read InternNova's Terms of Service governing internship applications, employer dashboards, resume matching tools, account use, and platform responsibilities."
      path="/terms-of-service"
      effectiveDate="June 13, 2026"
      sections={sections}
    />
  );
}
