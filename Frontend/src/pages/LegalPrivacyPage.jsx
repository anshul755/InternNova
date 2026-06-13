import LegalDocumentPage from "../components/LegalDocumentPage.jsx";

const sections = [
  {
    id: "information-we-collect",
    title: "Information We Collect",
    paragraphs: [
      "InternNova collects information necessary to operate an internship and recruitment platform for both talent and employer users. The categories of data we collect depend on how you interact with the platform, the features you use, and the information you choose to provide.",
    ],
  },
  {
    id: "personal-information",
    title: "Personal Information",
    paragraphs: [
      "When you create an account or interact with InternNova, we may collect personal information such as your name, email address, password credentials, phone number, educational details, and other identifiers you provide directly. Employer users may also provide company contact details and representative information associated with an organization account.",
    ],
  },
  {
    id: "profile-information",
    title: "Profile Information",
    paragraphs: [
      "Talent users may provide profile information including academic background, experience, skills, certifications, portfolio links, public profiles, career preferences, project history, and other information intended to support job matching and applications. Employer users may provide business descriptions, branding assets, locations, hiring team details, and company profile information used to present opportunities to candidates.",
    ],
  },
  {
    id: "resume-application-data",
    title: "Resume & Application Data",
    paragraphs: [
      "InternNova may collect resumes, cover letters, uploaded files, application answers, saved jobs, employer notes, interview-related updates, and other application workflow data. When talent users apply for roles, the materials they submit may be made available to the relevant employer or recruiting team as part of the hiring process.",
    ],
  },
  {
    id: "usage-analytics",
    title: "Usage Analytics",
    paragraphs: [
      "We may collect technical and usage data such as IP address, device characteristics, browser type, operating system, session activity, page views, click patterns, feature engagement, and diagnostic information. This helps us understand product performance, detect misuse, improve user experience, and maintain system reliability.",
    ],
  },
  {
    id: "cookies-tracking-technologies",
    title: "Cookies & Tracking Technologies",
    paragraphs: [
      "InternNova may use cookies, local storage, session storage, and similar technologies to remember login state, maintain preferences, support navigation, improve security, and analyze usage. Some of these technologies are necessary for core platform functionality, while others support measurement and product improvement.",
    ],
  },
  {
    id: "how-we-use-information",
    title: "How We Use Information",
    paragraphs: [
      "We use collected information to create and secure accounts, enable internship and job discovery, deliver employer dashboards, power resume matching and ATS assistance, process applications, personalize user experiences, provide customer support, prevent abuse, and comply with legal obligations.",
      "We may also use data to improve our matching systems, evaluate feature performance, troubleshoot technical issues, and develop new recruiting or career-support capabilities within the platform.",
    ],
  },
  {
    id: "data-sharing-practices",
    title: "Data Sharing Practices",
    paragraphs: [
      "InternNova does not sell personal information in a manner inconsistent with this Policy. We may share information with employers when talent users apply for opportunities or otherwise direct us to share their profile or resume data in connection with a recruiting workflow.",
      "We may also share information with service providers, infrastructure partners, analytics vendors, security providers, and other processors who support platform operations under appropriate contractual or operational safeguards.",
    ],
  },
  {
    id: "third-party-services",
    title: "Third-Party Services",
    paragraphs: [
      "The platform may integrate with or link to third-party tools and services, including hosting providers, analytics solutions, authentication services, file storage systems, and external websites such as LinkedIn or GitHub. Their handling of data is governed by their own privacy practices, and InternNova is not responsible for third-party policies or content.",
    ],
  },
  {
    id: "data-security",
    title: "Data Security",
    paragraphs: [
      "InternNova uses reasonable administrative, technical, and organizational measures to protect personal information against unauthorized access, disclosure, loss, misuse, or alteration. However, no online service or storage environment can be guaranteed to be completely secure, and users should also take steps to protect their own accounts and devices.",
    ],
  },
  {
    id: "data-retention",
    title: "Data Retention",
    paragraphs: [
      "We retain information for as long as necessary to provide the service, maintain account history, support application workflows, fulfill legal obligations, resolve disputes, enforce agreements, and protect the integrity of the platform. Retention periods may vary depending on the type of data, the nature of the account, and operational or legal requirements.",
    ],
  },
  {
    id: "user-rights",
    title: "User Rights",
    paragraphs: [
      "Depending on your jurisdiction, you may have rights regarding access to your personal information, correction of inaccurate data, restriction of processing, objection to certain uses, portability requests, or deletion of account-related information. We will consider and respond to such requests in accordance with applicable law and operational constraints.",
    ],
  },
  {
    id: "account-deletion-process",
    title: "Account Deletion Process",
    paragraphs: [
      "If you would like to request deletion of your InternNova account, you may contact support using the contact information below or use account-management tools if and when they are made available. Certain records may be retained after deletion requests where necessary for security, fraud prevention, legal compliance, dispute resolution, or legitimate business recordkeeping.",
    ],
  },
  {
    id: "childrens-privacy",
    title: "Children's Privacy",
    paragraphs: [
      "InternNova is not intended for children under the age at which they can lawfully consent to data processing in the relevant jurisdiction, and we do not knowingly collect personal information from children in violation of applicable law. If you believe a child has submitted information improperly, please contact us so that we can review and address the situation.",
    ],
  },
  {
    id: "international-data-transfers",
    title: "International Data Transfers",
    paragraphs: [
      "InternNova may process or store information in jurisdictions other than the country in which you reside, including through third-party infrastructure and service providers. Where applicable, we take reasonable steps to ensure that cross-border data handling is subject to appropriate safeguards consistent with applicable law.",
    ],
  },
  {
    id: "changes-to-privacy-policy",
    title: "Changes to Privacy Policy",
    paragraphs: [
      "We may update this Privacy Policy from time to time to reflect changes in our services, security practices, legal obligations, or business operations. When material changes are made, we may revise the effective date and provide notice through the platform or other appropriate communication channels.",
    ],
  },
  {
    id: "contact-information",
    title: "Contact Information",
    paragraphs: [
      "For privacy-related questions, account data requests, or concerns about how information is handled on InternNova, please contact support@internnova.com. To help us process your request efficiently, include the email address associated with your account and a brief description of your concern.",
    ],
  },
];

export default function LegalPrivacyPage() {
  return (
    <LegalDocumentPage
      title="Privacy Policy | InternNova"
      description="Read how InternNova collects, uses, shares, protects, and retains data across internship applications, employer workflows, talent profiles, and resume matching features."
      path="/privacy-policy"
      effectiveDate="June 13, 2026"
      sections={sections}
    />
  );
}
