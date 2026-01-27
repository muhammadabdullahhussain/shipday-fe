const Contact = require('../models/Contact');

const nodemailer = require('nodemailer');

exports.submitContactForm = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ message: "Please fill all required fields" });
        }

        const newContact = new Contact({
            name,
            email,
            subject,
            message
        });

        await newContact.save();

        // Attempt to send email notification using unified mail utility
        try {
            const sendMail = require('../utils/mail');
            const supportEmail = process.env.SUPPORT_EMAIL || 'support@shipday.co.za';

            const subjectLine = `New Contact Form Submission: ${subject}`;
            const textContent = `Name: ${name}\nEmail: ${email}\nMessage: ${message}`;
            const htmlContent = `
                <div style="background-color: #f8fafc; padding: 40px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #e2e8f0;">
                        <!-- Header Bar -->
                        <div style="background-color: #0f172a; padding: 30px; border-bottom: 4px solid #fabb05; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 2px;">CONTACT TERMINAL</h1>
                            <p style="color: #fabb05; margin: 5px 0 0 0; font-size: 12px; font-weight: 700; letter-spacing: 4px; text-transform: uppercase;">NEW INBOUND SIGNAL</p>
                        </div>
                        
                        <!-- Main Content -->
                        <div style="padding: 40px;">
                            <div style="display: flex; align-items: start; margin-bottom: 30px;">
                                <div style="flex: 1;">
                                    <p style="color: #94a3b8; font-size: 11px; font-weight: 800; margin: 0 0 10px 0; letter-spacing: 1px; text-transform: uppercase;">Sender Identity</p>
                                    <p style="color: #0f172a; font-size: 18px; font-weight: 700; margin: 0;">${name}</p>
                                    <p style="color: #64748b; font-size: 14px; margin: 5px 0 0 0;">${email}</p>
                                </div>
                            </div>
                            
                            <div style="margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9;">
                                <p style="color: #94a3b8; font-size: 11px; font-weight: 800; margin: 0 0 10px 0; letter-spacing: 1px; text-transform: uppercase;">Subject Protocol</p>
                                <p style="color: #0f172a; font-size: 16px; font-weight: 600; margin: 0;">${subject}</p>
                            </div>
                            
                            <div>
                                <p style="color: #94a3b8; font-size: 11px; font-weight: 800; margin: 0 0 15px 0; letter-spacing: 1px; text-transform: uppercase;">Message Payload</p>
                                <div style="background-color: #f8fafc; border-left: 4px solid #0f172a; padding: 25px; border-radius: 8px;">
                                    <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Footer -->
                        <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="color: #94a3b8; font-size: 12px; margin: 0;">This is an automated notification from the ShipDay CRM Node.</p>
                        </div>
                    </div>
                </div>
            `;

            await sendMail(supportEmail, subjectLine, textContent, htmlContent);
            console.log('Contact form email sent successfully');
        } catch (emailError) {
            console.error("Failed to send contact email:", emailError);
        }

        res.status(201).json({
            success: true,
            message: "Your message has been received. We will get back to you shortly."
        });
    } catch (error) {
        console.error("❌ Error submitting contact form:", error);
        res.status(500).json({ message: "Server error, please try again later" });
    }
};

exports.getAllMessages = async (req, res) => {
    try {
        const messages = await Contact.find().sort({ createdAt: -1 });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch messages" });
    }
};
