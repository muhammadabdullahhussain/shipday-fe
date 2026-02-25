// utils/mail.js
const nodemailer = require("nodemailer");

/**
 * Mail utility using ShipDay email service
 * Uses noreply@shipday.co.za for verification/notification emails
 */
const transporter = nodemailer.createTransport({
  host: process.env.NOREPLY_SMTP_HOST || 'epic.aserv.co.za',
  port: parseInt(process.env.NOREPLY_SMTP_PORT) || 465,
  secure: process.env.NOREPLY_SMTP_SECURE === 'true' || true, // true for 465, false for other ports
  auth: {
    user: process.env.NOREPLY_EMAIL || 'noreply@shipday.co.za',
    pass: process.env.NOREPLY_EMAIL_PASS,
  },
});

// Send mail function
const sendMail = async (to, subject, text, html = null) => {
  try {
    const mailOptions = {
      from: `"ShipDay" <${process.env.NOREPLY_EMAIL || 'noreply@shipday.co.za'}>`,
      to,
      subject,
      text,
      ...(html && { html }),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    // Log details for debugging
    console.error("Details:", {
      to,
      subject,
      user: process.env.NOREPLY_EMAIL,
      host: process.env.NOREPLY_SMTP_HOST,
      port: process.env.NOREPLY_SMTP_PORT,
      errorMsg: error.message,
      errorStack: error.stack
    });
    if (error.response) {
      console.error("SMTP Response:", error.response);
    }
    throw new Error(`Email could not be sent. Check logs. Error: ${error.message}`);
  }
};

module.exports = sendMail;
