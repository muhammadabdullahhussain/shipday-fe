// utils/mail.js
const nodemailer = require("nodemailer");

/**
 * Mail utility using Gmail service (Old System)
 * To use another provider, change the 'service' or use 'host'/'port'.
 */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || 'support@shipday.co.za',
    pass: process.env.EMAIL_PASS, // User must provide Gmail App Password
  },
});

// Send mail function
const sendMail = async (to, subject, text, html = null) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'support@shipday.co.za',
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
    // Log details for debugging "kisi bhe haalat me"
    console.log("Details:", { to, subject, user: process.env.EMAIL_USER });
    throw new Error("Email could not be sent. Please check your EMAIL_PASS.");
  }
};

module.exports = sendMail;
