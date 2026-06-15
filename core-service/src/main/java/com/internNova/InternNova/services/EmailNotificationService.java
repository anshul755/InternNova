package com.internNova.InternNova.services;

import java.nio.charset.StandardCharsets;

import jakarta.mail.internet.InternetAddress;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(EmailNotificationService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.host:}")
    private String mailHost;

    @Value("${app.mail.from:InternNova <no-reply@internnova.com>}")
    private String mailFrom;

    @Value("${app.mail.force-configured-from:false}")
    private boolean forceConfiguredFrom;

    public void sendShortlistEmail(String studentEmail, String studentName, String jobTitle, String companyName) {
        String subject = "Congratulations! You have been shortlisted for " + jobTitle + " at " + companyName;
        String body = "Dear " + studentName + ",\n\n" +
                "We are thrilled to inform you that your application for the " + jobTitle +
                " position at " + companyName + " has been successfully shortlisted!\n\n" +
                "Our team was very impressed with your background and skills. We will be reaching out soon with the next steps in our recruitment process.\n\n" +
                "Congratulations again, and thank you for your interest in joining our team.\n\n" +
                "Best regards,\n" +
                companyName + " Hiring Team\n" +
                "Powered by InternNova";

        logEmail(studentEmail, subject, body, companyName);
    }

    public void sendRejectionEmail(String studentEmail, String studentName, String jobTitle, String companyName) {
        String subject = "Update on your application for " + jobTitle + " at " + companyName;
        String body = "Dear " + studentName + ",\n\n" +
                "Thank you for taking the time to apply for the " + jobTitle + " role at " + companyName + ".\n\n" +
                "While we were impressed with your qualifications, we have decided to move forward with other candidates whose profiles more closely align with our current needs for this specific position.\n\n" +
                "We encourage you to continue applying for future opportunities that match your skill set.\n\n" +
                "We wish you the best of luck in your career endeavors.\n\n" +
                "Sincerely,\n" +
                companyName + " Hiring Team\n" +
                "Powered by InternNova";

        logEmail(studentEmail, subject, body, companyName);
    }

    private void logEmail(String to, String subject, String body, String fromDisplayName) {
        if (mailSender != null && mailUsername != null && !mailUsername.isBlank()) {
            try {
                var message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(
                        message,
                        false,
                        StandardCharsets.UTF_8.name());
                helper.setTo(to);
                helper.setSubject(subject);
                helper.setText(body, false);
                helper.setFrom(resolveFromAddress(fromDisplayName));
                mailSender.send(message);
                logger.info("Email sent successfully to {}", to);
                return;
            } catch (Exception e) {
                logger.error("Failed to send email to {}, falling back to console log: {}", to, e.getMessage());
            }
        }

        logger.info("\n======================================================\n" +
                "SIMULATED EMAIL NOTIFICATION\n" +
                "To: {}\n" +
                "Subject: {}\n" +
                "------------------------------------------------------\n" +
                "{}\n" +
                "======================================================",
                to, subject, body);
    }

    private InternetAddress resolveFromAddress(String fromDisplayName) throws Exception {
        String configuredFrom = extractEmailAddress(mailFrom);
        String displayName = (fromDisplayName != null && !fromDisplayName.isBlank())
                ? fromDisplayName
                : extractDisplayName(mailFrom);
        if (isGmailSmtp() && !forceConfiguredFrom && !configuredFrom.equalsIgnoreCase(mailUsername)) {
            logger.warn(
                    "EMAIL_FROM ({}) does not match Gmail SMTP user; using SMTP_USER ({}) as sender",
                    configuredFrom,
                    mailUsername);
            return new InternetAddress(mailUsername, displayName);
        }
        String fromAddress = configuredFrom.isBlank() ? mailUsername : configuredFrom;
        return new InternetAddress(fromAddress, displayName);
    }

    private boolean isGmailSmtp() {
        return mailHost != null && mailHost.toLowerCase().contains("gmail");
    }

    private String extractEmailAddress(String value) {
        if (value == null) {
            return "";
        }
        String trimmed = value.trim();
        int start = trimmed.indexOf('<');
        int end = trimmed.indexOf('>');
        if (start >= 0 && end > start) {
            return trimmed.substring(start + 1, end).trim();
        }
        return trimmed.replace("\"", "").trim();
    }

    private String extractDisplayName(String value) {
        if (value == null) {
            return "InternNova";
        }
        String trimmed = value.trim().replace("\"", "");
        int start = trimmed.indexOf('<');
        if (start > 0) {
            String displayName = trimmed.substring(0, start).trim();
            return displayName.isBlank() ? "InternNova" : displayName;
        }
        return "InternNova";
    }
}
