package com.internNova.InternNova.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(EmailNotificationService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendShortlistEmail(String studentEmail, String studentName, String jobTitle, String companyName) {
        String subject = "Congratulations! You have been shortlisted for " + jobTitle + " at " + companyName;
        String body = "Dear " + studentName + ",\n\n" +
                "We are thrilled to inform you that your application for the " + jobTitle + 
                " position at " + companyName + " has been successfully shortlisted!\n\n" +
                "Our team was very impressed with your background and skills. We will be reaching out soon with the next steps in our recruitment process.\n\n" +
                "Congratulations again, and thank you for your interest in joining our team.\n\n" +
                "Best regards,\n" +
                companyName + " Recruitment Team\n" +
                "Powered by InternNova";

        logEmail(studentEmail, subject, body);
    }

    public void sendRejectionEmail(String studentEmail, String studentName, String jobTitle, String companyName) {
        String subject = "Update on your application for " + jobTitle + " at " + companyName;
        String body = "Dear " + studentName + ",\n\n" +
                "Thank you for taking the time to apply for the " + jobTitle + " role at " + companyName + ".\n\n" +
                "While we were impressed with your qualifications, we have decided to move forward with other candidates whose profiles more closely align with our current needs for this specific position.\n\n" +
                "We encourage you to continue applying for future opportunities that match your skill set.\n\n" +
                "We wish you the best of luck in your career endeavors.\n\n" +
                "Sincerely,\n" +
                companyName + " Recruitment Team\n" +
                "Powered by InternNova";

        logEmail(studentEmail, subject, body);
    }

    private void logEmail(String to, String subject, String body) {
        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(to);
                message.setSubject(subject);
                message.setText(body);
                message.setFrom("InternNova <no-reply@internnova.com>");
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
}
