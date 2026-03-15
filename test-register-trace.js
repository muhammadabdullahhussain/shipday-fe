require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const sendMail = require('./utils/mail');

const sanitizedEmail = 'alihussain2alikhan@gmail.com';
const password = 'Password123!';

const generateCustomerId = async () => {
    const count = await User.countDocuments({ customerId: /^CUST/ });
    const nextNumber = count + 1;
    const padded = String(nextNumber).padStart(3, '0');
    return `CUST${padded}`;
};

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        try {
            console.log('Generating customer ID');
            const customerId = await generateCustomerId();
            console.log('Hashing password');
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = new User({
                email: sanitizedEmail,
                password: hashedPassword,
                customerId,
            });

            console.log('Saving user');
            await user.save();
            console.log('User saved successfully');

            console.log('Sending email');
            await sendMail(
                "support@shipday.co.za",
                "New User Registration",
                `A new user has registered with email: ${sanitizedEmail}`
            );
            console.log('Email sent successfully');

        } catch (e) {
            console.error('Error occurred:', e);
        }

        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
