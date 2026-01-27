const mongoose = require('mongoose');
require('dotenv').config();
const Shipment = require('./models/Shipment');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        try {
            const trackingNumber = 'SHP179985';
            const existing = await Shipment.findOne({ trackingNumber });
            if (existing) {
                console.log(`✅ Shipment ${trackingNumber} already exists.`);
                process.exit(0);
            }

            await Shipment.create({
                shipmentId: trackingNumber,
                trackingNumber: trackingNumber,
                status: 'Shipping',
                senderDetails: {
                    fullName: 'ShipDay Headquarters',
                    company: 'ShipDay',
                    address: { city: 'Cape Town' }
                },
                deliveryDetails: {
                    receiverName: 'Valued Customer',
                    address: { city: 'Johannesburg' }
                },
                collectionDetails: {
                    address: { city: 'Cape Town' }
                },
                start: 'Cape Town',
                end: 'Johannesburg',
                orders: [],
                dateShipped: new Date()
            });

            console.log(`✅ Created shipment ${trackingNumber}`);
            process.exit(0);
        } catch (err) {
            console.error(err);
            process.exit(1);
        }
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
