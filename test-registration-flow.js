require('dotenv').config();
const mongoose = require('mongoose');
const { requestVerificationCode, registerUser } = require('./controller/auth');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// A quick script to simulate the entire process against the actual running server.
const testRegistration = async () => {
    const email = 'alihussain2alikhan123@gmail.com';
    const password = 'Password321!';

    // 1. request verification code
    console.log('Requesting verification code...');
    const res1 = await fetch('http://localhost:5000/api/auth/verification/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'register' })
    });
    const data1 = await res1.json();
    console.log('Request code response:', res1.status, data1);

    let verificationCode = data1.dev_code;

    if (!verificationCode) {
        // try to fetch it from DB directly if dev_code wasn't returned
        mongoose.connect('mongodb+srv://admin:admin123@cluster0.p4dmt.mongodb.net/swiftship?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
            .then(async () => {
                const VerificationCode = require('./models/VerificationCode');
                const vc = await VerificationCode.findOne({ email });
                console.log('Code in DB:', vc.code);

                // 2. Register
                console.log('Registering user...');
                const res2 = await fetch('http://localhost:5000/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, code: vc.code })
                });
                const data2 = await res2.json();
                console.log('Register response:', res2.status, data2);
                process.exit(0);
            });
    } else {
        // 2. Register
        console.log('Registering user with dev_code:', verificationCode);
        const res2 = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, code: verificationCode })
        });
        const data2 = await res2.json();
        console.log('Register response:', res2.status, data2);
    }
};

testRegistration();
