require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        console.log('Connected to MongoDB');

        const user = new User({
            email: "test_email@example.com",
            password: "some_hashed_password",
            customerId: "CUST999",
        });

        try {
            await user.save();
            console.log('User saved successfully');
        } catch (e) {
            console.error('Error saving user:', e);
        }

        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
