require('dotenv').config();
const mongoose = require('mongoose');
const VerificationCode = require('./models/VerificationCode');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        console.log('Connected to MongoDB');
        const codes = await VerificationCode.find({});
        console.log('Codes in DB:', codes);
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
