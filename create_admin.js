const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const createSuperAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const email = 'admin@shipday.com'; // Default admin email
        const password = 'Admin@12345'; // Default admin password
        const role = 'Super Admin';

        let user = await User.findOne({ email });

        if (user) {
            user.role = role;
            user.password = await bcrypt.hash(password, 10); // Update password to ensure it matches
            await user.save();
            console.log(`Updated existing user ${email} to ${role}`);
        } else {
            user = new User({
                email,
                password: await bcrypt.hash(password, 10),
                role,
                fullName: 'Super Admin',
                customerId: 'ADMIN001'
            });
            await user.save();
            console.log(`Created new user ${email} with role ${role}`);
        }

        console.log(`\ncredentials:\nEmail: ${email}\nPassword: ${password}\n`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createSuperAdmin();
