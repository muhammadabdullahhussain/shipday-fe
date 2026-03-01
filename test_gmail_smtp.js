const nodemailer = require('nodemailer');
require('dotenv').config();

async function testGmail() {
    console.log('--- Testing Gmail SMTP ---');
    console.log(`User: ${process.env.NOREPLY_EMAIL}`);
    
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.NOREPLY_EMAIL,
            pass: process.env.NOREPLY_EMAIL_PASS,
        },
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
            text: 'This email confirms that the Gmail App Password configuration is working.'
        });
        console.log('✅ Email Sent:', info.messageId);
    } catch (error) {
        console.error('❌ Gmail SMTP Failed:', error.message);
    }
}

testGmail();
