require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        const user = await User.findOne({ email: 'alihussain2alikhan@gmail.com' });
        console.log('User found:', user);
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
