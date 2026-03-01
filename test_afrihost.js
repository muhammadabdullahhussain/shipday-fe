const nodemailer = require('nodemailer');

async function testAfrihost() {
    console.log('--- Testing Afrihost SMTP ---');
    console.log('Host: epic.aserv.co.za');
    console.log('User: noreply@shipday.co.za');
    console.log('Pass: Bokang@2026#');

    const transporter = nodemailer.createTransport({
        host: 'epic.aserv.co.za',
        port: 465,
        secure: true,
        auth: {
            user: 'noreply@shipday.co.za',
            pass: 'Bokang@2026#',
        },
        tls: {
            rejectUnauthorized: false
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
    });

    try {
        console.log('Verifying connection...');
        await transporter.verify();
        console.log('✅ Afrihost SMTP Connected Successfully!');
    } catch (error) {
        console.error('❌ Afrihost SMTP Failed:', error.message);

        console.log('\nTrying Port 587...');
        const transporter587 = nodemailer.createTransport({
            host: 'epic.aserv.co.za',
            port: 587,
            secure: false,
            auth: {
                user: 'noreply@shipday.co.za',
                pass: 'Bokang@2026#',
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        try {
            await transporter587.verify();
            console.log('✅ Afrihost SMTP Connected on Port 587!');
        } catch (err2) {
            console.error('❌ Afrihost SMTP Port 587 also failed:', err2.message);
        }
    }
}

testAfrihost();
