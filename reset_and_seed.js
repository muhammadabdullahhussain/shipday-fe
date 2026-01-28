const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const resetAndSeed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const collections = await mongoose.connection.db.collections();

        console.log('🧹 Clearing all collections...');
        for (let collection of collections) {
            await collection.deleteMany({});
            console.log(`   - Cleared: ${collection.collectionName}`);
        }
        console.log('✨ All data erased successfully.');

        // Seed Super Admin
        const email = 'admin@shipday.com';
        const password = 'Admin@12345';
        const role = 'Super Admin';

        const superAdmin = new User({
            email,
            password: await bcrypt.hash(password, 10),
            role,
            fullName: 'Super Admin',
            customerId: 'ADMIN001',
            location: {
                address: 'Headquarters'
            }
        });

        await superAdmin.save();
        console.log('👑 Super Admin seeded successfully:');
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Error during reset and seed:', err);
        process.exit(1);
    }
};

resetAndSeed();
