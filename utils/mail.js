// utils/mail.js
const nodemailer = require("nodemailer");

/**
 * Mail utility using ShipDay email service
 * Uses noreply@shipday.co.za for verification/notification emails
 */
// Send mail function
const sendMail = async (to, subject, text, html = null) => {
  const transporter = nodemailer.createTransport({
    host: process.env.NOREPLY_SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.NOREPLY_SMTP_PORT) || 465,
    secure: true, // true for 465
    pool: true,
    auth: {
      user: process.env.NOREPLY_EMAIL || 'codeforge0@gmail.com',
      pass: process.env.NOREPLY_EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 60000,
    greetingTimeout: 60000,
  });

  try {
    const mailOptions = {
      from: `"ShipDay" <${process.env.FROM_EMAIL || process.env.NOREPLY_EMAIL || 'noreply@shipday.co.za'}>`,
      to,
      subject,
      text,
      ...(html && { html }),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);

    // Fallback for Development: Log to console and file
    const isVerification = subject.toLowerCase().includes("verification");
    if (isVerification) {
      const codeMatch = text.match(/code is: (\w+)/);
      const code = codeMatch ? codeMatch[1] : "UNKNOWN";

      console.log("\n--- DEVELOPMENT FALLBACK ---");
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`VERIFICATION CODE: ${code}`);
      console.log("----------------------------\n");

      // Also write to a local file for easy retrieval
      try {
        const fs = require('fs');
        const path = require('path');
        const logPath = path.join(__dirname, '../temp_email.txt');
        const logContent = `[${new Date().toISOString()}] To: ${to} | Code: ${code}\n`;
        fs.appendFileSync(logPath, logContent);
      } catch (fsErr) {
        console.error("Failed to write to temp_email.txt:", fsErr.message);
      }

      // Even if fallback works, we still throw to inform the controller
      // but we add a specific flag or message
      throw new Error(`SMTP_FAIL_FALLBACK_OK:${code}`);
    }

    throw new Error(`Email could not be sent. Error: ${error.message}`);
  }
};

module.exports = sendMail;
