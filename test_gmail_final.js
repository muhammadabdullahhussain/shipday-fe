const nodemailer = require('nodemailer');
require('dotenv').config();

async function testGmail() {
    console.log('--- Testing Gmail SMTP Fallback ---');
    console.log(`Host: ${process.env.NOREPLY_SMTP_HOST}`);
    console.log(`User: ${process.env.NOREPLY_EMAIL}`);

    const transporter = nodemailer.createTransport({
        host: process.env.NOREPLY_SMTP_HOST,
        port: parseInt(process.env.NOREPLY_SMTP_PORT),
        secure: true,
        auth: {
            user: process.env.NOREPLY_EMAIL,
            pass: process.env.NOREPLY_EMAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('Verifying connection...');
        await transporter.verify();
        console.log('✅ Gmail SMTP Connected Successfully!');

        console.log('Sending test email...');
        const info = await transporter.sendMail({
            from: `"ShipDay support" <${process.env.FROM_EMAIL}>`,
            to: 'muhammadabdullahhussain639@gmail.com',
            subject: 'Gmail SMTP Working',
            text: 'This email confirms that the Gmail App Password configuration is working as a fallback.'
        });
        console.log('✅ Email Sent:', info.messageId);
    } catch (error) {
        console.error('❌ Gmail SMTP Failed:', error.message);
    }
}

testGmail();
