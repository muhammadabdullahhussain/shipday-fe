const nodemailer = require('nodemailer');
require('dotenv').config();

async function sendTestEmail() {
    console.log("Starting email test...");
    console.log("Using Host:", process.env.SMTP_HOST);
    console.log("Using User:", process.env.SMTP_USER);

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        const info = await transporter.sendMail({
            from: `"ShipDay Test" <${process.env.SMTP_USER}>`,
            to: process.env.SUPPORT_EMAIL || 'support@shipday.co.za',
            subject: "ShipDay System Test: SMTP Verification",
            text: "Hello! This is a test email from the ShipDay Courier system. If you received this, your Brevo SMTP configuration is working perfectly.",
            html: "<h3>ShipDay Courier System</h3><p>Hello! This is a <b>test email</b> from the ShipDay Courier system.</p><p>If you received this, your <b>Brevo SMTP configuration</b> is working perfectly.</p>",
        });

        console.log("✅ Email sent successfully!");
        console.log("Message ID:", info.messageId);
    } catch (error) {
        console.error("❌ Failed to send email:");
        console.error(error);
    }
}

sendTestEmail();
